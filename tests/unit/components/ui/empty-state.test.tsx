import { fireEvent, render, screen } from "@testing-library/react";
import { FolderIcon } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { EmptyState } from "@/components/molecules/empty-state";

describe("EmptyState", () => {
	it("renders correctly with default variant (dashed)", () => {
		render(<EmptyState title="No content" />);
		const container = screen.getByTestId("empty-state-container");
		expect(container).toHaveClass("border-dashed");
	});

	it("renders correctly with glass variant", () => {
		render(<EmptyState title="Glass Empty State" variant="glass" />);
		const container = screen.getByTestId("empty-state-container");
		// GlassCard uses the 'liquid' variant which translates to these classes in the underlying implementation
		// Ideally we would check for a specific variant class if exposed, but checking for known glass classes works
		// The `variant="liquid"` in GlassCard adds: "bg-glass/50 backdrop-blur-[30px]"
		expect(container).toHaveClass("bg-glass/50");
		expect(container).toHaveClass("backdrop-blur-[30px]");
	});

	it("renders icon, title and description", () => {
		render(
			<EmptyState
				title="Test Title"
				description="Test Description"
				icon={FolderIcon}
			/>,
		);
		expect(screen.getByText("Test Title")).toBeInTheDocument();
		expect(screen.getByText("Test Description")).toBeInTheDocument();
	});

	it("renders interactive suggestions when onSuggestionClick is provided", () => {
		const handleSuggestionClick = vi.fn();
		render(
			<EmptyState
				title="Suggestions"
				suggestions={["One", "Two"]}
				onSuggestionClick={handleSuggestionClick}
			/>,
		);

		const suggestion = screen.getByText("One");
		expect(suggestion.tagName).toBe("BUTTON");
		fireEvent.click(suggestion);
		expect(handleSuggestionClick).toHaveBeenCalledWith("One");
	});

	it("renders non-interactive suggestions when onSuggestionClick is missing", () => {
		render(<EmptyState title="Suggestions" suggestions={["One", "Two"]} />);

		const suggestion = screen.getByText("One");
		expect(suggestion.tagName).toBe("SPAN");
		expect(suggestion).toHaveClass("cursor-default");
	});
});
