import { ElysiaBase } from ".";
import { t } from "elysia";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";

export default (app: ElysiaBase) => {
  return app
    .derive(async ({ bearer, jwt }) => {
      // check headers for bearer token (jwt)
      const token = await jwt.verify(bearer);

      if (token) {
        if (Object.hasOwn(token, "name") && Object.hasOwn(token, "id")) {
          // TODO: extract token type and create a type guard
          return {
            auth: {
              isAuthed: true as true,
              user: { name: token.name, id: token.id },
            },
          };
        }
      }

      return { auth: { isAuthed: false as false } };
    })
    .group("/auth", (app) => {
      return app
        .get(
          "/me",
          ({ auth, store }) => {
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
          }
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
                }
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
                    user?.passwordHash || ""
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
                }
              )
              .delete("/me", async ({ auth, set, store: { db } }) => {
                if (!auth.isAuthed) {
                  return (set.status = 401);
                }

                // TODO: require password to delete account

                const deleted = (
                  await db
                    .delete(users)
                    .where(eq(users.id, auth.user.id))
                    .returning()
                )[0];
                if (deleted) {
                  set.status = 200;
                  return;
                }
              });
          }
        );
    });
};
