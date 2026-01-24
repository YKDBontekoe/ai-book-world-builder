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

		// The card itself is now a button due to role="button"
		// We need to find the "Fix" button specifically.
		// Since there are nested buttons (which is technically invalid HTML but common in React component composition for interaction),
		// we should target it more specifically or use getAllByRole and filter.
		// However, the error message shows: Found multiple elements with the role "button" and name /fix/i
		// Wait, the previous error was: Found multiple elements with the text: Test Issue in task-board.test.tsx
		// The error in task-card.test.tsx is: TestingLibraryElementError: Found multiple elements with the role "button" and name /fix/i
		// No, looking at the error output for task-card.test.tsx:
		// "Found multiple elements with the role "button" and name /fix/i" is NOT what I saw.
		// I saw:
		// tests/unit/components/builder/task-card.test.tsx:32:28
		// const fixButton = screen.getByRole("button", { name: /fix/i });
		// ^
		// TestingLibraryElementError: Found multiple elements with the role "button" and name /fix/i
		//
		// Wait, let me check the error output again.
		// Actually, the error shown in the previous turn was for `task-card.test.tsx` failure.
		// The error message says:
		// TestingLibraryElementError: Found multiple elements with the role "button" and name /fix/i
		//
		// Why?
		// The `TaskCard` renders a `MotionGlassCard` which now has `role="button"`.
		// Inside it, there is the "Fix" button.
		// So we have the card (role=button) and the fix button (role=button).
		// But the name "Fix" should only apply to the inner button.
		// Unless the card content somehow leaks the name?
		// The card content contains "Fix" text.
		// If the card has `role="button"`, its accessible name is calculated from its content.
		// Since the content includes the text "Fix", the card itself might be matching `name: /fix/i`.
		//
		// Solution: Scope the search or use a more specific selector.
		// Or, since we know we want the "Fix" action button, we can rely on the fact that the card contains a lot of other text ("Test Issue", "Issue", etc).
		// `getByRole("button", { name: "Fix" })` (exact match) might still match the card if "Fix" is part of the content? No, accessible name calculation concatenates all text.
		// The card's name would be "Issue #123 Test Issue testuser Fix".
		// So `/fix/i` regex matches that.
		//
		// We can change the test to find the button that *exactly* equals "Fix" or use a test ID if needed, but we should prefer accessible queries.
		//
		// Let's try `name: /^Fix$/i` to enforce exact match on the accessible name. The card's name will be much longer.

		const fixButton = screen.getByRole("button", { name: /^Fix$/i });
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
