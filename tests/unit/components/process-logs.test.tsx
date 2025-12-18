import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
	type ProcessLog,
	ProcessLogs,
} from "../../../src/components/chat/process-logs";

describe("ProcessLogs", () => {
	afterEach(() => {
		cleanup();
	});

	const mockLogs: ProcessLog[] = [
		{
			type: "tool-log",
			tool: "test-tool",
			message: "Test message",
			timestamp: Date.now(),
		},
	];

	it("renders with correct accessibility attributes", () => {
		render(<ProcessLogs logs={mockLogs} />);

		const button = screen.getByRole("button");
		expect(button).toHaveAttribute("aria-expanded", "false");
		expect(button).toHaveAttribute("aria-controls", "process-logs-content");
	});

	it("toggles expansion and updates accessibility attributes", async () => {
		render(<ProcessLogs logs={mockLogs} />);

		const button = screen.getByRole("button");

		fireEvent.click(button);

		expect(button).toHaveAttribute("aria-expanded", "true");

		// Check if content is visible
		await waitFor(() => {
			expect(
				document.getElementById("process-logs-content"),
			).toBeInTheDocument();
		});

		fireEvent.click(button);

		expect(button).toHaveAttribute("aria-expanded", "false");
	});
});
