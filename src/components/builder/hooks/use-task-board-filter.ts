"use client";

import { type Dispatch, type SetStateAction, useMemo, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import type { GitHubIssue, GitHubPR } from "@/app/actions/github";
import type { TaskItem } from "@/components/builder/task-card";
import type { JulesSession } from "@/lib/jules-client";

type ColumnType = "backlog" | "in_progress" | "review" | "done";
type FilterType = "all" | "issue" | "pr" | "session";

export interface Column {
	id: ColumnType;
	title: string;
	items: TaskItem[];
}

interface UseTaskBoardFilterProps {
	issues: GitHubIssue[] | undefined;
	closedIssues: GitHubIssue[] | undefined;
	prs: GitHubPR[] | undefined;
	closedPrs: GitHubPR[] | undefined;
	sessions: JulesSession[] | undefined;
}

export interface UseTaskBoardFilterReturn {
	searchQuery: string;
	setSearchQuery: Dispatch<SetStateAction<string>>;
	typeFilter: FilterType;
	setTypeFilter: Dispatch<SetStateAction<FilterType>>;
	columns: Column[];
}

export function useTaskBoardFilter({
	issues,
	closedIssues,
	prs,
	closedPrs,
	sessions,
}: UseTaskBoardFilterProps): UseTaskBoardFilterReturn {
	const [searchQuery, setSearchQuery] = useState("");
	const [typeFilter, setTypeFilter] = useLocalStorage<FilterType>(
		"builder-type-filter",
		"all",
	);

	const columns: Column[] = useMemo(() => {
		const filterItem = (item: TaskItem) => {
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
		};

		const backlogItems: TaskItem[] = (Array.isArray(issues) ? issues : [])
			.map((i) => ({
				type: "issue" as const,
				data: i,
			}))
			.filter(filterItem);

		const sessionItems: TaskItem[] = (Array.isArray(sessions) ? sessions : [])
			.filter(
				(s) =>
					s.state !== "COMPLETED" &&
					s.state !== "FAILED" &&
					s.state !== "PAUSED",
			)
			.map((s) => ({ type: "session" as const, data: s }))
			.filter(filterItem);

		const reviewItems: TaskItem[] = (Array.isArray(prs) ? prs : [])
			.map((p) => ({
				type: "pr" as const,
				data: p,
			}))
			.filter(filterItem);

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
			.filter(filterItem)
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
	}, [issues, closedIssues, prs, closedPrs, sessions, searchQuery, typeFilter]);

	return {
		searchQuery,
		setSearchQuery,
		typeFilter,
		setTypeFilter,
		columns,
	};
}
