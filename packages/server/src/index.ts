import { Elysia, t } from "elysia";
import { randomUUID } from "crypto";

const PORT = 3000;

const app = new Elysia();

app
  .state("users", {} as Record<string, string[]>)
  .ws("/ws", {
    body: t.String(),
    cookie: t.Cookie({
      clientId: t.Cookie({}),
    }),
    query: t.Object({
      roomId: t.String(),
    }),

    beforeHandle: ({ store, cookie, query }) => {
      const uid = randomUUID();
      console.log("beforeHandle");
      store.users[uid] = [query.roomId];
      cookie.clientId.set({
        httpOnly: true,
        value: uid,
      });
    },

    open: (ws) => {
      // not sure if 'set' is the best place to get cookies back from
      // is there any chance it could be in ws.data.cookie instead? so far it is in set

      const clientId = ws.data.set.cookie?.clientId.value;
      if (!clientId) {
        console.log("cookie not found");
        ws.close();
        return;
      }
      ws.data.store.users[clientId].forEach((room) => ws.subscribe(room));
      console.log(`user id { ${clientId} } has connected`);
    },

    message: (ws, msg) => {
      const clientId = ws.data.set.cookie?.clientId.value;
      console.log(`msg from { ${clientId} }: ${msg}`);
      if (!clientId) {
        console.log("cookie not found");
        ws.close();
        return;
      }
      ws.data.store.users[clientId].forEach((room) => ws.publish(room, msg));
    },

    close: (ws) => {
      const clientId = ws.data.set.cookie?.clientId.value;
      if (!clientId) {
        // orphaned user entries in the store?
        return;
      }

      // is this needed?
      ws.data.store.users[clientId].forEach((room) => ws.unsubscribe(room));
    },

    error: (ws) => {
      console.log(ws.error.message);
    },
  })

  .listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
