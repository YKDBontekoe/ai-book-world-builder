"use client";

import { useQuery } from "@tanstack/react-query";
import { BookOpenIcon, LinkIcon, SparklesIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { getEntities } from "@/app/actions/entities";
import { getRelationships } from "@/app/actions/project-stats";
import { LoadingSpinner } from "@/components/atoms/loading-spinner";
import { EmptyState } from "@/components/molecules/empty-state";
import { SectionHeader } from "@/components/molecules/section-header";
import { useBookCanvasLayout } from "@/components/organisms/book-canvas/book-canvas-context";
import {
	BibleToolbar,
	type SortOption,
	type ViewMode,
} from "@/components/organisms/book-canvas/panes/bible/bible-toolbar";
import { EntityGroupSection } from "@/components/organisms/book-canvas/panes/bible/entity-group-section";
import { SourceMaterialsSection } from "@/components/organisms/book-canvas/panes/bible/source-materials-section";
import { useEntityGrouping } from "@/hooks/use-entity-grouping";
import { QUERY_KEYS } from "@/lib/query-options";

/**
 * The Story Bible pane allowing users to browse, filter, and manage entities.
 *
 * Consumes `useBookCanvasLayout` to access the current `projectId`.
 * Fetches entities and relationships, grouping them by type and supporting
 * sorting and view modes (list/grid).
 */
export function BiblePane(): React.JSX.Element {
	const { projectId } = useBookCanvasLayout();

	// View state
	const [searchQuery, setSearchQuery] = useState("");
	const [typeFilter, setTypeFilter] = useState("all");
	const [sortOption, setSortOption] = useState<SortOption>("name-asc");
	const [viewMode, setViewMode] = useState<ViewMode>("list");

	const { data: entities, isLoading: entitiesLoading } = useQuery({
		queryKey: projectId ? QUERY_KEYS.entities(projectId) : ["entities", "null"],
		queryFn: async () => {
			if (!projectId) return [];
			const result = await getEntities({ projectId });
			if (!result.success) throw new Error(result.error);
			return result.data;
		},
		enabled: !!projectId,
		refetchInterval: 3000,
	});

	const { data: relationships, isLoading: relationshipsLoading } = useQuery({
		queryKey: projectId
			? QUERY_KEYS.relationships(projectId)
			: ["relationships", "null"],
		queryFn: async () => {
			if (!projectId) return [];
			const result = await getRelationships({ projectId });
			if (!result.success) throw new Error(result.error);
			return result.data;
		},
		enabled: !!projectId,
		refetchInterval: 5000,
	});

	const isLoading = entitiesLoading || relationshipsLoading;

	// Filter and sort entities before grouping
	const filteredEntities = useMemo(() => {
		if (!entities) return [];
		let filtered = [...entities];

		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(e) =>
					e.name.toLowerCase().includes(query) ||
					e.summary?.toLowerCase().includes(query),
			);
		}

		if (typeFilter !== "all") {
			filtered = filtered.filter((e) => e.kind === typeFilter);
		}

		return filtered;
	}, [entities, searchQuery, typeFilter]);

	// Use hook for grouping logic
	const entityGroups = useEntityGrouping(filteredEntities);

	// Sort entities within groups
	const sortedGroups = useMemo(() => {
		// Precompute relationship counts if needed
		const relationshipCounts = new Map<string, number>();
		if (sortOption === "relationships" && relationships) {
			for (const r of relationships) {
				relationshipCounts.set(
					r.sourceEntityId,
					(relationshipCounts.get(r.sourceEntityId) || 0) + 1,
				);
				relationshipCounts.set(
					r.targetEntityId,
					(relationshipCounts.get(r.targetEntityId) || 0) + 1,
				);
			}
		}

		return entityGroups.map((group) => {
			const sortedEntities = [...group.entities].sort((a, b) => {
				switch (sortOption) {
					case "name-asc":
						return a.name.localeCompare(b.name);
					case "name-desc":
						return b.name.localeCompare(a.name);
					case "newest":
						return (
							new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
						);
					case "relationships": {
						const countA = relationshipCounts.get(a.id) || 0;
						const countB = relationshipCounts.get(b.id) || 0;
						return countB - countA;
					}
					default:
						return 0;
				}
			});
			return { ...group, entities: sortedEntities };
		});
	}, [entityGroups, sortOption, relationships]);

	if (!projectId) {
		return (
			<div className="flex h-full flex-col items-center justify-center p-8 text-center">
				<BookOpenIcon className="h-10 w-10 text-muted-foreground/50 mb-3" />
				<p className="font-medium text-sm">No Project Selected</p>
				<p className="text-xs text-muted-foreground mt-1">
					Select a project to view your Story Bible
				</p>
			</div>
		);
	}

	const totalEntities = entities?.length ?? 0;
	const totalRelationships = relationships?.length ?? 0;

	return (
		<div className="flex flex-col gap-6 p-4">
			{/* Header with stats */}
			<SectionHeader
				title="Story Bible"
				description="Your world's entities and connections"
				metadata={
					!isLoading && totalEntities > 0 ? (
						<div className="flex items-center gap-3 text-xs text-muted-foreground ml-2">
							<span className="flex items-center gap-1">
								<BookOpenIcon className="h-3.5 w-3.5" />
								{totalEntities}
							</span>
							<span className="flex items-center gap-1">
								<LinkIcon className="h-3.5 w-3.5" />
								{totalRelationships}
							</span>
						</div>
					) : undefined
				}
				action={
					isLoading && !entities && <LoadingSpinner size="sm" variant="muted" />
				}
			/>

			{/* Source Materials for Analysis */}
			<SourceMaterialsSection projectId={projectId} />

			{/* Toolbar - Only show if we have entities or active filter */}
			{(totalEntities > 0 || searchQuery || typeFilter !== "all") && (
				<BibleToolbar
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
					typeFilter={typeFilter}
					onTypeFilterChange={setTypeFilter}
					sortOption={sortOption}
					onSortChange={setSortOption}
					viewMode={viewMode}
					onViewModeChange={setViewMode}
				/>
			)}

			{/* Entity groups */}
			{sortedGroups.length > 0 ? (
				<div className="space-y-6">
					{sortedGroups.map((group) => (
						<EntityGroupSection
							key={group.type}
							group={group}
							relationships={relationships ?? []}
							viewMode={viewMode}
						/>
					))}
				</div>
			) : (
				<EmptyState
					icon={isLoading ? undefined : SparklesIcon}
					iconClassName="text-[var(--entity-character)]"
					title={
						isLoading
							? "Loading entities..."
							: searchQuery || typeFilter !== "all"
								? "No entities found"
								: "Build Your World"
					}
					description={
						isLoading
							? undefined
							: searchQuery || typeFilter !== "all"
								? "Try adjusting your filters"
								: "Ask the AI to create characters, locations, items, and events to populate your Story Bible."
					}
					suggestions={
						isLoading || searchQuery || typeFilter !== "all"
							? undefined
							: ['"Create a protagonist"', '"Add a mysterious forest"']
					}
					action={
						isLoading ? <LoadingSpinner size="md" variant="muted" /> : undefined
					}
				/>
			)}
		</div>
	);
}
