import { describe, it, expect, vi, beforeEach } from "vitest";

// Define mocks first
const mocks = vi.hoisted(() => {
    const updateBuilder = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(true),
    };

    const queryBuilder = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn(), // We'll mock impl later
        then: (resolve: any) => resolve([]) // Placeholder
    };

    return {
        generateObject: vi.fn(),
        continueWriting: vi.fn().mockResolvedValue({ text: "Generated content" }),
        createScene: vi.fn().mockResolvedValue({ id: "new-scene-id" }),
        ensureProjectAccess: vi.fn().mockResolvedValue(true),
        getSelectedModelId: vi.fn().mockResolvedValue("mock-model-id"),
        // DB Mocks
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([{ id: "mock-id" }]),
        update: vi.fn().mockReturnValue(updateBuilder),
        updateBuilder,
        queryBuilder,
        transaction: vi.fn(),
    };
});

// Mock modules
vi.mock("ai", () => ({
    generateObject: mocks.generateObject,
}));

vi.mock("@/lib/ai/providers", () => ({
    myProvider: { languageModel: vi.fn() },
}));

vi.mock("@/lib/actions-utils", () => ({
    ensureProjectAccess: mocks.ensureProjectAccess,
}));

vi.mock("@/lib/ai/writer", () => ({
    continueWriting: mocks.continueWriting,
}));

vi.mock("@/lib/ai/models", () => ({
    getSelectedModelId: mocks.getSelectedModelId,
}));

vi.mock("@/lib/db/queries/scene", () => ({
    createScene: mocks.createScene,
}));

vi.mock("@/lib/db/schema", () => ({
    outline: { id: "outline" },
    volume: { id: "volume" },
    chapter: { id: "chapter" },
    scene: { id: "scene" },
}));

// Complex DB Mocking State
const mockDbState = {
    queryResults: [] as any[]
};

// Update the hoisted mocks implementations to use the state
mocks.queryBuilder.limit.mockImplementation(() => {
    return Promise.resolve(mockDbState.queryResults.shift() || []);
});
// @ts-ignore
mocks.queryBuilder.then = (resolve: any) => {
    resolve(mockDbState.queryResults.shift() || []);
};

vi.mock("@/lib/db/drizzle", () => ({
    db: {
        transaction: mocks.transaction.mockImplementation((cb) => cb({
            insert: mocks.insert,
            values: mocks.values,
            returning: mocks.returning,
            select: () => mocks.queryBuilder
        })),
        select: () => mocks.queryBuilder,
        update: mocks.update,
    },
}));

vi.mock("drizzle-orm", () => ({
    eq: vi.fn(),
    asc: vi.fn(),
    desc: vi.fn(),
}));

import { storyService, StoryStyle } from "@/lib/services/story-service";

describe("StoryService Smart Features", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockDbState.queryResults = [];
        // Restore default returns for chainable mocks if cleared
        mocks.insert.mockReturnThis();
        mocks.values.mockReturnThis();
        mocks.returning.mockResolvedValue([{ id: "mock-id" }]);
        mocks.update.mockReturnValue(mocks.updateBuilder);
        mocks.updateBuilder.set.mockReturnThis();
        mocks.updateBuilder.where.mockResolvedValue(true);
        mocks.queryBuilder.from.mockReturnThis();
        mocks.queryBuilder.where.mockReturnThis();
        mocks.queryBuilder.orderBy.mockReturnThis();
    });

    describe("generateBookPlan", () => {
        it("should include style parameters in the prompt", async () => {
            mocks.generateObject.mockResolvedValueOnce({
                object: { title: "T", summary: "S", chapters: [] }
            });

            const style: StoryStyle = {
                genre: "Cyberpunk",
                pov: "First Person",
                tone: "Gritty"
            };

            await storyService.generateBookPlan("test prompt", style);

            const call = mocks.generateObject.mock.calls[0][0];
            expect(call.prompt).toContain("Genre: Cyberpunk");
            expect(call.prompt).toContain("POV: First Person");
            expect(call.prompt).toContain("Tone: Gritty");
        });
    });

    describe("createBookFromPlan", () => {
        it("should save style parameters to the outline", async () => {
            const plan = {
                title: "Title",
                logline: "Log",
                summary: "Sum",
                chapters: []
            };
            const style: StoryStyle = {
                genre: "G",
                pov: "Second Person",
                tone: "Dark"
            };

            await storyService.createBookFromPlan("pid", plan, style);

            expect(mocks.insert).toHaveBeenCalled();
            // Check the values passed to insert for Outline (first call)
            const valuesCalls = mocks.values.mock.calls;
            // The first insert is Outline
            const outlineArgs = valuesCalls[0][0];
            expect(outlineArgs.pov).toBe("Second Person");
            expect(outlineArgs.tone).toBe("Dark");
        });
    });

    describe("generateSceneText", () => {
        it("should construct smart context with style and history", async () => {
            // Setup DB responses for the sequence of queries:
            // 1. Scene (limit 1)
            // 2. Chapter (limit 1)
            // 3. Outline (limit 1)
            // 4. Scenes List (orderBy, no limit)

            const targetScene = { id: "s2", sequence: 2, chapterId: "c1", projectId: "p1", title: "Target Scene" };
            const targetChapter = { id: "c1", outlineId: "o1", title: "Chapter 1", notes: "Ch Notes" };
            const targetOutline = { id: "o1", pov: "First Person", tone: "Noir" };
            const scenesList = [
                { id: "s1", sequence: 1, title: "Prev Scene", content: "Previous content..." },
                { id: "s2", sequence: 2, title: "Target Scene", content: "" }
            ];

            mockDbState.queryResults = [
                [targetScene],
                [targetChapter],
                [targetOutline],
                scenesList
            ];

            await storyService.generateSceneText("s2");

            expect(mocks.continueWriting).toHaveBeenCalled();
            const args = mocks.continueWriting.mock.calls[0];
            const context = args[0];
            const options = args[2];

            // Verify Context
            expect(context).toContain("Chapter Title: Chapter 1");
            expect(context).toContain("[IMMEDIATELY PREVIOUS SCENE - Prev Scene]");
            expect(context).toContain("Previous content...");

            // Verify Style Injection
            expect(options.style).toBe("First Person, Noir");
        });
    });
});
