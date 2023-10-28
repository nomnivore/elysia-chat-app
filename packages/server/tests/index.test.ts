import { describe, expect, it } from "bun:test";
import { App } from "../src/app";
import Elysia from "elysia";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import * as schema from "../src/db/schema";
import Database from "bun:sqlite";
import path from "path";

// this should override the default db state
// and use an in-memory version of our database
// is there a better way run migrations?
const db_test = () => {
  const sqlite = new Database(":memory:");

  const db = drizzle(sqlite, { schema });

  migrate(db, { migrationsFolder: path.join(import.meta.dir, "../drizzle/") });

  return new Elysia({ name: "db_test" }).state("db", db);
};

describe("Elysia", () => {
  it("can receive http requests", async () => {
    const res = await App().handle(new Request("http://localhost/auth/me"));

    expect(res.status).toBe(401);
  });

  it("can register a new user", async () => {
    const dbapp = App().use(db_test());

    const res = await dbapp.handle(
      new Request("http://localhost/auth/register", {
        method: "post",
        body: JSON.stringify({ name: "testing", password: "testingy" }),
        headers: { "Content-Type": "application/json" },
      }),
    );

    expect(res.status).toBe(201);
    console.log(res.status);
  });
});
