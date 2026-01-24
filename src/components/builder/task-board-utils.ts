import type { TaskItem } from "./task-card";

export type SortOption =
	| "updated-desc"
	| "updated-asc"
	| "created-desc"
	| "created-asc";

export interface Column {
	id: string;
	title: string;
	items: TaskItem[];
}

export function sortTasks(
	tasks: TaskItem[],
	sortOption: SortOption,
): TaskItem[] {
	return [...tasks].sort((a, b) => {
		let dateA: Date;
		let dateB: Date;

		if (sortOption.startsWith("updated")) {
			dateA = new Date(
				a.type === "session" ? a.data.updatedAt : a.data.updated_at,
			);
			dateB = new Date(
				b.type === "session" ? b.data.updatedAt : b.data.updated_at,
			);
		} else {
			// created
			dateA = new Date(
				a.type === "session" ? a.data.createdAt : a.data.created_at,
			);
			dateB = new Date(
				b.type === "session" ? b.data.createdAt : b.data.created_at,
			);
		}

		if (sortOption.endsWith("desc")) {
			return dateB.getTime() - dateA.getTime();
		}
		return dateA.getTime() - dateB.getTime();
	});
}

export function generateCsv(columns: Column[]): string {
	const headers = [
		"ID",
		"Type",
		"Status",
		"Title",
		"Author",
		"Created At",
		"Updated At",
		"URL",
	];

	const rows: string[] = [];

	// Helper to escape CSV fields
	const escape = (str: string | undefined | null) => {
		if (!str) return "";
		return `"${str.replace(/"/g, '""')}"`;
	};

	for (const column of columns) {
		for (const item of column.items) {
			let id = "";
			let type = "";
			let status = "";
			let title = "";
			let author = "";
			let createdAt = "";
			let updatedAt = "";
			let url = "";

			if (item.type === "issue") {
				id = item.data.number.toString();
				type = "Issue";
				status = item.data.state;
				title = item.data.title;
				author = item.data.user?.login || "";
				createdAt = item.data.created_at;
				updatedAt = item.data.updated_at;
				url = item.data.html_url;
			} else if (item.type === "pr") {
				id = item.data.number.toString();
				type = "PR";
				status = item.data.state;
				title = item.data.title;
				author = item.data.user?.login || "";
				createdAt = item.data.created_at;
				updatedAt = item.data.updated_at;
				url = item.data.html_url;
			} else if (item.type === "session") {
				id = item.data.id;
				type = "Session";
				status = item.data.state;
				title = item.data.title || item.data.prompt || "Untitled";
				author = "Jules"; // Sessions are managed by Jules
				createdAt = item.data.createdAt;
				updatedAt = item.data.updatedAt;
				url = ""; // No external URL for sessions
			}

			rows.push(
				[
					escape(id),
					escape(type),
					escape(status),
					escape(title),
					escape(author),
					escape(createdAt),
					escape(updatedAt),
					escape(url),
				].join(","),
			);
		}
	}

	return [headers.join(","), ...rows].join("\n");
}
