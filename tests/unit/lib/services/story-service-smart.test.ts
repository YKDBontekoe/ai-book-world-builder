import { beforeEach, describe, expect, it, vi } from "vitest";
import { planningService } from "@/lib/ai/services/planning-service";
import { clearCached } from "@/lib/cache";
import { storyRepository } from "@/lib/db/repositories/story-repository";
import { StoryService } from "@/lib/services/story-service";

vi.mock("@/lib/db/repositories/story-repository");
vi.mock("@/lib/cache");
vi.mock("@/lib/ai/services/planning-service");
vi.mock("@/lib/actions-utils", () => ({
	ensureProjectAccess: vi.fn(),
}));

describe("StoryService Smart Features", () => {
	let storyService: StoryService;

	beforeEach(() => {
		storyService = new StoryService();
		vi.clearAllMocks();
	});

	describe("createBookFromPlan", () => {
		it("should save style parameters to the outline", async () => {
			const plan = {
				title: "My Book",
				logline: "logline",
				summary: "summary",
				chapters: [],
			};
			const style = { pov: "First Person", tone: "Gritty" };
			await storyService.createBookFromPlan("proj-1", plan, style);
			expect(storyRepository.createBookFromPlan).toHaveBeenCalledWith(
				"proj-1",
				plan,
				style,
			);
			expect(clearCached).toHaveBeenCalledWith("project-structure:proj-1");
		});
	});
});
