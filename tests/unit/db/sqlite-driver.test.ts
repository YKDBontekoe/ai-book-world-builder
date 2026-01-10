import { describe, expect, it, vi } from "vitest";

vi.mock("better-sqlite3", () => {
	class MockDatabase {
		constructor(_path: string) {}

		pragma = vi.fn();
	}

	return { default: MockDatabase };
});

vi.unmock("@/lib/db");

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
	});
});
