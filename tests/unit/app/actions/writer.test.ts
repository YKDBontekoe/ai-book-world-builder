import { beforeEach, describe, expect, it, vi } from "vitest";
import { generateScene } from "@/app/actions/writer/scene";
import { continueWriting } from "@/lib/ai/writer";
import { clearCached } from "@/lib/cache";
import { db } from "@/lib/db/drizzle";
import { sceneRepository } from "@/lib/db/repositories";

vi.mock("@/app/(auth)/auth", () => ({
	auth: vi.fn(() => Promise.resolve({ user: { id: "user-1" } })),
}));

vi.mock("@/lib/db/drizzle", () => ({
	db: {
		select: vi.fn().mockReturnThis(),
		from: vi.fn().mockReturnThis(),
		where: vi.fn().mockReturnThis(),
		limit: vi.fn(),
	},
}));

vi.mock("@/lib/db/repositories", () => ({
	sceneRepository: {
		findByChapter: vi.fn(),
		create: vi.fn(),
	},
}));

vi.mock("@/lib/cache", () => ({
	clearCached: vi.fn(),
}));

vi.mock("@/lib/actions-utils", () => ({
	ensureProjectAccess: vi.fn(() => Promise.resolve()),
}));

vi.mock("@/lib/ai/writer", () => ({
	continueWriting: vi.fn(),
}));

vi.mock("next/headers", () => ({
	cookies: () => ({
		get: () => ({ value: "gpt-4o" }),
	}),
}));

describe("Writer Scene Actions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("generateScene", () => {
		it("should generate a scene successfully", async () => {
			// Arrange
			const mockChapter = { id: "ch-1", projectId: "proj-1" };
			vi.mocked(db.limit).mockResolvedValue([mockChapter]);
			vi.mocked(sceneRepository.findByChapter).mockResolvedValue([]);
			vi.mocked(continueWriting).mockResolvedValue({
				text: "Generated content",
			});
			vi.mocked(sceneRepository.create).mockResolvedValue({
				id: "new-scene-1",
			});

			// Act
			const result = await generateScene("ch-1");

			// Assert
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.sceneId).toBe("new-scene-1");
			}
			expect(clearCached).toHaveBeenCalledWith("project-structure:proj-1");
		});
	});
});
