import { describe, it, expect, vi, beforeEach } from "vitest";

// IMPORTANT: Mock imports BEFORE importing the module under test
// This ensures that the real 'drizzle-orm' initialization (which needs env vars)
// is bypassed entirely.

// Mock DB
vi.mock("@/lib/db/drizzle", () => ({
    db: {
        select: vi.fn(() => ({
            from: vi.fn(() => ({
                where: vi.fn(() => ({
                    orderBy: vi.fn(() => []), // scenes
                    limit: vi.fn(() => [{ id: "ch-1", projectId: "proj-1", title: "Chapter 1" }]) // chapter
                })),
            }))
        })),
        insert: vi.fn(() => ({
            values: vi.fn(() => ({
                returning: vi.fn(() => [{ id: "new-scene-1", title: "AI Generated Scene" }])
            }))
        })),
        update: vi.fn(() => ({
            set: vi.fn(() => ({
                where: vi.fn()
            }))
        }))
    }
}));

// Mock AI
vi.mock("@/lib/ai/writer", () => ({
    continueWriting: vi.fn().mockResolvedValue({ text: "Generated content" })
}));

// Mock Scene Queries if used directly
vi.mock("@/lib/db/queries/scene", () => ({
    createScene: vi.fn().mockResolvedValue({ id: "new-scene-1", title: "AI Generated Scene" })
}));

// Now import the module under test
import { generateScene } from "../../../../app/actions/writer";

describe("generateScene", () => {
    it("should generate a scene successfully", async () => {
        const result = await generateScene("ch-1");
        expect(result.success).toBe(true);
        expect(result.sceneId).toBe("new-scene-1");
    });
});
