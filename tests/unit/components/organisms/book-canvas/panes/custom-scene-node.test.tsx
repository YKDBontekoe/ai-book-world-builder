import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import { CustomSceneNode } from "../../../../../../src/components/organisms/book-canvas/panes/graph-pane";

describe("CustomSceneNode", () => {
	it("renders basic node data correctly", () => {
		const data = {
			label: "Test Scene",
			chapter: "Chapter 1",
			issueCount: 0,
		};
		render(<CustomSceneNode data={data} selected={false} />);

		expect(screen.getByText("Test Scene")).toBeInTheDocument();
		expect(screen.getByText("Chapter 1")).toBeInTheDocument();
		expect(screen.queryByTestId("issue-indicator")).not.toBeInTheDocument();
	});

	it("displays an issue indicator when issueCount is greater than 0", () => {
		const data = {
			label: "Scene With Issue",
			chapter: "Chapter 2",
			issueCount: 1,
		};
		render(<CustomSceneNode data={data} selected={false} />);

		expect(screen.getByText("Scene With Issue")).toBeInTheDocument();
		expect(screen.getByTestId("issue-indicator")).toBeInTheDocument();
	});

	it("applies selected styles when selected is true", () => {
		const data = {
			label: "Selected Scene",
			chapter: "Chapter 3",
			issueCount: 0,
		};
		const { container } = render(
			<CustomSceneNode data={data} selected={true} />,
		);

		// Check for a class that indicates selection
		expect(container.firstChild).toHaveClass("ring-primary");
	});
});
