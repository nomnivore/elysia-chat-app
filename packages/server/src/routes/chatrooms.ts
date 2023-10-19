import { Elysia, t, Static } from "elysia";
import db from "../db";
import auth from "../auth";

const tMessage = t.Object({ message: t.String() });
const tToken = t.Object({ accessToken: t.String() });
const tpayload = t.Union([tMessage, tToken]);

type Token = Static<typeof tToken>;
type Message = Static<typeof tMessage>;

function isToken(payload: Token | Message): payload is Token {
  // message takes precedence
  return (
    (payload as Token).accessToken !== undefined &&
    (payload as Message).message === undefined
  );
}

// one "global" chatroom for now
// TODO: implement chatrooms
export default function () {
  return new Elysia()
    .use(db())
    .use(auth())
    .ws("/chat/ws", {
      body: tpayload,
      response: t.Object({ name: t.String(), message: t.String() }),
      open: (ws) => {
        // require authentication from users
        if (!ws.data.auth.isAuthed) {
          ws.send({ name: "x", message: "NOT_AUTHENTICATED" });
        }
      },
      message: async (ws, payload) => {
        if (isToken(payload)) {
          const { authFromToken } = ws.data;

          const auth = await authFromToken(payload.accessToken);

          ws.data.auth = auth;

          if (auth.isAuthed) {
            ws.subscribe("global");
            ws.send({ name: "x", message: "AUTHENTICATED" });
            return;
          } else {
            ws.send({ name: "x", message: "TOKEN_INVALID" });
            return;
          }
        }

        const { auth } = ws.data;

        if (!auth.isAuthed) {
          ws.send({ name: "x", message: "NOT_AUTHENTICATED" });
          return;
        }

        ws.publish("global", {
          name: auth.user.name,
          message: payload.message,
        });
        // echo
        ws.send({ name: auth.user.name, message: payload.message });
      },

      close: () => {
        console.log("ws closed");
      },
    });
}
