"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpenIcon, LinkIcon, SparklesIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
	bulkDeleteEntitiesAction,
	createEntityAction,
	getEntities,
} from "@/app/actions/entities";
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
import { CreateEntityDialog } from "@/components/organisms/book-canvas/panes/bible/create-entity-dialog";
import { EntityGroupSection } from "@/components/organisms/book-canvas/panes/bible/entity-group-section";
import { SourceMaterialsSection } from "@/components/organisms/book-canvas/panes/bible/source-materials-section";
import { BulkActionsBar } from "@/components/organisms/projects/bulk-actions-bar";
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
	const queryClient = useQueryClient();

	// View state
	const [searchQuery, setSearchQuery] = useState("");
	const [typeFilter, setTypeFilter] = useState("all");
	const [sortOption, setSortOption] = useState<SortOption>("name-asc");
	const [viewMode, setViewMode] = useState<ViewMode>("list");

	// Selection state
	const [selectedEntityIds, setSelectedEntityIds] = useState<Set<string>>(
		new Set(),
	);
	const [isProcessing, setIsProcessing] = useState(false);

	// Create Dialog state
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isCreating, setIsCreating] = useState(false);

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

	// Actions
	const handleSelect = (id: string, selected: boolean) => {
		const newSelected = new Set(selectedEntityIds);
		if (selected) {
			newSelected.add(id);
		} else {
			newSelected.delete(id);
		}
		setSelectedEntityIds(newSelected);
	};

	const handleSelectAll = () => {
		if (selectedEntityIds.size === filteredEntities.length) {
			setSelectedEntityIds(new Set());
		} else {
			setSelectedEntityIds(new Set(filteredEntities.map((e) => e.id)));
		}
	};

	const handleBulkDelete = async () => {
		if (selectedEntityIds.size === 0) return;

		setIsProcessing(true);
		const idsToDelete = Array.from(selectedEntityIds);

		try {
			// Optimistic update
			queryClient.setQueryData(
				QUERY_KEYS.entities(projectId || ""),
				(old: any[]) =>
					old?.filter((e: any) => !selectedEntityIds.has(e.id)) || [],
			);

			const result = await bulkDeleteEntitiesAction({ ids: idsToDelete });
			if (result.success) {
				toast.success(`Deleted ${idsToDelete.length} entities`);
				setSelectedEntityIds(new Set());
			} else {
				throw new Error("Failed to delete entities");
			}
		} catch (error) {
			console.error("Failed to delete entities:", error);
			toast.error("Failed to delete entities");
			queryClient.invalidateQueries({
				queryKey: QUERY_KEYS.entities(projectId || ""),
			});
		} finally {
			setIsProcessing(false);
		}
	};

	const handleCreateEntity = async (values: {
		name: string;
		kind: string;
		summary?: string;
	}) => {
		if (!projectId) return;

		setIsCreating(true);
		try {
			const result = await createEntityAction({
				projectId,
				name: values.name,
				kind: values.kind,
				summary: values.summary,
			});

			if (result) {
				toast.success("Entity created successfully");
				queryClient.invalidateQueries({
					queryKey: QUERY_KEYS.entities(projectId),
				});
				setIsCreateDialogOpen(false);
			}
		} catch (error) {
			console.error("Failed to create entity:", error);
			toast.error("Failed to create entity");
		} finally {
			setIsCreating(false);
		}
	};

	const handleBulkExportJson = () => {
		const entitiesToExport = filteredEntities.filter((e) =>
			selectedEntityIds.has(e.id),
		);
		const dataStr = JSON.stringify(entitiesToExport, null, 2);
		const blob = new Blob([dataStr], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `entities_export_${new Date().toISOString().split("T")[0]}.json`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		toast.success(`Exported ${entitiesToExport.length} entities to JSON`);
		setSelectedEntityIds(new Set());
	};

	const handleBulkExportCsv = () => {
		const entitiesToExport = filteredEntities.filter((e) =>
			selectedEntityIds.has(e.id),
		);
		const headers = ["ID", "Name", "Type", "Summary"];
		const csvContent = [
			headers.join(","),
			...entitiesToExport.map((e) => {
				const row = [
					e.id,
					`"${(e.name || "").replace(/"/g, '""')}"`,
					e.kind,
					`"${(e.summary || "").replace(/"/g, '""')}"`,
				];
				return row.join(",");
			}),
		].join("\n");

		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `entities_export_${new Date().toISOString().split("T")[0]}.csv`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		toast.success(`Exported ${entitiesToExport.length} entities to CSV`);
		setSelectedEntityIds(new Set());
	};

	// Use hook for grouping logic
	const entityGroups = useEntityGrouping(filteredEntities);

	// Precompute relationship counts once for both sorting and child components
	const relationshipCounts = useMemo(() => {
		const counts = new Map<string, number>();
		if (!relationships) return counts;

		for (const r of relationships) {
			counts.set(r.sourceEntityId, (counts.get(r.sourceEntityId) || 0) + 1);
			counts.set(r.targetEntityId, (counts.get(r.targetEntityId) || 0) + 1);
		}
		return counts;
	}, [relationships]);

	// Sort entities within groups
	const sortedGroups = useMemo(() => {
		return entityGroups.map((group) => {
			const sortedEntities = [...group.entities].sort((a, b) => {
				switch (sortOption) {
					case "name-asc":
						return a.name.localeCompare(b.name, undefined, {
							sensitivity: "base",
						});
					case "name-desc":
						return b.name.localeCompare(a.name, undefined, {
							sensitivity: "base",
						});
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
	}, [entityGroups, sortOption, relationshipCounts]);

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
			<BibleToolbar
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				typeFilter={typeFilter}
				onTypeFilterChange={setTypeFilter}
				sortOption={sortOption}
				onSortChange={setSortOption}
				viewMode={viewMode}
				onViewModeChange={setViewMode}
				onCreate={() => setIsCreateDialogOpen(true)}
			/>

			{/* Entity groups */}
			{sortedGroups.length > 0 ? (
				<div className="space-y-6 pb-20">
					{sortedGroups.map((group) => (
						<EntityGroupSection
							key={group.type}
							group={group}
							relationshipCounts={relationshipCounts}
							viewMode={viewMode}
							selectedIds={selectedEntityIds}
							onSelect={handleSelect}
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
								: "Create your first entity manually or ask the AI to help you build your world."
					}
					suggestions={
						isLoading || searchQuery || typeFilter !== "all"
							? undefined
							: ['"Create a protagonist"', '"Add a mysterious forest"']
					}
					action={
						isLoading ? (
							<LoadingSpinner size="md" variant="muted" />
						) : (
							<Button onClick={() => setIsCreateDialogOpen(true)}>
								Create Entity
							</Button>
						)
					}
				/>
			)}

			<BulkActionsBar
				selectedCount={selectedEntityIds.size}
				isProcessing={isProcessing}
				onClear={() => setSelectedEntityIds(new Set())}
				onSelectAll={handleSelectAll}
				onDelete={handleBulkDelete}
				onDuplicate={() =>
					toast.info("Duplicate not implemented for entities yet")
				}
				onExportJson={handleBulkExportJson}
				onExportCsv={handleBulkExportCsv}
			/>

			<CreateEntityDialog
				projectId={projectId || ""}
				open={isCreateDialogOpen}
				onOpenChange={setIsCreateDialogOpen}
				onSubmit={handleCreateEntity}
				isSubmitting={isCreating}
			/>
		</div>
	);
}
