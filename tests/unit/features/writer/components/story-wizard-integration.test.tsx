import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { toast } from "sonner";
import { describe, expect, it, vi } from "vitest";
import * as storyGenerationActions from "@/app/actions/story-generation";
import { StoryWizard } from "@/features/writer/components/story-wizard";

// Mock the server actions
vi.mock("@/app/actions/story-generation", () => ({
	generateBookPlan: vi.fn(),
	createBookFromPlan: vi.fn(),
}));

// Mock sonner toast
vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
		loading: vi.fn(),
		dismiss: vi.fn(),
	},
}));

// Mock ScrollArea to avoid layout issues in JSDOM
vi.mock("@/components/atoms/scroll-area", () => ({
	ScrollArea: ({
		children,
		className,
	}: {
		children: React.ReactNode;
		className?: string;
	}) => <div className={className}>{children}</div>,
}));

// Mock framer-motion to avoid animation issues
vi.mock("framer-motion", async () => {
	const actual = await vi.importActual("framer-motion");
	return {
		...actual,
		AnimatePresence: ({ children }: { children: React.ReactNode }) => (
			<>{children}</>
		),
		motion: {
			div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
				<div {...props}>{children}</div>
			),
		},
	};
});

describe("StoryWizard Integration", () => {
	const mockPlan = {
		title: "Generated Title",
		logline: "Generated Logline",
		summary: "Generated Summary",
		chapters: [
			{ title: "Chapter 1", summary: "Summary 1" },
			{ title: "Chapter 2", summary: "Summary 2" },
		],
	};

	it("completes the full story creation flow", async () => {
		const onComplete = vi.fn();
		const user = userEvent.setup();

		// Setup mocks
		vi.mocked(storyGenerationActions).generateBookPlan.mockResolvedValue({
			success: true,
			plan: mockPlan,
		});
		vi.mocked(storyGenerationActions).createBookFromPlan.mockResolvedValue({
			success: true,
			data: { id: "new-story-id" },
		});

		render(<StoryWizard projectId="test-project" onComplete={onComplete} />);

		// 1. Input Step
		// Select a template (e.g., The Hero's Journey) to populate fields
		const templateButton = screen.getByText("The Hero's Journey");
		await user.click(templateButton);

		// Verify fields are populated (optional check)
		const promptInput = screen.getByPlaceholderText(
			/e.g. A cyberpunk detective/i,
		) as HTMLTextAreaElement;
		expect(promptInput.value).toContain(
			"A young farm boy discovers he is the heir",
		);

		// Click Generate
		const generateButton = screen.getByRole("button", {
			name: /generate plan/i,
		});
		await user.click(generateButton);

		// 2. Generating Step (Loading)
		// We might catch the loading state if we are fast enough, or just wait for the result.
		// Since mocked promise resolves immediately, we likely jump to Review.
		// But let's verify generateBookPlan was called.
		expect(storyGenerationActions.generateBookPlan).toHaveBeenCalled();

		// 3. Review Step
		// Wait for the review step to appear
		await waitFor(() => {
			expect(screen.getByDisplayValue("Generated Title")).toBeInTheDocument();
		});

		// Verify plan details are shown
		expect(screen.getByDisplayValue("Generated Logline")).toBeInTheDocument();
		expect(screen.getByDisplayValue("Chapter 1")).toBeInTheDocument();

		// Modify the plan
		const titleInput = screen.getByDisplayValue("Generated Title");
		await user.clear(titleInput);
		await user.type(titleInput, "Updated Title");

		// Click Create Story
		const createButton = screen.getByRole("button", { name: /create story/i });
		await user.click(createButton);

		// 4. Creation (Loading)
		expect(storyGenerationActions.createBookFromPlan).toHaveBeenCalledWith(
			"test-project",
			expect.objectContaining({
				title: "Updated Title",
				// Other fields should remain from mockPlan
				logline: "Generated Logline",
			}),
			expect.anything(), // style object
		);

		// Verify onComplete called
		await waitFor(() => {
			expect(onComplete).toHaveBeenCalled();
		});
	});

	it("handles generation error by returning to input", async () => {
		const user = userEvent.setup();

		vi.mocked(storyGenerationActions).generateBookPlan.mockResolvedValue({
			success: false,
			error: "Failed",
		});

		render(<StoryWizard projectId="test-project" onComplete={vi.fn()} />);

		// Click Generate (assuming prompt is empty is fine or we fill it)
		// Need to fill prompt first as button might be disabled or validation check
		const promptInput = screen.getByPlaceholderText(
			/e.g. A cyberpunk detective/i,
		);
		await user.type(promptInput, "Test prompt");

		const generateButton = screen.getByRole("button", {
			name: /generate plan/i,
		});
		await user.click(generateButton);

		// Should stay on or return to input step
		// Verify we can still see the input
		await waitFor(() => {
			expect(
				screen.getByPlaceholderText(/e.g. A cyberpunk detective/i),
			).toBeInTheDocument();
		});

		expect(toast.error).toHaveBeenCalled();
	});
});
