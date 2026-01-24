import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TaskCard, type TaskItem } from "@/components/builder/task-card";

describe("TaskCard", () => {
	const mockIssue = {
		number: 123,
		title: "Test Issue",
		user: { login: "testuser", avatar_url: "http://example.com/avatar.png" },
		created_at: "2023-01-01",
		updated_at: "2023-01-01",
		state: "open",
		html_url: "http://github.com/test/issue/123",
		body: "body",
		labels: [],
		comments: 0,
	};

	const mockItem: TaskItem = {
		type: "issue",
		data: mockIssue as any, // Minimal mock
	};

	it("renders the Fix button with correct classes and handles click", async () => {
		const onFix = vi.fn();
		const onSelect = vi.fn();

		render(<TaskCard item={mockItem} onSelect={onSelect} onFix={onFix} />);

		const fixButton = screen.getByRole("button", { name: /fix/i });
		expect(fixButton).toBeInTheDocument();

		// Verify classes that I added
		expect(fixButton).toHaveClass("h-6");
		expect(fixButton).toHaveClass("px-2.5");
		expect(fixButton).toHaveClass("text-[10px]");

		// Click and verify propagation stop
		await userEvent.click(fixButton);
		expect(onFix).toHaveBeenCalledWith(mockIssue);
		expect(onSelect).not.toHaveBeenCalled();
	});
});
