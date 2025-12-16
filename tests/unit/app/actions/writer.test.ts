import { describe, it, expect, vi, beforeEach } from "vitest";

// Define mocks inside or use hoistable variables if supported, but simpler to define inline for mocks

vi.mock("../../../../lib/db/drizzle", () => {
    const mockChapter = { id: "ch-1", projectId: "proj-1", title: "Chapter 1", notes: "Notes" };
    const mockScenes = [{ id: "scene-1", title: "Scene 1", content: "Content", sequence: 1 }];
    const mockNewScene = { id: "new-scene-1", title: "AI Generated Scene", sequence: 2 };

    return {
        db: {
            select: vi.fn(() => ({
                from: (table: any) => {
                    return {
                        where: () => {
                            return {
                                orderBy: () => Promise.resolve(mockScenes), // For scenes
                                then: (resolve: any) => resolve([mockChapter]), // For chapter
                                [Symbol.iterator]: function* () { yield mockChapter; }
                            }
                        }
                    }
                }
            })),
            insert: vi.fn(() => ({
                values: vi.fn(() => ({
                    returning: vi.fn(() => [mockNewScene])
                }))
            })),
            update: vi.fn(() => ({
                set: vi.fn(() => ({
                    where: vi.fn()
                }))
            }))
        }
    };
});


// Mock @/lib/ai/writer
vi.mock("../../../../lib/ai/writer", () => ({
    continueWriting: vi.fn().mockResolvedValue({ text: "Generated content" })
}));

// Mock @/lib/db/queries/scene
vi.mock("../../../../lib/db/queries/scene", () => ({
    createScene: vi.fn().mockResolvedValue({ id: "new-scene-1", title: "AI Generated Scene", sequence: 2 })
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
