import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import * as matchers from "vitest-axe/matchers";
import { WizardReviewStep } from "@/features/writer/components/story-wizard/WizardReviewStep";
import type { BookPlan } from "@/lib/services/schemas/story-schemas";

expect.extend(matchers);

// Mock ScrollArea
vi.mock("@/components/atoms/scroll-area", () => ({
	ScrollArea: ({
		children,
		className,
	}: {
		children: React.ReactNode;
		className?: string;
	}) => <div className={className}>{children}</div>,
}));

// Mock framer-motion
vi.mock("framer-motion", async () => {
	const actual = await vi.importActual("framer-motion");
	return {
		...actual,
		motion: {
			div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
				<div {...props}>{children}</div>
			),
		},
	};
});

describe("WizardReviewStep", () => {
	const mockPlan: BookPlan = {
		title: "Test Title",
		logline: "Test Logline",
		summary: "Test Summary",
		chapters: [
			{ title: "Chapter 1", summary: "Summary 1" },
			{ title: "Chapter 2", summary: "Summary 2" },
		],
	};

	const defaultProps = {
		plan: mockPlan,
		onUpdatePlan: vi.fn(),
		onUpdateChapter: vi.fn(),
		onDeleteChapter: vi.fn(),
		onAddChapter: vi.fn(),
		onRestart: vi.fn(),
		onCreateStory: vi.fn(),
	};

	it("renders plan details correctly", () => {
		render(<WizardReviewStep {...defaultProps} />);

		expect(screen.getByLabelText("Story Title")).toHaveValue("Test Title");
		expect(screen.getByLabelText("Logline")).toHaveValue("Test Logline");
		expect(screen.getByLabelText("Summary")).toHaveValue("Test Summary");
		expect(screen.getByLabelText("Chapter 1 Title")).toHaveValue("Chapter 1");
		expect(screen.getByLabelText("Chapter 1 Summary")).toHaveValue("Summary 1");
	});

	it("calls onUpdatePlan when title is changed", async () => {
		const onUpdatePlan = vi.fn();
		render(<WizardReviewStep {...defaultProps} onUpdatePlan={onUpdatePlan} />);

		const titleInput = screen.getByLabelText("Story Title");
		fireEvent.change(titleInput, { target: { value: "New Title" } });

		expect(onUpdatePlan).toHaveBeenCalledWith("title", "New Title");
	});

	it("calls onUpdateChapter when chapter title is changed", async () => {
		const onUpdateChapter = vi.fn();
		render(
			<WizardReviewStep {...defaultProps} onUpdateChapter={onUpdateChapter} />,
		);

		const chapterInput = screen.getByLabelText("Chapter 1 Title");
		fireEvent.change(chapterInput, { target: { value: "Updated Chapter 1" } });

		expect(onUpdateChapter).toHaveBeenCalledWith(
			0,
			"title",
			"Updated Chapter 1",
		);
	});

	it("calls onDeleteChapter when delete button is clicked", async () => {
		const onDeleteChapter = vi.fn();
		const user = userEvent.setup();
		render(
			<WizardReviewStep {...defaultProps} onDeleteChapter={onDeleteChapter} />,
		);

		const deleteBtn = screen.getByRole("button", { name: /Delete Chapter 1/i });
		await user.click(deleteBtn);

		expect(onDeleteChapter).toHaveBeenCalledWith(0);
	});

	it("should have no accessibility violations", async () => {
		const { container } = render(<WizardReviewStep {...defaultProps} />);
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});
});
