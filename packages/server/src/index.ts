import { App } from "./app";
export type { ElysiaAPI } from "./app";

const app = App().listen(3000, (srv) => {
  const url = `http://${srv.hostname}:${srv.port}`;
  console.log(`🔷 Elysia is listening on ${srv.hostname}:${srv.port}`);
  console.log(`🔷 Swagger docs are available at ${url}/swagger`);
});
