import { Elysia, t } from "elysia";
import db from "./db";
import auth from "./auth";
import jwt from "@elysiajs/jwt";
import bearer from "@elysiajs/bearer";
import swagger from "@elysiajs/swagger";

// register base modules
const appBase = new Elysia()
  .use(
    swagger({
      documentation: {
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
              description: "Enter the token with the 'Bearer ' prefix",
            },
          },
        },
        security: [{ bearerAuth: [] }],
      },
    })
  )
  .use(
    jwt({
      name: "jwt",
      secret: Bun.env.JWT_SECRET || "secret", // TODO: type-check env
    })
  )
  .use(bearer())
  .use(db);

export type ElysiaBase = typeof appBase;

// register plugins
const appWithPlugins = appBase.use(auth);

export type ElysiaPlugins = typeof appWithPlugins;

appWithPlugins.listen(3000, (srv) => {
  console.log(`🔷 Elysia is listening on ${srv.hostname}:${srv.port}`);
});
