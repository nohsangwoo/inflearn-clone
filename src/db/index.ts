import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

declare global {
  var __lingoostSql: postgres.Sql | undefined;
}

let cachedDb: ReturnType<typeof createDb> | undefined;
let cachedSql: postgres.Sql | undefined;

function createClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required for Drizzle");
  }

  const client = postgres(connectionString, {
    max: 10,
    prepare: false,
  });

  if (process.env.NODE_ENV !== "production") {
    globalThis.__lingoostSql = client;
  }

  return client;
}

export function getSql() {
  if (!cachedSql) {
    cachedSql = globalThis.__lingoostSql ?? createClient();
  }

  return cachedSql;
}

function createDb() {
  return drizzle(getSql(), { schema });
}

export function getDb() {
  cachedDb ??= createDb();
  return cachedDb;
}

export const db = new Proxy({} as ReturnType<typeof createDb>, {
  get(_target, prop, receiver) {
    const target = getDb();
    const value = Reflect.get(target, prop, receiver);
    return typeof value === "function" ? value.bind(target) : value;
  },
});

export const sql = new Proxy((() => getSql()) as unknown as postgres.Sql, {
  get(_target, prop, receiver) {
    const target = getSql();
    const value = Reflect.get(target, prop, receiver);
    return typeof value === "function" ? value.bind(target) : value;
  },
  apply(_target, thisArg, argArray) {
    return Reflect.apply(getSql() as unknown as (...args: unknown[]) => unknown, thisArg, argArray);
  },
});

export * from "./schema";
