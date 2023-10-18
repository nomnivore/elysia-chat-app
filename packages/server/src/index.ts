import { Elysia, t } from "elysia";
import db from "./db";
import auth from "./auth";
import jwt from "@elysiajs/jwt";
import bearer from "@elysiajs/bearer";
import swagger from "@elysiajs/swagger";
import chatrooms from "./chatrooms";
import { logger } from "@grotto/logysia";

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
    }),
  )
  .use(
    jwt({
      name: "jwt",
      secret: Bun.env.JWT_SECRET || "secret", // TODO: type-check env
      schema: t.Object({
        name: t.String(),
        id: t.String(),
      }),
      exp: "1w",
    }),
  )
  .use(bearer())
  .use(db)
  .use(logger());

export type ElysiaBase = typeof appBase;

// register plugins
const appWithPlugins = appBase.use(auth);

export type ElysiaPlugins = typeof appWithPlugins;

const app = appWithPlugins
  .use(chatrooms)
  .onError((err) => {
    console.log(err);
  })
  .listen(3000, (srv) => {
    const url = `http://${srv.hostname}:${srv.port}`;
    console.log(`🔷 Elysia is listening on ${srv.hostname}:${srv.port}`);
    console.log(`🔷 Swagger docs are available at ${url}/swagger`);
  });

export type ElysiaAPI = typeof app;
