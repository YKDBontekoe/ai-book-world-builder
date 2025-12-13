import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { type ProcessLog, ProcessLogs } from "@/components/chat/process-logs";

const mockLogs: ProcessLog[] = [
	{
		type: "tool-log",
		message: "Doing something",
		tool: "test-tool",
		timestamp: Date.now(),
	},
];

describe("ProcessLogs", () => {
	it("renders logs and has accessibility attributes", () => {
		render(<ProcessLogs logs={mockLogs} />);

		// Find the toggle button
		const button = screen.getByRole("button");
		expect(button).toBeInTheDocument();

		// Check for accessibility attributes
		expect(button).toHaveAttribute("aria-expanded", "false");
		expect(button).toHaveAttribute("aria-controls");

		// Click to expand
		fireEvent.click(button);

		expect(button).toHaveAttribute("aria-expanded", "true");
	});

	it("has focus visible styles", () => {
		render(<ProcessLogs logs={mockLogs} />);
		const button = screen.getByRole("button");

		// Check for focus-visible classes
		// We look for standard shadcn/ui focus ring classes
		expect(button.className).toContain("focus-visible:ring-2");
		expect(button.className).toContain("focus-visible:outline-none");
	});
});
