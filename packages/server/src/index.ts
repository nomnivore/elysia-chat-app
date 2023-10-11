import { Elysia } from "elysia";

const app = new Elysia()
  .get("/", () => {
    console.log("Hello, Elysia!");

    return "Hello, Elysia!";
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
