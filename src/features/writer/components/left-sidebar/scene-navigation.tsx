"use client";

import { isEqual } from "lodash";
import {
	BookPlus,
	CheckSquare,
	ChevronsDown,
	ChevronsUp,
	Download,
	Loader2,
	Plus,
	Search,
	SearchX,
	Trash2,
	Undo2,
	X,
} from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { useDebounceCallback } from "usehooks-ts";
import { Accordion } from "@/components/atoms/accordion";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { ScrollArea } from "@/components/atoms/scroll-area";
import { EmptyState } from "@/components/molecules/empty-state";
import { GlassCard } from "@/components/molecules/glass-card";
import {
	bulkDeleteScenes,
	bulkExportScenes,
	createNewChapter,
	createSceneInChapter,
	generateScene,
	updateSceneTitle,
} from "@/features/writer/actions";
import { SceneNavigationSkeleton } from "@/features/writer/components/left-sidebar/scene-navigation-skeleton";
import { SidebarChapter } from "@/features/writer/components/left-sidebar/sidebar-chapter";
import type { Project } from "@/lib/db/schema";
import type { ChapterWithScenes } from "@/lib/types";

interface SceneNavigationProps {
	project: Project;
	activeSceneId: string | null;
	onSceneSelect: (sceneId: string | null) => void;
	structure: ChapterWithScenes[] | null;
	loading: boolean;
	onStructureUpdate?: () => void;
	readOnly?: boolean;
}

export const SceneNavigation = memo(function SceneNavigation({
	project,
	activeSceneId,
	onSceneSelect,
	structure,
	loading,
	onStructureUpdate,
	readOnly,
}: SceneNavigationProps) {
	const [isGenerating, setIsGenerating] = useState(false);
	const [isCreatingChapter, setIsCreatingChapter] = useState(false);
	const [expandedChapters, setExpandedChapters] = useState<string[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
	const [isSelectionMode, setIsSelectionMode] = useState(false);
	const [selectedSceneIds, setSelectedSceneIds] = useState<Set<string>>(
		new Set(),
	);
	const [deletedSceneIds, setDeletedSceneIds] = useState<Set<string>>(
		new Set(),
	);
	const pendingDeletionsRef = useRef<Map<string | number, NodeJS.Timeout>>(
		new Map(),
	);

	// Stable setter for expanded chapters to prevent loops
	const handleExpandedChange = useCallback((newValues: string[]) => {
		setExpandedChapters((prev) =>
			isEqual(prev, newValues) ? prev : newValues,
		);
	}, []);

	// ⚡ Bolt: Store activeSceneId in ref to prevent prop instability in onDelete
	// This prevents all SceneItems from re-rendering when selection changes
	const activeSceneIdRef = useRef(activeSceneId);
	useEffect(() => {
		activeSceneIdRef.current = activeSceneId;
	}, [activeSceneId]);

	// Initialize expanded state when structure loads - only if not already initialized
	const hasInitializedRef = useRef(false);

	useEffect(() => {
		if (structure && structure.length > 0 && !hasInitializedRef.current) {
			const initialIds = structure.map((c) => c.id);
			setExpandedChapters(initialIds);
			hasInitializedRef.current = true;
		}
	}, [structure]); // Only depend on structure for initialization

	// Cleanup deletedSceneIds when structure updates
	useEffect(() => {
		if (!structure) return;

		setDeletedSceneIds((prev) => {
			if (prev.size === 0) return prev;

			const currentIds = new Set<string>();
			structure.forEach((chapter) => {
				chapter.scenes.forEach((scene) => {
					currentIds.add(scene.id);
				});
			});

			const next = new Set(prev);
			let changed = false;
			for (const id of prev) {
				if (!currentIds.has(id)) {
					next.delete(id);
					changed = true;
				}
			}

			return changed ? next : prev;
		});
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

		// Optimization: Return original structure if no filtering is active
		// This preserves object identity for unaffected chapters, allowing memoized SidebarChapter to skip re-renders
		if (!debouncedSearchTerm && deletedSceneIds.size === 0) {
			return structure;
		}

		const baseStructure = structure;
		const lowerTerm = debouncedSearchTerm.toLowerCase();

		return baseStructure
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
	}, [structure, debouncedSearchTerm, deletedSceneIds]);

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

	const handleGenerateNextScene = useCallback(
		async (chapterId: string, prevSceneId?: string) => {
			setIsGenerating(true);
			const toastId = toast.loading("Generating new scene...");

			try {
				const result = await generateScene(chapterId, prevSceneId);
				if (result.success && result.sceneId) {
					toast.success("Scene generated!", { id: toastId });
					onStructureUpdate?.();
				} else {
					toast.error("Generation failed", { id: toastId });
				}
			} catch (_e) {
				toast.error("Error generating scene", { id: toastId });
			} finally {
				setIsGenerating(false);
			}
		},
		[onStructureUpdate],
	);

	const handleCreateSceneManually = useCallback(
		async (chapterId: string) => {
			const toastId = toast.loading("Creating scene...");
			try {
				const result = await createSceneInChapter(chapterId, "New Scene");
				if (result.success && result.sceneId) {
					toast.success("Scene created", { id: toastId });
					onStructureUpdate?.();
					// Optionally select the new scene
					onSceneSelect(result.sceneId);
				} else {
					toast.error(result.error || "Failed to create scene", {
						id: toastId,
					});
				}
			} catch (_e) {
				toast.error("Error creating scene", { id: toastId });
			}
		},
		[onStructureUpdate, onSceneSelect],
	);

	const handleRenameScene = useCallback(
		async (sceneId: string, newTitle: string) => {
			const toastId = toast.loading("Renaming scene...");
			try {
				const result = await updateSceneTitle(sceneId, newTitle);
				if (result.success) {
					toast.success("Scene renamed", { id: toastId });
					onStructureUpdate?.();
				} else {
					toast.error("Failed to rename scene", { id: toastId });
				}
			} catch (_e) {
				toast.error("Error renaming scene", { id: toastId });
			}
		},
		[onStructureUpdate],
	);

	const undoDelete = useCallback(
		(toastId: string | number, idsToRestore: string[]) => {
			const timeoutId = pendingDeletionsRef.current.get(toastId);
			if (timeoutId) {
				clearTimeout(timeoutId);
				pendingDeletionsRef.current.delete(toastId);
			}

			setDeletedSceneIds((prev) => {
				const next = new Set(prev);
				idsToRestore.forEach((id) => {
					next.delete(id);
				});
				return next;
			});

			toast.dismiss(toastId);
			toast.success("Deletion undone");
		},
		[],
	);

	const performDelete = useCallback(
		(idsToDelete: string[]) => {
			// Optimistic update
			setDeletedSceneIds((prev) => {
				const next = new Set(prev);
				idsToDelete.forEach((id) => {
					next.add(id);
				});
				return next;
			});

			if (activeSceneId && idsToDelete.includes(activeSceneId)) {
				onSceneSelect(null);
			}

			// Show Undo Toast
			const toastId = toast.custom(
				(t) => (
					<GlassCard
						variant="liquid"
						className="flex items-center gap-4 p-4 w-full max-w-md mx-auto pointer-events-auto"
					>
						<div className="flex-1 text-sm">
							Deleted {idsToDelete.length} scene
							{idsToDelete.length !== 1 ? "s" : ""}
						</div>
						<Button
							size="sm"
							variant="outline"
							className="gap-2 h-8"
							onClick={() => undoDelete(t, idsToDelete)}
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

				const result = await bulkDeleteScenes(idsToDelete);

				if (result.success) {
					onStructureUpdate?.();
					// Do not cleanup here. The useEffect above will handle it
					// once the structure actually updates, preventing content flash.
				} else {
					toast.error("Failed to delete scenes");
					// Restore on error
					setDeletedSceneIds((prev) => {
						const next = new Set(prev);
						idsToDelete.forEach((id) => {
							next.delete(id);
						});
						return next;
					});
				}
			}, 4000);

			pendingDeletionsRef.current.set(toastId, timeout);
		},
		[activeSceneId, onSceneSelect, onStructureUpdate, undoDelete],
	);

	const handleDeleteScene = useCallback(
		async (sceneId: string) => {
			performDelete([sceneId]);
		},
		[performDelete],
	);

	const handleCreateChapter = async () => {
		setIsCreatingChapter(true);
		const toastId = toast.loading("Creating new chapter...");
		try {
			const result = await createNewChapter(project.id);
			if (result.success) {
				toast.success("Chapter created!", { id: toastId });
				onStructureUpdate?.();
			} else {
				toast.error("Failed to create chapter", { id: toastId });
			}
		} catch (_e) {
			toast.error("Error creating chapter", { id: toastId });
		} finally {
			setIsCreatingChapter(false);
		}
	};

	const toggleSelectionMode = useCallback(() => {
		setIsSelectionMode((prev) => {
			if (prev) {
				setSelectedSceneIds(new Set());
				return false;
			}
			return true;
		});
	}, []);

	const toggleSceneSelect = useCallback((sceneId: string) => {
		setSelectedSceneIds((prev) => {
			const next = new Set(prev);
			if (next.has(sceneId)) {
				next.delete(sceneId);
			} else {
				next.add(sceneId);
			}
			return next;
		});
	}, []);

	const handleBulkExport = async () => {
		const toastId = toast.loading("Exporting scenes...");
		try {
			const ids = Array.from(selectedSceneIds);
			const result = await bulkExportScenes(ids);
			if (result.success && result.content) {
				await navigator.clipboard.writeText(result.content);
				toast.success("Copied to clipboard", { id: toastId });
				toggleSelectionMode();
			} else {
				toast.error(result.error || "Failed to export", { id: toastId });
			}
		} catch (_error) {
			toast.error("Error exporting scenes", { id: toastId });
		}
	};

	const handleBulkDelete = useCallback(() => {
		const ids = Array.from(selectedSceneIds);
		if (ids.length === 0) return;

		performDelete(ids);
		toggleSelectionMode();
	}, [selectedSceneIds, performDelete, toggleSelectionMode]);

	useHotkeys(
		"delete, backspace",
		() => {
			handleBulkDelete();
		},
		{ enabled: isSelectionMode && selectedSceneIds.size > 0 },
		[handleBulkDelete, isSelectionMode, selectedSceneIds],
	);

	if (loading) {
		return <SceneNavigationSkeleton />;
	}

	if (!structure) {
		return (
			<div className="p-4 text-sm text-muted-foreground">
				Failed to load structure.
			</div>
		);
	}

	// Only show empty state if there are no chapters AND no search term
	if (structure.length === 0 && !searchTerm) {
		return (
			<div className="h-full flex items-center justify-center p-4">
				<EmptyState
					title="No chapters yet"
					description="Start building your story by adding the first chapter."
					icon={BookPlus}
					variant="glass"
					className="w-full max-w-sm"
					action={
						<Button
							onClick={handleCreateChapter}
							disabled={isCreatingChapter || readOnly}
							variant="default"
							size="sm"
							className="mt-2"
						>
							{isCreatingChapter ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<Plus className="mr-2 h-4 w-4" />
							)}
							Add First Chapter
						</Button>
					}
				/>
			</div>
		);
	}

	const displayStructure = filteredStructure || [];

	return (
		<div className="flex flex-col h-full">
			<div className="px-4 py-2 space-y-2">
				<div className="relative">
					<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
					<Input
						placeholder="Search scenes..."
						aria-label="Search scenes"
						value={searchTerm}
						onChange={handleSearchChange}
						className="pl-8 h-9 text-sm"
					/>
				</div>
				<div className="flex items-center justify-between">
					<span className="text-xs font-medium text-muted-foreground">
						{displayStructure.length} Chapters
						{searchTerm &&
							` (${structure.length - displayStructure.length} hidden)`}
					</span>
					<div className="flex gap-1">
						<Button
							variant={isSelectionMode ? "secondary" : "ghost"}
							size="icon"
							className="h-6 w-6"
							onClick={toggleSelectionMode}
							title="Select Scenes"
						>
							{isSelectionMode ? (
								<X className="h-3 w-3" />
							) : (
								<CheckSquare className="h-3 w-3" />
							)}
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6"
							onClick={handleExpandAll}
							title="Expand All"
						>
							<ChevronsDown className="h-3 w-3" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6"
							onClick={handleCollapseAll}
							title="Collapse All"
						>
							<ChevronsUp className="h-3 w-3" />
						</Button>
					</div>
				</div>
			</div>
			<ScrollArea className="flex-1">
				{displayStructure.length === 0 && searchTerm ? (
					<div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in-95 duration-200">
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/20 mb-3">
							<SearchX className="h-6 w-6 text-muted-foreground/50" />
						</div>
						<p className="text-sm font-medium text-foreground">
							No matches found
						</p>
						<p className="text-xs text-muted-foreground mt-1 max-w-[180px]">
							No chapters or scenes match "{searchTerm}"
						</p>
						<Button
							variant="ghost"
							size="sm"
							className="mt-4 h-7 text-xs"
							onClick={() => {
								setSearchTerm("");
								debouncedSearch("");
							}}
						>
							Clear Search
						</Button>
					</div>
				) : (
					<Accordion
						type="multiple"
						value={expandedChapters}
						onValueChange={handleExpandedChange}
						className="w-full"
					>
						{displayStructure.map((chapter) => (
							<SidebarChapter
								key={chapter.id}
								chapter={chapter}
								activeSceneId={activeSceneId}
								isGenerating={isGenerating}
								readOnly={readOnly}
								isSelectionMode={isSelectionMode}
								selectedSceneIds={selectedSceneIds}
								onSceneSelect={onSceneSelect}
								onGenerateNextScene={handleGenerateNextScene}
								onCreateSceneManually={handleCreateSceneManually}
								onRenameScene={handleRenameScene}
								onDeleteScene={handleDeleteScene}
								onToggleSceneSelect={toggleSceneSelect}
							/>
						))}
						{/* Always allow adding a new chapter at the bottom, even when searching?
                            Maybe not when searching, it might be confusing.
                            But usually "Add" buttons should persist.
                            Let's keep it but maybe warn user? No, standard pattern is to keep it.
                         */}
						{!searchTerm && (
							<div className="p-2">
								<Button
									variant="ghost"
									size="sm"
									className="w-full justify-start text-muted-foreground"
									onClick={handleCreateChapter}
									disabled={isCreatingChapter || readOnly}
								>
									{isCreatingChapter ? (
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									) : (
										<Plus className="mr-2 h-4 w-4" />
									)}
									Add Chapter
								</Button>
							</div>
						)}
					</Accordion>
				)}
			</ScrollArea>
			{isSelectionMode && (
				<div className="p-2 border-t bg-muted/30 flex gap-2">
					<Button
						size="sm"
						variant="destructive"
						className="flex-1 text-xs"
						onClick={handleBulkDelete}
						disabled={selectedSceneIds.size === 0}
					>
						<Trash2 className="mr-2 h-3 w-3" />
						Delete ({selectedSceneIds.size})
					</Button>
					<Button
						size="sm"
						variant="outline"
						className="flex-1 text-xs"
						onClick={handleBulkExport}
						disabled={selectedSceneIds.size === 0}
					>
						<Download className="mr-2 h-3 w-3" />
						Export ({selectedSceneIds.size})
					</Button>
				</div>
			)}
		</div>
	);
});
