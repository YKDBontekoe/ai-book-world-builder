import { isEqual } from "lodash";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";
import type { ChapterWithScenes } from "@/lib/types";

export interface UseSceneNavigationResult {
	expandedChapters: string[];
	handleExpandedChange: (newValues: string[]) => void;
	searchTerm: string;
	handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	filteredStructure: ChapterWithScenes[] | null;
	handleExpandAll: () => void;
	handleCollapseAll: () => void;
	clearSearch: () => void;
}

export function useSceneNavigation(
	structure: ChapterWithScenes[] | null,
	deletedSceneIds: Set<string>,
	deletedChapterIds?: Set<string>,
): UseSceneNavigationResult {
	const [expandedChapters, setExpandedChapters] = useState<string[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

	// Stable setter for expanded chapters
	const handleExpandedChange = useCallback((newValues: string[]) => {
		setExpandedChapters((prev) =>
			isEqual(prev, newValues) ? prev : newValues,
		);
	}, []);

	// Initialize expanded state when structure loads
	const hasInitializedRef = useRef(false);

	useEffect(() => {
		if (structure && structure.length > 0 && !hasInitializedRef.current) {
			const initialIds = structure.map((c) => c.id);
			setExpandedChapters(initialIds);
			hasInitializedRef.current = true;
		}
	}, [structure]);

	// Search handling
	const updateDebouncedSearch = useCallback((value: string) => {
		setDebouncedSearchTerm(value);
	}, []);

	const debouncedSearch = useDebounceCallback(updateDebouncedSearch, 300);

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
		debouncedSearch(e.target.value);
	};

	const filteredStructure = useMemo(() => {
		if (!structure) return null;

		if (
			!debouncedSearchTerm &&
			deletedSceneIds.size === 0 &&
			(!deletedChapterIds || deletedChapterIds.size === 0)
		) {
			return structure;
		}

		const baseStructure = structure;
		const lowerTerm = debouncedSearchTerm.toLowerCase();

		return baseStructure
			.filter((chapter) => !deletedChapterIds?.has(chapter.id))
			.map((chapter) => {
				const titleMatch = chapter.title.toLowerCase().includes(lowerTerm);
				const matchingScenes = chapter.scenes.filter(
					(scene) =>
						!deletedSceneIds.has(scene.id) &&
						scene.title.toLowerCase().includes(lowerTerm),
				);

				if (matchingScenes.length > 0) {
					return {
						...chapter,
						scenes: matchingScenes,
					};
				}

				if (titleMatch) {
					const visibleScenes = chapter.scenes.filter(
						(s) => !deletedSceneIds.has(s.id),
					);
					return {
						...chapter,
						scenes: visibleScenes,
					};
				}

				return null;
			})
			.filter(Boolean) as ChapterWithScenes[];
	}, [structure, debouncedSearchTerm, deletedSceneIds, deletedChapterIds]);

	// Auto-expand on search
	useEffect(() => {
		if (debouncedSearchTerm && filteredStructure) {
			const matchingIds = filteredStructure.map((c) => c.id);
			setExpandedChapters((prev) => {
				return isEqual(prev, matchingIds) ? prev : matchingIds;
			});
		}
	}, [debouncedSearchTerm, filteredStructure]);

	const handleExpandAll = useCallback(() => {
		if (structure) {
			const allIds = structure.map((c) => c.id);
			setExpandedChapters((prev) => (isEqual(prev, allIds) ? prev : allIds));
		}
	}, [structure]);

	const handleCollapseAll = useCallback(() => {
		setExpandedChapters((prev) => (prev.length === 0 ? prev : []));
	}, []);

	const clearSearch = useCallback(() => {
		setSearchTerm("");
		debouncedSearch("");
	}, [debouncedSearch]);

	return {
		expandedChapters,
		handleExpandedChange,
		searchTerm,
		handleSearchChange,
		filteredStructure,
		handleExpandAll,
		handleCollapseAll,
		clearSearch,
	};
}
