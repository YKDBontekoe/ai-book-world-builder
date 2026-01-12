/**
 * @vitest-environment node
 */
import { describe, expect, it, vi } from "vitest";

vi.unmock("@/lib/db");

// Mock database drivers to avoid native binding errors
vi.mock("better-sqlite3", () => {
	class Database {
		pragma = vi.fn();
		close = vi.fn();
	}
	return { default: Database };
});

vi.mock("postgres", () => {
	const postgres = vi.fn(() => ({
		close: vi.fn(),
	}));
	return { default: postgres };
});

vi.mock("drizzle-orm/better-sqlite3", () => ({
	drizzle: vi.fn().mockReturnValue({}),
}));

vi.mock("drizzle-orm/postgres-js", () => ({
	drizzle: vi.fn().mockReturnValue({}),
}));

const resetEnvVar = (key: string, value: string | undefined): void => {
	if (value === undefined) {
		delete process.env[key];
		return;
	}
	process.env[key] = value;
};

describe("db driver selection", () => {
	it("initializes sqlite when DB_DRIVER=sqlite", async () => {
		const originalDriver = process.env.DB_DRIVER;
		const originalPath = process.env.SQLITE_DB_PATH;

		process.env.DB_DRIVER = "sqlite";
		process.env.SQLITE_DB_PATH = ":memory:";

		vi.resetModules();
		const { dbDriver } = await import("@/lib/db");

		expect(dbDriver).toBe("sqlite");

		resetEnvVar("DB_DRIVER", originalDriver);
		resetEnvVar("SQLITE_DB_PATH", originalPath);
	}, 10000);
});
