import { Elysia, t } from "elysia";
import auth from "../auth";
import db from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export default function () {
  return new Elysia()
    .use(auth())
    .use(db())
    .group("/auth", (app) => {
      return app
        .get(
          "/me",
          async ({ auth, set }) => {
            if (!auth.isAuthed) {
              set.status = 401;
            }
            // return user info here
            if (auth.isAuthed)
              return {
                name: auth.user.name,
                id: auth.user.name,
              };
          },
          // {
          //   beforeHandle: ({ auth, set }) => {
          //     if (!auth.isAuthed) {
          //       set.status = 401;
          //       return { message: "Unauthorized" };
          //     }
          //   },
          // },
        )
        .guard(
          {
            body: t.Object({
              name: t.String({ minLength: 3 }),
              password: t.String({ minLength: 8 }),
            }),
          },
          (app) => {
            return app
              .post(
                "/register",
                async ({ body: { name, password }, set, store: { db } }) => {
                  // check if user already exists
                  const user = await db.query.users.findFirst({
                    where: (user, { eq }) => eq(user.name, name),
                  });

                  if (user) {
                    set.status = 409; // conflict
                    return;
                  }

                  // create user
                  const hashedPassword = await Bun.password.hash(password, {
                    algorithm: "bcrypt",
                    cost: 10,
                  });

                  await db.insert(users).values({
                    name,
                    passwordHash: hashedPassword,
                  });

                  set.status = 201;
                },
              )
              .post(
                "/login",
                async ({
                  jwt,
                  body: { name, password },
                  set,
                  store: { db },
                }) => {
                  const user = (
                    await db
                      .select()
                      .from(users)
                      .where(eq(users.name, name))
                      .limit(1)
                  )[0];

                  const isMatch = await Bun.password.verify(
                    password,
                    user?.passwordHash || "",
                  );

                  if (!user || !isMatch) {
                    set.status = 401;
                    return;
                  }

                  const token = await jwt.sign({
                    name: user.name,
                    id: user.id,
                  });

                  set.status = 200;
                  return { token };
                },
              )
              .delete(
                "/me",
                async ({ body: { password }, auth, set, store: { db } }) => {
                  if (!auth.isAuthed) {
                    return (set.status = 401);
                  }

                  const user = (
                    await db
                      .select()
                      .from(users)
                      .where(eq(users.id, auth.user.id))
                      .limit(1)
                  )[0];

                  if (!user) {
                    set.status = 404;
                    return;
                  }

                  // verify password

                  const isMatch = await Bun.password.verify(
                    password,
                    user.passwordHash,
                  );

                  if (!isMatch) {
                    set.status = 401;
                    return;
                  }

                  const deleted = (
                    await db
                      .delete(users)
                      .where(eq(users.id, user.id))
                      .returning()
                  )[0];

                  if (deleted) {
                    set.status = 200;
                    return;
                  }
                },
                { body: t.Object({ password: t.String() }) },
              );
          },
        );
    });
}
