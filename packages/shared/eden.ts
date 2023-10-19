import { edenTreaty } from "@elysiajs/eden";
import type { ElysiaAPI } from "server";

export const eden = (url: string) => edenTreaty<ElysiaAPI>(url);
