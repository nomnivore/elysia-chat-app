import { Elysia } from "elysia";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import * as schema from "./schema";

const sqlite = new Database("local.db");
const db = drizzle(sqlite, { schema });

export default (app: Elysia) => app.state("db", db);
