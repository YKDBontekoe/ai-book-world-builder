"use client";

import {
	BookPlus,
	CheckSquare,
	ChevronsDown,
	ChevronsUp,
	FilePlus2,
	Loader2,
	Plus,
	Sparkles,
	Trash2,
	X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { bulkDeleteScenes, restoreScenes } from "@/app/actions/scene-ops";
import {
	createNewChapter,
	createSceneInChapter,
	deleteScene,
	generateScene,
	updateSceneTitle,
} from "@/app/actions/writer";
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
import { ScrollArea } from "@/components/atoms/scroll-area";
import { EmptyState } from "@/components/molecules/empty-state";
import { SceneItem } from "@/components/organisms/writer/left-sidebar/scene-item";
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

export function SceneNavigation({
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
	const [isSelectionMode, setIsSelectionMode] = useState(false);
	const [selectedSceneIds, setSelectedSceneIds] = useState<Set<string>>(
		new Set(),
	);

	// Initialize expanded state when structure loads
	useEffect(() => {
		if (structure) {
			setExpandedChapters(structure.map((c) => c.id));
		}
	}, [structure]);

	// Clear selection when exiting selection mode
	useEffect(() => {
		if (!isSelectionMode) {
			setSelectedSceneIds(new Set());
		}
	}, [isSelectionMode]);

	const handleExpandAll = () => {
		if (structure) {
			setExpandedChapters(structure.map((c) => c.id));
		}
	};

	const handleCollapseAll = () => {
		setExpandedChapters([]);
	};

	const toggleSceneSelection = useCallback((sceneId: string) => {
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

	const handleBulkDelete = async () => {
		if (selectedSceneIds.size === 0) return;

		const count = selectedSceneIds.size;
		const idsToDelete = Array.from(selectedSceneIds);
		const toastId = toast.loading(`Deleting ${count} scenes...`);

		// Optimistic UI update (optional, but let's rely on server for now to be safe)
		// Or assume success:
		setIsSelectionMode(false);

		try {
			const result = await bulkDeleteScenes(project.id, idsToDelete);
			if (result.success) {
				toast.success(`Deleted ${count} scenes`, {
					id: toastId,
					action: {
						label: "Undo",
						onClick: async () => {
							const restoreToast = toast.loading("Restoring scenes...");
							const restoreResult = await restoreScenes(
								project.id,
								idsToDelete,
							);
							if (restoreResult.success) {
								toast.success("Scenes restored", { id: restoreToast });
								onStructureUpdate?.();
							} else {
								toast.error("Failed to restore scenes", {
									id: restoreToast,
								});
							}
						},
					},
				});
				onStructureUpdate?.();
			} else {
				toast.error("Failed to delete scenes", { id: toastId });
			}
		} catch (_e) {
			toast.error("Error deleting scenes", { id: toastId });
		}
	};

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

	const handleDeleteScene = useCallback(
		async (sceneId: string) => {
			const toastId = toast.loading("Deleting scene...");
			try {
				const result = await deleteScene(sceneId);
				if (result.success) {
					toast.success("Scene deleted", { id: toastId });
					onStructureUpdate?.();
					if (activeSceneId === sceneId) {
						onSceneSelect(null); // Clear selection
					}
				} else {
					toast.error(result.error || "Failed to delete scene", {
						id: toastId,
					});
				}
			} catch (_e) {
				toast.error("Error deleting scene", { id: toastId });
			}
		},
		[onStructureUpdate, activeSceneId, onSceneSelect],
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

	if (structure.length === 0) {
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

	return (
		<div className="flex flex-col h-full">
			<div className="flex items-center justify-between px-4 py-2">
				<div className="flex items-center gap-2">
					<span className="text-xs font-medium text-muted-foreground">
						{structure.length} Chapters
					</span>
					{!readOnly && (
						<Button
							variant={isSelectionMode ? "secondary" : "ghost"}
							size="icon"
							className="h-6 w-6 ml-1"
							onClick={() => setIsSelectionMode(!isSelectionMode)}
							title={isSelectionMode ? "Cancel Selection" : "Select Scenes"}
						>
							{isSelectionMode ? (
								<X className="h-3 w-3" />
							) : (
								<CheckSquare className="h-3 w-3" />
							)}
						</Button>
					)}
				</div>
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
			<ScrollArea className="flex-1">
				<Accordion
					type="multiple"
					value={expandedChapters}
					onValueChange={setExpandedChapters}
					className="w-full pb-12"
				>
					{structure.map((chapter) => (
						<AccordionItem
							key={chapter.id}
							value={chapter.id}
							className="border-b-0 px-2"
						>
							<ContextMenu>
								<ContextMenuTrigger disabled={readOnly}>
									<AccordionTrigger className="hover:no-underline py-2 text-sm font-medium">
										<span className="truncate text-left">{chapter.title}</span>
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
											chapterId={chapter.id}
											onSelect={
												isSelectionMode ? toggleSceneSelection : onSceneSelect
											}
											onGenerateNext={handleGenerateNextScene}
											isGenerating={isGenerating}
											onRename={handleRenameScene}
											onDelete={handleDeleteScene}
											readOnly={readOnly}
											selectionMode={isSelectionMode}
											isSelected={selectedSceneIds.has(scene.id)}
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
					{/* Always allow adding a new chapter at the bottom */}
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
				</Accordion>
			</ScrollArea>

			{/* Bulk Actions Bar */}
			{isSelectionMode && selectedSceneIds.size > 0 && (
				<div className="absolute bottom-4 left-4 right-4 z-20">
					<div className="bg-destructive/90 backdrop-blur-md text-destructive-foreground px-4 py-2 rounded-xl shadow-lg flex items-center justify-between animate-in slide-in-from-bottom-2 duration-300">
						<span className="text-sm font-medium">
							{selectedSceneIds.size} selected
						</span>
						<Button
							variant="ghost"
							size="sm"
							className="hover:bg-black/20 text-white h-8"
							onClick={handleBulkDelete}
						>
							<Trash2 className="mr-2 h-4 w-4" />
							Delete
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
