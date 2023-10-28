import { Elysia, t } from "elysia";
import auth from "./auth";
import swagger from "@elysiajs/swagger";
import chatrooms from "./routes/chatrooms";
import { logger } from "@grotto/logysia";
import cors from "@elysiajs/cors";
import account from "./routes/account";

// register base modules
export function App() {
  return (
    new Elysia()
      .use(cors())
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
      .use(logger())
      .use(auth())
      // routes
      .use(account())
      .use(chatrooms())
      .onError((err) => {
        console.log(err);
      })
  );
}

export type ElysiaAPI = ReturnType<typeof App>;
