import { Elysia } from "elysia";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import * as schema from "./schema";

export const db = () => {
  const sqlite = new Database("local.db");
  return new Elysia({ name: "db" }).state("db", drizzle(sqlite, { schema }));
};

export default db;
