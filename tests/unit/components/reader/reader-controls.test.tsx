import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { ReaderControls } from "@/components/organisms/reader/reader-controls";

// Mock ResizeObserver
beforeAll(() => {
	global.ResizeObserver = class ResizeObserver {
		observe() {}
		unobserve() {}
		disconnect() {}
	};
});

// Mock useRouter
vi.mock("next/navigation", () => ({
	useRouter: () => ({
		back: vi.fn(),
		push: vi.fn(),
	}),
}));

describe("ReaderControls", () => {
	const defaultSettings = {
		fontSize: 18,
		fontFamily: "font-serif",
		theme: "light" as const,
		lineHeight: 1.6,
	};

	const defaultProps = {
		isVisible: true,
		onClose: vi.fn(),
		settings: defaultSettings,
		onSettingsChange: vi.fn(),
		currentChapterTitle: "Chapter 1",
		onPreviousChapter: vi.fn(),
		onNextChapter: vi.fn(),
		hasPreviousChapter: true,
		hasNextChapter: true,
	};

	it("renders correctly when visible", () => {
		render(<ReaderControls {...defaultProps} />);
		expect(screen.getByText("Chapter 1")).toBeInTheDocument();
		expect(screen.getByText("Font Size")).toBeInTheDocument();
	});

	it("does not render when invisible", () => {
		render(<ReaderControls {...defaultProps} isVisible={false} />);
		expect(screen.queryByText("Chapter 1")).not.toBeInTheDocument();
	});

	it("calls onPreviousChapter when prev button is clicked", () => {
		render(<ReaderControls {...defaultProps} />);
		// There are multiple "Prev" texts (mobile/desktop potentially), or just icons.
		// The mobile nav has text "Prev".
		const prevButtons = screen
			.getAllByRole("button")
			.filter(
				(b) =>
					b.textContent?.includes("Prev") || b.innerHTML.includes("ArrowLeft"),
			);
		// We'll target the one that is clearly the nav button
		// Actually, in the code: <Button ...><ArrowLeft.../></Button> for top bar back, and <Button...>...Prev</Button> for bottom bar nav.
		// Let's rely on text content for the bottom nav
		const prevNav = screen.getByText(
			(content, element) =>
				content.includes("Prev") && element?.tagName === "BUTTON",
		);
		fireEvent.click(prevNav);
		expect(defaultProps.onPreviousChapter).toHaveBeenCalled();
	});
});
