import { beforeEach, describe, expect, it, vi } from "vitest";
import { saveReadingProgress } from "@/app/actions/reader";
import { ensureProjectAccess } from "@/lib/actions-utils";
import { saveReadingProgressQuery } from "@/lib/db/queries/reader";

vi.mock("@/lib/db/drizzle");
vi.mock("@/lib/db/queries/reader", () => ({
	saveReadingProgressQuery: vi.fn(),
}));
vi.mock("@/lib/actions-utils", () => ({
	ensureProjectAccess: vi.fn(),
}));

describe("Reader Progress Action", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should save progress when user has access", async () => {
		(ensureProjectAccess as any).mockResolvedValue({
			user: { id: "user-123" },
			project: { id: "project-123" },
		});
		(saveReadingProgressQuery as any).mockResolvedValue([]);

		const result = await saveReadingProgress("project-123", "chapter-1", 0.5);

		expect(result.success).toBe(true);
		expect(ensureProjectAccess).toHaveBeenCalledWith("project-123", false);
		expect(saveReadingProgressQuery).toHaveBeenCalledWith({
			projectId: "project-123",
			userId: "user-123",
			chapterId: "chapter-1",
			progress: 0.5,
		});
	});

	it("should fail gracefully if ensureProjectAccess throws", async () => {
		(ensureProjectAccess as any).mockRejectedValue(new Error("Unauthorized"));

		const result = await saveReadingProgress("project-123", "chapter-1", 0.5);

		expect(result.success).toBe(false);
		expect(saveReadingProgressQuery).not.toHaveBeenCalled();
	});
});
