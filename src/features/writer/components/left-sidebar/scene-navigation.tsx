"use client";

import { isEqual } from "lodash";
import {
	BookPlus,
	CheckSquare,
	ChevronsDown,
	ChevronsUp,
	FilePlus2,
	Loader2,
	Plus,
	Search,
	Sparkles,
	Trash2,
	X,
} from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useDebounceCallback } from "usehooks-ts";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/atoms/accordion";
import { Button } from "@/components/atoms/button";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "@/components/atoms/context-menu";
import { Input } from "@/components/atoms/input";
import { ScrollArea } from "@/components/atoms/scroll-area";
import { EmptyState } from "@/components/molecules/empty-state";
import {
	createNewChapter,
	createSceneInChapter,
	deleteScene,
	deleteScenes,
	generateScene,
	updateSceneTitle,
} from "@/features/writer/actions";
import { SceneItem } from "@/features/writer/components/left-sidebar/scene-item";
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

	// Bulk Selection State
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [hiddenSceneIds, setHiddenSceneIds] = useState<Set<string>>(new Set());
	const lastSelectedIdRef = useRef<string | null>(null);

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

		let result = structure;

		// 1. Filter out hidden (deleted) scenes
		if (hiddenSceneIds.size > 0) {
			result = result
				.map((chapter) => ({
					...chapter,
					scenes: chapter.scenes.filter((s) => !hiddenSceneIds.has(s.id)),
				}))
				.filter((c) => c.scenes.length > 0 || c.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase())); // Keep chapter if scenes exist OR it matches search (if search exists)
                // Actually, if a chapter becomes empty due to hiding scenes, and no search, we might still want to show it?
                // Yes, empty chapters are valid.
		}

		// 2. Apply Search
		if (debouncedSearchTerm) {
			const lowerTerm = debouncedSearchTerm.toLowerCase();
			result = result
				.map((chapter) => {
					const titleMatch = chapter.title.toLowerCase().includes(lowerTerm);
					const matchingScenes = chapter.scenes.filter((scene) =>
						scene.title.toLowerCase().includes(lowerTerm),
					);

					if (matchingScenes.length > 0) {
						return {
							...chapter,
							scenes: matchingScenes,
						};
					}

					if (titleMatch) {
						return chapter;
					}

					return null;
				})
				.filter(Boolean) as ChapterWithScenes[];
		}

		return result;
	}, [structure, debouncedSearchTerm, hiddenSceneIds]);

	// Auto-expand on search
	useEffect(() => {
		if (debouncedSearchTerm && filteredStructure) {
			const matchingIds = filteredStructure.map((c) => c.id);
			setExpandedChapters((prev) => {
				// Merge existing expanded with new matches or just set matches?
				// Usually search results should be expanded.
				// Let's just set them to expanded.
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

	const handleSceneSelect = useCallback(
		(sceneId: string, e?: React.MouseEvent) => {
			// Handle Modifiers for Bulk Selection
			if (e?.metaKey || e?.ctrlKey) {
				setSelectedIds((prev) => {
					const next = new Set(prev);
					if (next.has(sceneId)) next.delete(sceneId);
					else next.add(sceneId);
					return next;
				});
				lastSelectedIdRef.current = sceneId;
				return;
			}

			if (e?.shiftKey && lastSelectedIdRef.current) {
				// Range select
				const allScenes = structure?.flatMap((c) => c.scenes) || [];
				const idx1 = allScenes.findIndex(
					(s) => s.id === lastSelectedIdRef.current,
				);
				const idx2 = allScenes.findIndex((s) => s.id === sceneId);

				if (idx1 !== -1 && idx2 !== -1) {
					const start = Math.min(idx1, idx2);
					const end = Math.max(idx1, idx2);
					const range = allScenes.slice(start, end + 1).map((s) => s.id);
					setSelectedIds((prev) => {
						const next = new Set(prev);
						for (const id of range) next.add(id);
						return next;
					});
				}
				lastSelectedIdRef.current = sceneId;
				return;
			}

			// Normal Click
			setSelectedIds(new Set([sceneId]));
			lastSelectedIdRef.current = sceneId;
			onSceneSelect(sceneId);
		},
		[structure, onSceneSelect],
	);

	const handleBulkDelete = useCallback(() => {
		const idsToDelete = Array.from(selectedIds);
		if (idsToDelete.length === 0) return;

		// Optimistic Hide
		setHiddenSceneIds((prev) => {
			const next = new Set(prev);
			for (const id of idsToDelete) next.add(id);
			return next;
		});
		setSelectedIds(new Set()); // Clear selection

		// Start Timer for Real Delete
		const timer = setTimeout(async () => {
			const result = await deleteScenes(idsToDelete);
			if (result.success) {
				onStructureUpdate?.();
				// If active scene was deleted, clear it
				if (
					activeSceneIdRef.current &&
					idsToDelete.includes(activeSceneIdRef.current)
				) {
					onSceneSelect(null);
				}
			} else {
				toast.error("Failed to delete scenes");
				// Restore if failed
				setHiddenSceneIds((prev) => {
					const next = new Set(prev);
					for (const id of idsToDelete) next.delete(id);
					return next;
				});
			}
		}, 4000);

		// Show Toast with Undo
		toast(`${idsToDelete.length} scenes deleted`, {
			action: {
				label: "Undo",
				onClick: () => {
					clearTimeout(timer);
					// Restore Visibility
					setHiddenSceneIds((prev) => {
						const next = new Set(prev);
						for (const id of idsToDelete) next.delete(id);
						return next;
					});
					toast.success("Deletion cancelled");
				},
			},
			duration: 3500, // Slightly less than timeout to ensure button is usable
		});
	}, [selectedIds, onStructureUpdate, onSceneSelect]);

	const handleClearSelection = useCallback(() => {
		setSelectedIds(new Set());
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
					handleSceneSelect(result.sceneId); // Use internal handler
				} else {
					toast.error(result.error || "Failed to create scene", {
						id: toastId,
					});
				}
			} catch (_e) {
				toast.error("Error creating scene", { id: toastId });
			}
		},
		[onStructureUpdate, handleSceneSelect],
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

	const handleDeleteScene = useCallback(
		async (sceneId: string) => {
			// Redirect to bulk delete for single item too, to get Undo behavior!
			// But we need to select it first if not selected.
			// Actually, let's just reuse handleBulkDelete if we want consistent UX.
			// Or keep single delete simple.
			// Prompt says "Feature Expansion... Build a 'Bulk Delete with Undo' system".
			// Consistent Undo is better.
			// Let's manually select it and call bulk delete logic?
			// Or just replicate logic here.

			// Optimistic Hide
			setHiddenSceneIds((prev) => {
				const next = new Set(prev);
				next.add(sceneId);
				return next;
			});

			// Start Timer
			const timer = setTimeout(async () => {
				const result = await deleteScene(sceneId); // Use single delete action
				if (result.success) {
					onStructureUpdate?.();
					if (activeSceneIdRef.current === sceneId) {
						onSceneSelect(null);
					}
				} else {
					toast.error("Failed to delete scene");
					setHiddenSceneIds((prev) => {
						const next = new Set(prev);
						next.delete(sceneId);
						return next;
					});
				}
			}, 4000);

			toast("Scene deleted", {
				action: {
					label: "Undo",
					onClick: () => {
						clearTimeout(timer);
						setHiddenSceneIds((prev) => {
							const next = new Set(prev);
							next.delete(sceneId);
							return next;
						});
						toast.success("Deletion cancelled");
					},
				},
				duration: 3500,
			});
		},
		[onStructureUpdate, onSceneSelect],
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

	if (loading) {
		return (
			<div className="flex items-center justify-center p-8">
				<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
			</div>
		);
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
		<div className="flex flex-col h-full relative">
			{/* Bulk Action Bar */}
			{selectedIds.size > 0 && (
				<div className="absolute bottom-4 left-4 right-4 z-50 bg-popover/90 backdrop-blur-md border rounded-lg shadow-lg p-2 flex items-center justify-between animate-in slide-in-from-bottom-2">
					<div className="flex items-center gap-2">
						<div className="bg-primary/10 text-primary p-1 rounded">
							<CheckSquare className="h-4 w-4" />
						</div>
						<span className="text-sm font-medium">
							{selectedIds.size} selected
						</span>
					</div>
					<div className="flex items-center gap-1">
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 text-muted-foreground hover:text-foreground"
							onClick={handleClearSelection}
							title="Clear Selection"
						>
							<X className="h-4 w-4" />
						</Button>
						<Button
							variant="destructive"
							size="sm"
							className="h-8 px-3 ml-1"
							onClick={handleBulkDelete}
						>
							<Trash2 className="h-4 w-4 mr-2" />
							Delete
						</Button>
					</div>
				</div>
			)}

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
			<ScrollArea className="flex-1 pb-16">
				{displayStructure.length === 0 && searchTerm ? (
					<div className="p-4 text-center text-sm text-muted-foreground">
						No chapters or scenes found matching "{searchTerm}"
					</div>
				) : (
					<Accordion
						type="multiple"
						value={expandedChapters}
						onValueChange={handleExpandedChange}
						className="w-full"
					>
						{displayStructure.map((chapter) => (
							<AccordionItem
								key={chapter.id}
								value={chapter.id}
								className="border-b-0 px-2"
							>
								<ContextMenu>
									<ContextMenuTrigger disabled={readOnly}>
										<AccordionTrigger className="hover:no-underline py-2 text-sm font-medium">
											<span className="truncate text-left">
												{chapter.title}
											</span>
										</AccordionTrigger>
									</ContextMenuTrigger>
									<ContextMenuContent>
										<ContextMenuItem
											onClick={() => handleGenerateNextScene(chapter.id)}
											disabled={isGenerating}
										>
											<Sparkles className="mr-2 h-4 w-4" />
											Generate New Scene
										</ContextMenuItem>
										<ContextMenuItem
											onClick={() => handleCreateSceneManually(chapter.id)}
										>
											<FilePlus2 className="mr-2 h-4 w-4" />
											Add Scene Manually
										</ContextMenuItem>
									</ContextMenuContent>
								</ContextMenu>

								<AccordionContent className="pb-2 pt-0">
									<div className="flex flex-col gap-1 pl-2 relative ml-2">
										{chapter.scenes.map((scene) => (
											<SceneItem
												key={scene.id}
												scene={scene}
												isActive={activeSceneId === scene.id}
												isSelected={selectedIds.has(scene.id)}
												isSelectionMode={selectedIds.size > 0}
												chapterId={chapter.id}
												onSelect={handleSceneSelect}
												onGenerateNext={handleGenerateNextScene}
												isGenerating={isGenerating}
												onRename={handleRenameScene}
												onDelete={handleDeleteScene}
												readOnly={readOnly}
											/>
										))}
										<Button
											variant="ghost"
											size="sm"
											className="justify-start h-8 w-full px-2 text-xs text-muted-foreground italic"
											onClick={() => handleCreateSceneManually(chapter.id)}
											disabled={isGenerating || readOnly}
										>
											<Plus className="mr-2 h-3 w-3" />
											Add Scene
										</Button>
									</div>
								</AccordionContent>
							</AccordionItem>
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
		</div>
	);
});
