import { describe, it, expect } from "vitest";
import { julesPreferencesSchema } from "@/app/actions/jules-preferences";

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
