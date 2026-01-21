"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
	BookOpenIcon,
	CheckSquare,
	LinkIcon,
	SparklesIcon,
	Undo2,
	X,
} from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { bulkDeleteEntitiesAction, getEntities } from "@/app/actions/entities";
import { getRelationships } from "@/app/actions/project-stats";
import { Button } from "@/components/atoms/button";
import { LoadingSpinner } from "@/components/atoms/loading-spinner";
import { EmptyState } from "@/components/molecules/empty-state";
import { GlassCard } from "@/components/molecules/glass-card";
import { SectionHeader } from "@/components/molecules/section-header";
import { useBookCanvasLayout } from "@/components/organisms/book-canvas/book-canvas-context";
import {
	BibleToolbar,
	type SortOption,
	type ViewMode,
} from "@/components/organisms/book-canvas/panes/bible/bible-toolbar";
import { BulkActionsBar } from "@/components/organisms/book-canvas/panes/bible/bulk-actions-bar";
import { CreateEntityDialog } from "@/components/organisms/book-canvas/panes/bible/create-entity-dialog";
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
	const queryClient = useQueryClient();

	// View state
	const [searchQuery, setSearchQuery] = useState("");
	const [typeFilter, setTypeFilter] = useState("all");
	const [sortOption, setSortOption] = useState<SortOption>("name-asc");
	const [viewMode, setViewMode] = useState<ViewMode>("list");

	// Selection state
	const [isSelectionMode, setIsSelectionMode] = useState(false);
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const pendingDeletionsRef = useRef<Map<string | number, NodeJS.Timeout>>(
		new Map(),
	);

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

	const toggleSelectionMode = useCallback(() => {
		setIsSelectionMode((prev) => {
			if (prev) {
				setSelectedIds(new Set());
				return false;
			}
			return true;
		});
	}, []);

	const toggleEntitySelect = useCallback((entityId: string) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(entityId)) {
				next.delete(entityId);
			} else {
				next.add(entityId);
			}
			return next;
		});
	}, []);

	const undoDelete = useCallback(
		(toastId: string | number, idsToRestore: string[]) => {
			const timeoutId = pendingDeletionsRef.current.get(toastId);
			if (timeoutId) {
				clearTimeout(timeoutId);
				pendingDeletionsRef.current.delete(toastId);
			}

			// Invalidate queries immediately to restore view if optimistic update was applied on cache
			// But here we rely on server revalidation or cache invalidation.
			// Since we haven't actually deleted yet, just dismissing toast is enough IF we didn't optimistic update locally.
			// Ideally we should optimistic delete locally.
			// But since we rely on `entities` from useQuery, we can't easily mutate it optimistically without complex logic.
			// However, SceneNavigation used `deletedSceneIds` state to hide them. I should do the same.
			// But I haven't implemented `deletedIds` filtering yet.

			// Let's implement `deletedIds` state for optimistic hiding.
			toast.dismiss(toastId);
			toast.success("Deletion undone");
		},
		[],
	);

	// TODO: Add `deletedIds` state for proper optimistic UI if needed.
	// For now, the toast just delays the API call. The user still sees the entities until the toast finishes.
	// Wait, that's bad UX. The user expects them to disappear immediately.
	// I should add `hiddenIds` state.

	const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

	const handleUndo = useCallback(
		(toastId: string | number, idsToRestore: string[]) => {
			const timeoutId = pendingDeletionsRef.current.get(toastId);
			if (timeoutId) {
				clearTimeout(timeoutId);
				pendingDeletionsRef.current.delete(toastId);
			}

			setHiddenIds((prev) => {
				const next = new Set(prev);
				idsToRestore.forEach((id) => next.delete(id));
				return next;
			});

			toast.dismiss(toastId);
			toast.success("Deletion undone");
		},
		[],
	);

	const handleBulkDelete = useCallback(() => {
		const idsToDelete = Array.from(selectedIds);
		if (idsToDelete.length === 0 || !projectId) return;

		// Optimistic hide
		setHiddenIds((prev) => {
			const next = new Set(prev);
			idsToDelete.forEach((id) => next.add(id));
			return next;
		});

		toggleSelectionMode(); // Exit selection mode

		// Show Undo Toast
		const toastId = toast.custom(
			(t) => (
				<GlassCard
					variant="liquid"
					className="flex items-center gap-4 p-4 w-full max-w-md mx-auto pointer-events-auto"
				>
					<div className="flex-1 text-sm">
						Deleted {idsToDelete.length} entities
					</div>
					<Button
						size="sm"
						variant="outline"
						className="gap-2 h-8"
						onClick={() => handleUndo(t, idsToDelete)}
					>
						<Undo2 className="h-3.5 w-3.5" />
						Undo
					</Button>
				</GlassCard>
			),
			{ duration: 4000 },
		);

		// Delayed execution
		const timeout = setTimeout(async () => {
			pendingDeletionsRef.current.delete(toastId);

			try {
				const result = await bulkDeleteEntitiesAction({
					projectId,
					ids: idsToDelete,
				});

				if (result.success) {
					// Invalidate queries to ensure sync
					queryClient.invalidateQueries({
						queryKey: QUERY_KEYS.entities(projectId),
					});
					queryClient.invalidateQueries({
						queryKey: QUERY_KEYS.relationships(projectId),
					});
					// Cleanup hiddenIds
					setHiddenIds((prev) => {
						const next = new Set(prev);
						idsToDelete.forEach((id) => next.delete(id));
						return next;
					});
				} else {
					toast.error("Failed to delete entities");
					// Restore
					handleUndo(toastId, idsToDelete);
				}
			} catch (error) {
				toast.error("Error deleting entities");
				handleUndo(toastId, idsToDelete);
			}
		}, 4000);

		pendingDeletionsRef.current.set(toastId, timeout);
	}, [selectedIds, projectId, toggleSelectionMode, handleUndo, queryClient]);

	// Shortcuts
	useHotkeys(
		"meta+a, ctrl+a",
		(event) => {
			event.preventDefault();
			if (!filteredEntities) return;
			setIsSelectionMode(true);
			setSelectedIds(new Set(filteredEntities.map((entity) => entity.id)));
		},
		{ enabled: !!filteredEntities && filteredEntities.length > 0 },
		[filteredEntities],
	);

	useHotkeys(
		"delete, backspace",
		() => {
			handleBulkDelete();
		},
		{ enabled: isSelectionMode && selectedIds.size > 0 },
		[handleBulkDelete, isSelectionMode, selectedIds],
	);

	useHotkeys(
		"escape",
		() => {
			if (isSelectionMode) {
				toggleSelectionMode();
			}
		},
		{ enabled: isSelectionMode },
		[isSelectionMode, toggleSelectionMode],
	);

	const handleBulkExport = useCallback(async () => {
		const idsToExport = Array.from(selectedIds);
		if (idsToExport.length === 0) return;

		// Find entities to export
		const entitiesToExport = entities?.filter((e) =>
			idsToExport.includes(e.id),
		);
		if (!entitiesToExport) return;

		// Format as JSON or text
		const exportData = JSON.stringify(entitiesToExport, null, 2);

		try {
			await navigator.clipboard.writeText(exportData);
			toast.success(`Copied ${entitiesToExport.length} entities to clipboard`);
			toggleSelectionMode();
		} catch (error) {
			toast.error("Failed to copy to clipboard");
		}
	}, [selectedIds, entities, toggleSelectionMode]);

	// Filter out hidden entities
	const visibleSortedGroups = useMemo(() => {
		return sortedGroups
			.map((group) => ({
				...group,
				entities: group.entities.filter((e) => !hiddenIds.has(e.id)),
			}))
			.filter((group) => group.entities.length > 0);
	}, [sortedGroups, hiddenIds]);

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
		<div className="flex flex-col gap-6 p-4 pb-20 relative">
			{/* Header with stats and actions */}
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
					<div className="flex items-center gap-2">
						{isLoading && !entities && (
							<LoadingSpinner size="sm" variant="muted" />
						)}
						<Button
							variant={isSelectionMode ? "secondary" : "ghost"}
							size="icon"
							className="h-8 w-8"
							onClick={toggleSelectionMode}
							title={isSelectionMode ? "Cancel Selection" : "Select Entities"}
						>
							{isSelectionMode ? (
								<X className="h-4 w-4" />
							) : (
								<CheckSquare className="h-4 w-4" />
							)}
						</Button>
						<CreateEntityDialog
							projectId={projectId}
							defaultType={typeFilter === "all" ? undefined : typeFilter}
						/>
					</div>
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
			{visibleSortedGroups.length > 0 ? (
				<div className="space-y-6">
					{visibleSortedGroups.map((group) => (
						<EntityGroupSection
							key={group.type}
							group={group}
							relationshipCounts={relationshipCounts}
							viewMode={viewMode}
							isSelectionMode={isSelectionMode}
							selectedIds={selectedIds}
							onToggleSelect={toggleEntitySelect}
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
						isLoading ? (
							<LoadingSpinner size="md" variant="muted" />
						) : (
							<CreateEntityDialog
								projectId={projectId}
								trigger={
									<Button>
										<SparklesIcon className="mr-2 h-4 w-4" />
										Start Creating
									</Button>
								}
							/>
						)
					}
				/>
			)}

			<BulkActionsBar
				selectedCount={selectedIds.size}
				onDelete={handleBulkDelete}
				onExport={handleBulkExport}
				onClearSelection={toggleSelectionMode}
			/>
		</div>
	);
}
