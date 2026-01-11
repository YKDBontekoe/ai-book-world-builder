import "server-only";

import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import * as pgSchema from "@/lib/db/schema";
import * as sqliteSchema from "@/lib/db/schema/sqlite";

export type DbDriver = "postgres" | "sqlite";

const dbDriver = (
	process.env.DB_DRIVER ?? "postgres"
).toLowerCase() as DbDriver;

if (dbDriver !== "postgres" && dbDriver !== "sqlite") {
	throw new Error(`Unsupported DB_DRIVER value: ${dbDriver}`);
}

const isServer = typeof window === "undefined";

if (!isServer) {
	throw new Error("Database client initialized in a browser context.");
}

const filteredPgSchema = Object.fromEntries(
	Object.entries(pgSchema).filter(([_, value]) => value != null),
);

const filteredSqliteSchema = Object.fromEntries(
	Object.entries(sqliteSchema).filter(([_, value]) => value != null),
);

type PgDb = PostgresJsDatabase<typeof pgSchema>;
type SqliteDb = BetterSQLite3Database<typeof sqliteSchema>;

// We use an intersection but omit the private 'fullSchema' property which causes conflicts
// between different Drizzle dialects in the type system.
export type AppDb = Omit<PgDb, "fullSchema"> & Omit<SqliteDb, "fullSchema">;

const createPostgresDb = async (): Promise<PgDb> => {
	const url = process.env.POSTGRES_URL;

	if (!url) {
		if (process.env.NODE_ENV === "production") {
			console.warn(
				"POSTGRES_URL is not defined. Using dummy connection for build/CI.",
			);
			const [{ drizzle }, { default: postgres }] = await Promise.all([
				import("drizzle-orm/postgres-js"),
				import("postgres"),
			]);
			const client = postgres(
				"postgres://placeholder:placeholder@localhost:5432/placeholder",
			);
			return drizzle(client, { schema: filteredPgSchema as typeof pgSchema });
		}
		throw new Error("POSTGRES_URL is not defined");
	}

	const [{ drizzle }, { default: postgres }] = await Promise.all([
		import("drizzle-orm/postgres-js"),
		import("postgres"),
	]);

	const client = postgres(url);
	return drizzle(client, { schema: filteredPgSchema as typeof pgSchema });
};

const createSqliteDb = async (): Promise<SqliteDb> => {
	const sqlitePath = process.env.SQLITE_DB_PATH ?? ".local/dev.sqlite";

	const [{ drizzle }, { default: Database }] = await Promise.all([
		import("drizzle-orm/better-sqlite3"),
		import("better-sqlite3"),
	]);

	const client = new Database(sqlitePath);
	client.pragma("journal_mode = WAL");

	return drizzle(client, {
		schema: filteredSqliteSchema as typeof sqliteSchema,
	});
};

// Cast to any to avoid dialect-specific type mismatches when using generic repositories
export const db = (await (dbDriver === "sqlite"
	? createSqliteDb()
	: createPostgresDb())) as AppDb & any;

export type DbTransaction = Parameters<Parameters<AppDb["transaction"]>[0]>[0];
export { dbDriver };
