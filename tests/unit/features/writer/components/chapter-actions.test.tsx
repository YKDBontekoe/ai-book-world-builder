import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as storyGenerationActions from "@/app/actions/story-generation";
import { ChapterActions } from "@/features/writer/components/chapter-actions";

// Mock ResizeObserver for framer-motion
global.ResizeObserver = class ResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
};

// Mock the server actions
vi.mock("@/app/actions/story-generation", () => ({
	planChapterScenes: vi.fn(),
	generateSceneText: vi.fn(),
}));

// Mock Icons
vi.mock("lucide-react", () => ({
	Loader2: () => <span data-testid="icon-loader">Loader</span>,
	Sparkles: () => <span data-testid="icon-sparkles">Sparkles</span>,
	Check: () => <span data-testid="icon-check">Check</span>,
	X: () => <span data-testid="icon-x">X</span>,
}));

// Mock Toast
vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

describe("ChapterActions", () => {
	const defaultProps = {
		chapterId: "chapter-1",
		onUpdate: vi.fn(),
		isReadOnly: false,
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders the action button", () => {
		render(<ChapterActions {...defaultProps} />);
		expect(screen.getByLabelText("Chapter Actions")).toBeInTheDocument();
		expect(screen.getByTestId("icon-sparkles")).toBeInTheDocument();
	});

	it("does not render when read only", () => {
		render(<ChapterActions {...defaultProps} isReadOnly={true} />);
		expect(screen.queryByLabelText("Chapter Actions")).not.toBeInTheDocument();
	});

	it("opens dropdown and shows generate option", async () => {
		const user = userEvent.setup();
		render(<ChapterActions {...defaultProps} />);

		const trigger = screen.getByLabelText("Chapter Actions");
		await user.click(trigger);

		await waitFor(() => {
			expect(screen.getByText("Generate Scenes (AI)")).toBeInTheDocument();
		});
	});

	it("handles successful generation flow", async () => {
		const user = userEvent.setup();

		type PlanReturn = Awaited<
			ReturnType<typeof storyGenerationActions.planChapterScenes>
		>;
		type GenerateReturn = Awaited<
			ReturnType<typeof storyGenerationActions.generateSceneText>
		>;

		// 1. Mock plan with delay
		vi.mocked(storyGenerationActions.planChapterScenes).mockImplementation(
			async (): Promise<PlanReturn> => {
				await new Promise((resolve) => setTimeout(resolve, 300));
				return {
					success: true,
					data: {
						success: true,
						sceneIds: ["scene-1", "scene-2"],
					},
				};
			},
		);

		// 2. Mock scene generation with delay
		vi.mocked(storyGenerationActions.generateSceneText).mockImplementation(
			async (): Promise<GenerateReturn> => {
				await new Promise((resolve) => setTimeout(resolve, 300));
				return {
					success: true,
					data: { success: true },
				};
			},
		);

		render(<ChapterActions {...defaultProps} />);

		// Open dropdown and click generate
		await user.click(screen.getByLabelText("Chapter Actions"));
		await waitFor(async () => {
			await user.click(screen.getByText("Generate Scenes (AI)"));
		});

		// Check Planning Phase
		await waitFor(() => {
			expect(screen.getByText("Planning Scenes...")).toBeInTheDocument();
		});

		// Check Generating Phase (after plan finishes)
		await waitFor(
			() => {
				expect(screen.getByText(/Writing Scenes/)).toBeInTheDocument();
			},
			{ timeout: 2000 },
		);

		// Check Scenes are listed
		expect(screen.getByText("Scene 1")).toBeInTheDocument();
		expect(screen.getByText("Scene 2")).toBeInTheDocument();

		// Wait for completion
		await waitFor(
			() => {
				expect(screen.getByText("Generation Complete!")).toBeInTheDocument();
			},
			{ timeout: 2000 },
		);

		expect(storyGenerationActions.generateSceneText).toHaveBeenCalledTimes(2);
		expect(storyGenerationActions.generateSceneText).toHaveBeenCalledWith(
			"scene-1",
		);
		expect(storyGenerationActions.generateSceneText).toHaveBeenCalledWith(
			"scene-2",
		);
		expect(defaultProps.onUpdate).toHaveBeenCalled();
	});

	it("handles planning error", async () => {
		const user = userEvent.setup();
		// Mock failed plan
		vi.mocked(storyGenerationActions.planChapterScenes).mockResolvedValue({
			success: false,
			error: "Planning failed miserably",
		});

		render(<ChapterActions {...defaultProps} />);

		await user.click(screen.getByLabelText("Chapter Actions"));
		await waitFor(async () => {
			await user.click(screen.getByText("Generate Scenes (AI)"));
		});

		await waitFor(() => {
			expect(screen.getByText("Generation Failed")).toBeInTheDocument();
		});
		expect(screen.getByText("Planning failed miserably")).toBeInTheDocument();
	});

	it("handles scene generation error but continues", async () => {
		const user = userEvent.setup();
		// Mock successful plan
		vi.mocked(storyGenerationActions.planChapterScenes).mockResolvedValue({
			success: true,
			data: {
				success: true,
				sceneIds: ["scene-1", "scene-2"],
			},
		});

		// Mock first scene fails, second succeeds
		vi.mocked(storyGenerationActions.generateSceneText)
			.mockResolvedValueOnce({
				success: false,
				error: "Generation error",
			})
			.mockResolvedValueOnce({
				success: true,
				data: { success: true },
			});

		render(<ChapterActions {...defaultProps} />);

		await user.click(screen.getByLabelText("Chapter Actions"));
		await waitFor(async () => {
			await user.click(screen.getByText("Generate Scenes (AI)"));
		});

		// Wait for completion
		await waitFor(() => {
			expect(screen.getByText("Generation Complete!")).toBeInTheDocument();
		});

		// Should still complete even if one scene failed (based on implementation "Mark scene as error but continue with others")
		expect(storyGenerationActions.generateSceneText).toHaveBeenCalledTimes(2);
	});
});
