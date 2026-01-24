import { describe, expect, it } from "vitest";
import type { TaskItem } from "@/components/builder/task-card";
import { generateCsv, sortTasks } from "@/components/builder/task-board-utils";

describe("task-board-utils", () => {
	const mockIssue: TaskItem = {
		type: "issue",
		data: {
			number: 1,
			title: "Issue 1",
			state: "open",
			created_at: "2023-01-01T10:00:00Z",
			updated_at: "2023-01-02T10:00:00Z",
			html_url: "http://github.com/issues/1",
			user: { login: "user1", avatar_url: "" },
			body: "",
			labels: [],
			comments: 0,
		},
	};

	const mockPr: TaskItem = {
		type: "pr",
		data: {
			number: 2,
			title: "PR 1",
			state: "open",
			created_at: "2023-01-03T10:00:00Z",
			updated_at: "2023-01-04T10:00:00Z",
			html_url: "http://github.com/pulls/2",
			user: { login: "user2", avatar_url: "" },
			base: { ref: "main" },
			head: { ref: "feat" },
			body: "",
			labels: [],
		},
	};

	const mockSession: TaskItem = {
		type: "session",
		data: {
			id: "session-1",
			title: "Session 1",
			state: "STATE_RUNNING",
			createdAt: "2023-01-05T10:00:00Z",
			updatedAt: "2023-01-06T10:00:00Z",
			prompt: "fix it",
			messages: [],
		},
	};

	describe("sortTasks", () => {
		const tasks = [mockIssue, mockPr, mockSession];

		it("should sort by updated-desc", () => {
			const sorted = sortTasks(tasks, "updated-desc");
			expect(sorted[0]).toBe(mockSession); // Jan 6
			expect(sorted[1]).toBe(mockPr); // Jan 4
			expect(sorted[2]).toBe(mockIssue); // Jan 2
		});

		it("should sort by updated-asc", () => {
			const sorted = sortTasks(tasks, "updated-asc");
			expect(sorted[0]).toBe(mockIssue);
			expect(sorted[1]).toBe(mockPr);
			expect(sorted[2]).toBe(mockSession);
		});

		it("should sort by created-desc", () => {
			const sorted = sortTasks(tasks, "created-desc");
			expect(sorted[0]).toBe(mockSession); // Jan 5
			expect(sorted[1]).toBe(mockPr); // Jan 3
			expect(sorted[2]).toBe(mockIssue); // Jan 1
		});
	});

	describe("generateCsv", () => {
		it("should generate correct CSV content", () => {
			const columns = [
				{
					id: "test",
					title: "Test Column",
					items: [mockIssue, mockSession],
				},
			];

			const csv = generateCsv(columns);
			const lines = csv.split("\n");

			expect(lines.length).toBe(3); // Header + 2 rows
			expect(lines[0]).toBe(
				"ID,Type,Status,Title,Author,Created At,Updated At,URL",
			);

            // Check Issue row
			expect(lines[1]).toContain('"1"');
			expect(lines[1]).toContain('"Issue"');
			expect(lines[1]).toContain('"Issue 1"');
			expect(lines[1]).toContain('"user1"');

            // Check Session row
			expect(lines[2]).toContain('"session-1"');
			expect(lines[2]).toContain('"Session"');
			expect(lines[2]).toContain('"Session 1"');
			expect(lines[2]).toContain('"Jules"');
		});
	});
});
