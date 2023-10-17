import { ElysiaBase } from ".";
import { t, type Context } from "elysia";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";

export default (app: ElysiaBase) => {
  return app
    .derive(async ({ jwt }) => {
      return {
        authFromToken: async function (token?: string) {
          const decoded = await jwt.verify(token);

          if (decoded) {
            return {
              isAuthed: true as true,
              user: { name: decoded.name, id: decoded.id },
            };
          }

          return { isAuthed: false as false };
        },
      };
    })
    .derive(async ({ bearer, authFromToken }) => {
      // automaically authenticate from bearer token (if exists)
      return { auth: await authFromToken(bearer) };
    })
    .group("/auth", (app) => {
      return app
        .get(
          "/me",
          ({ auth }) => {
            // return user info here
            return {
              name: auth.user?.name as string,
              id: auth.user?.name as string,
            };
          },
          {
            beforeHandle: ({ auth, set }) => {
              if (!auth.isAuthed) {
                set.status = 401;
                return;
              }
            },
          },
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
                    console.log(user, isMatch);
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
};
