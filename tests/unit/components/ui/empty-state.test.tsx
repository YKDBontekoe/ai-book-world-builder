import { render, screen } from "@testing-library/react";
import { FolderIcon } from "lucide-react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "@/components/molecules/empty-state";

describe("EmptyState", () => {
	it("renders correctly with default variant (dashed)", () => {
		render(<EmptyState title="No content" />);
		const container = screen.getByTestId("empty-state-container");
		expect(container).toHaveClass("border-dashed");
	});

	it("renders correctly with glass variant", () => {
		render(<EmptyState title="Glass Empty State" variant="glass" />);
		expect(screen.getByText("Glass Empty State")).toBeInTheDocument();
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
});
