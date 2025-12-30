import { useMemo, useState } from "react";
import type { Project } from "@/lib/db/schema";

export type SortOption = "newest" | "oldest" | "a-z" | "z-a";
export type VisibilityFilter = "all" | "public" | "private";

export function useProjectFiltering(projects: Project[]) {
	const [searchQuery, setSearchQuery] = useState("");
	const [sortOption, setSortOption] = useState<SortOption>("newest");
	const [visibilityFilter, setVisibilityFilter] =
		useState<VisibilityFilter>("all");
	const [optimisticDeletedIds, setOptimisticDeletedIds] = useState<Set<string>>(
		new Set(),
	);

	const filteredProjects = useMemo(() => {
		let result = [...projects];

		// Filter out optimistically deleted projects
		result = result.filter((p) => !optimisticDeletedIds.has(p.id));

		// Filter by Visibility
		if (visibilityFilter !== "all") {
			result = result.filter((p) => p.visibility === visibilityFilter);
		}

		// Filter by Search
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			result = result.filter(
				(p) =>
					p.name.toLowerCase().includes(query) ||
					p.description?.toLowerCase().includes(query),
			);
		}

		// Sort
		result.sort((a, b) => {
			switch (sortOption) {
				case "newest":
					return (
						new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
					);
				case "oldest":
					return (
						new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
					);
				case "a-z":
					return a.name.localeCompare(b.name);
				case "z-a":
					return b.name.localeCompare(a.name);
				default:
					return 0;
			}
		});

		return result;
	}, [
		projects,
		searchQuery,
		sortOption,
		optimisticDeletedIds,
		visibilityFilter,
	]);

	return {
		searchQuery,
		setSearchQuery,
		sortOption,
		setSortOption,
		visibilityFilter,
		setVisibilityFilter,
		optimisticDeletedIds,
		setOptimisticDeletedIds,
		filteredProjects,
	};
}
