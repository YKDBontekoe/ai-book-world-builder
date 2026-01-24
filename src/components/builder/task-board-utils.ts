import type { GitHubIssue, GitHubPR } from "@/app/actions/github";
import type { JulesSession } from "@/lib/jules-client";
import type { TaskItem } from "./task-card";

export type ColumnType = "backlog" | "in_progress" | "review" | "done";

export interface Column {
	id: ColumnType;
	title: string;
	items: TaskItem[];
}

export function filterItem(
	item: TaskItem,
	searchQuery: string,
	typeFilter: "all" | "issue" | "pr" | "session",
): boolean {
	// Type Filter
	if (typeFilter !== "all" && item.type !== typeFilter) return false;

	// Search Filter
	if (searchQuery) {
		const query = searchQuery.toLowerCase();
		const title = (
			item.type === "session"
				? item.data.title || item.data.prompt
				: item.data.title
		)?.toLowerCase();
		const id = (
			item.type === "session" ? item.data.id : item.data.number.toString()
		)?.toLowerCase();

		if (!title?.includes(query) && !id?.includes(query)) return false;
	}

	return true;
}

export function buildColumns(
	issues: GitHubIssue[] = [],
	closedIssues: GitHubIssue[] = [],
	prs: GitHubPR[] = [],
	closedPrs: GitHubPR[] = [],
	sessions: JulesSession[] = [],
	searchQuery: string,
	typeFilter: "all" | "issue" | "pr" | "session",
): Column[] {
	const filterFn = (item: TaskItem) =>
		filterItem(item, searchQuery, typeFilter);

	const backlogItems: TaskItem[] = (Array.isArray(issues) ? issues : [])
		.map((i) => ({
			type: "issue" as const,
			data: i,
		}))
		.filter(filterFn);

	const sessionItems: TaskItem[] = (Array.isArray(sessions) ? sessions : [])
		.filter(
			(s) =>
				s.state !== "COMPLETED" && s.state !== "FAILED" && s.state !== "PAUSED",
		)
		.map((s) => ({ type: "session" as const, data: s }))
		.filter(filterFn);

	const reviewItems: TaskItem[] = (Array.isArray(prs) ? prs : [])
		.map((p) => ({
			type: "pr" as const,
			data: p,
		}))
		.filter(filterFn);

	const doneItems: TaskItem[] = [
		...(Array.isArray(closedPrs) ? closedPrs : []).map((p) => ({
			type: "pr" as const,
			data: p,
		})),
		...(Array.isArray(closedIssues) ? closedIssues : []).map((i) => ({
			type: "issue" as const,
			data: i,
		})),
	]
		.filter(filterFn)
		.sort(
			(a, b) =>
				new Date(b.data.updated_at).getTime() -
				new Date(a.data.updated_at).getTime(),
		);

	return [
		{ id: "backlog", title: "Backlog", items: backlogItems },
		{ id: "in_progress", title: "In Progress (Jules)", items: sessionItems },
		{ id: "review", title: "Review", items: reviewItems },
		{ id: "done", title: "Done", items: doneItems },
	];
}
