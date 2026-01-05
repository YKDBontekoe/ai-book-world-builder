"use client";

import { useQuery } from "@tanstack/react-query";
import { BookOpenIcon, LinkIcon, SparklesIcon } from "lucide-react";
import { getEntities } from "@/app/actions/entities";
import { getRelationships } from "@/app/actions/project-stats";
import { LoadingSpinner } from "@/components/atoms/loading-spinner";
import { EmptyState } from "@/components/molecules/empty-state";
import { SectionHeader } from "@/components/molecules/section-header";
import { useBookCanvasLayout } from "@/components/organisms/book-canvas/book-canvas-context";
import { EntityGroupSection } from "@/components/organisms/book-canvas/panes/bible/entity-group-section";
import { SourceMaterialsSection } from "@/components/organisms/book-canvas/panes/bible/source-materials-section";
import { useEntityGrouping } from "@/hooks/use-entity-grouping";
import { QUERY_KEYS } from "@/lib/query-options";

export function BiblePane() {
	const { projectId } = useBookCanvasLayout();

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

	// Use hook for grouping logic
	const entityGroups = useEntityGrouping(entities);

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

			{/* Entity groups */}
			{entityGroups.length > 0 ? (
				<div className="space-y-6">
					{entityGroups.map((group) => (
						<EntityGroupSection
							key={group.type}
							group={group}
							relationships={relationships ?? []}
						/>
					))}
				</div>
			) : (
				<EmptyState
					icon={isLoading ? undefined : SparklesIcon}
					iconClassName="text-[var(--entity-character)]"
					title={isLoading ? "Loading entities..." : "Build Your World"}
					description={
						isLoading
							? undefined
							: "Ask the AI to create characters, locations, items, and events to populate your Story Bible."
					}
					suggestions={
						isLoading
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
