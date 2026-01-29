import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { auth } from "@/app/(auth)/auth";
import {
	getJulesPreferencesAction,
	saveJulesPreferencesAction,
} from "@/app/actions/jules-preferences";
import { julesPreferencesSchema } from "@/app/actions/jules-preferences-schemas";
import { db } from "@/lib/db";

// Explicitly mock db to satisfy code review strictness
vi.mock("@/lib/db", () => ({
	db: {
		select: vi.fn().mockReturnThis(),
		from: vi.fn().mockReturnThis(),
		where: vi.fn().mockReturnThis(),
		orderBy: vi.fn().mockReturnThis(),
		limit: vi.fn().mockReturnThis(),
		insert: vi.fn().mockReturnThis(),
		values: vi.fn().mockReturnThis(),
		update: vi.fn().mockReturnThis(),
		set: vi.fn().mockReturnThis(),
		delete: vi.fn().mockReturnThis(),
		onConflictDoUpdate: vi.fn().mockReturnThis(),
		transaction: vi.fn().mockImplementation((cb) =>
			cb({
				select: vi.fn().mockReturnThis(),
				insert: vi.fn().mockReturnThis(),
				update: vi.fn().mockReturnThis(),
				delete: vi.fn().mockReturnThis(),
			}),
		),
	},
}));

// Mock auth
vi.mock("@/app/(auth)/auth", () => ({
	auth: vi.fn(),
}));

describe("julesPreferencesSchema", () => {
	it("should allow valid preferences", () => {
		const result = julesPreferencesSchema.safeParse({
			repository: "owner/repo",
			branch: "main",
		});
		expect(result.success).toBe(true);
	});

	it("should allow null values", () => {
		const result = julesPreferencesSchema.safeParse({
			repository: null,
			branch: null,
		});
		expect(result.success).toBe(true);
	});

	it("should disallow empty strings", () => {
		const resultRepo = julesPreferencesSchema.safeParse({
			repository: "",
			branch: "main",
		});
		expect(resultRepo.success).toBe(false);

		const resultBranch = julesPreferencesSchema.safeParse({
			repository: "owner/repo",
			branch: "",
		});
		expect(resultBranch.success).toBe(false);
	});
});

describe("getJulesPreferencesAction", () => {
	const mockUser = {
		id: "user-123",
		email: "test@example.com",
		role: "user",
	};

	beforeEach(() => {
		// Proper mock types for auth
		vi.mocked(auth).mockResolvedValue({
			user: mockUser,
			expires: "new Date()",
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should handle missing column error (42703) gracefully", async () => {
		// Suppress expected warning
		vi.spyOn(console, "warn").mockImplementation(() => {});

		// Mock db.select to throw a properly typed Postgres error
		const dbError = Object.assign(
			new Error("column julesPreferences does not exist"),
			{ code: "42703" },
		);

		vi.mocked(db.select).mockImplementationOnce(() => {
			throw dbError;
		});

		const result = await getJulesPreferencesAction();

		// After fix: this should succeed and return defaults
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toEqual({
				repository: null,
				branch: null,
			});
		}
	});
});

describe("saveJulesPreferencesAction", () => {
	const mockUser = {
		id: "user-123",
		email: "test@example.com",
		role: "user",
	};

	beforeEach(() => {
		// Proper mock types for auth
		vi.mocked(auth).mockResolvedValue({
			user: mockUser,
			expires: "new Date()",
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should handle missing column error (42703) gracefully by returning an error", async () => {
		// Suppress expected logs
		vi.spyOn(console, "warn").mockImplementation(() => {});
		vi.spyOn(console, "error").mockImplementation(() => {});

		// Mock db.insert to throw a properly typed Postgres error
		const dbError = Object.assign(
			new Error("column julesPreferences does not exist"),
			{ code: "42703" },
		);

		vi.mocked(db.insert).mockImplementationOnce(() => {
			throw dbError;
		});

		const input = { repository: "owner/repo", branch: "main" };
		const result = await saveJulesPreferencesAction(input);

		// After refinement: this should return failure with a user friendly message
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toContain("System maintenance in progress");
		}
	});
});
