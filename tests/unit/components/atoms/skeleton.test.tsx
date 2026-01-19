import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Skeleton } from "@/components/atoms/skeleton";

describe("Skeleton", () => {
	it("renders with default shimmer class", () => {
		const { container } = render(<Skeleton />);
		// Access the inner div which should have the shimmer class
		// The structure is FadeIn -> div.shimmer
		const skeletonDiv = container.querySelector(".shimmer");
		expect(skeletonDiv).toBeInTheDocument();
	});

	it("merges custom classes", () => {
		const { container } = render(<Skeleton className="h-10 w-10" />);
		const skeletonDiv = container.querySelector(".shimmer");
		expect(skeletonDiv).toHaveClass("h-10");
		expect(skeletonDiv).toHaveClass("w-10");
	});
});
