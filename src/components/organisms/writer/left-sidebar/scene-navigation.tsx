"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	BookPlus,
	ChevronsDown,
	ChevronsUp,
	FilePlus2,
	FolderInput,
	Loader2,
	Plus,
	Search,
	Sparkles,
	Trash2,
	X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
	createNewChapter,
	createSceneInChapter,
	deleteScene,
	generateScene,
	updateSceneTitle,
} from "@/app/actions/writer";
import {
	deleteScenes,
	moveScenesToChapter,
} from "@/app/actions/writer/scene-ops";
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
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/atoms/dialog";
import { Input } from "@/components/atoms/input";
import { ScrollArea } from "@/components/atoms/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/atoms/select";
import { EmptyState } from "@/components/molecules/empty-state";
import { GlassCard } from "@/components/molecules/glass-card";
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

	// Search & Selection State
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedSceneIds, setSelectedSceneIds] = useState<Set<string>>(
		new Set(),
	);
	const lastSelectedSceneIdRef = useRef<string | null>(null);
	const [isProcessingBulk, setIsProcessingBulk] = useState(false);

	// Dialog States
	const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
	const [moveTargetChapterId, setMoveTargetChapterId] = useState<string>("");
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	// Initialize expanded state when structure loads
	useEffect(() => {
		if (structure) {
			setExpandedChapters(structure.map((c) => c.id));
		}
	}, [structure]);

	const handleExpandAll = () => {
		if (structure) {
			setExpandedChapters(structure.map((c) => c.id));
		}
	};

	const handleCollapseAll = () => {
		setExpandedChapters([]);
	};

	// --- Selection Logic ---
	const handleSelectScene = useCallback(
		(sceneId: string, multiSelect: boolean, rangeSelect: boolean) => {
			if (!structure) return;

			if (rangeSelect) {
				const lastSelectedId = lastSelectedSceneIdRef.current;
				if (lastSelectedId) {
					// Range select logic
					const flatScenes = structure.flatMap((c) => c.scenes);
					const startIdx = flatScenes.findIndex((s) => s.id === lastSelectedId);
					const endIdx = flatScenes.findIndex((s) => s.id === sceneId);

					if (startIdx !== -1 && endIdx !== -1) {
						const [min, max] = [
							Math.min(startIdx, endIdx),
							Math.max(startIdx, endIdx),
						];
						const rangeIds = flatScenes.slice(min, max + 1).map((s) => s.id);
						setSelectedSceneIds((prev) => {
							const next = new Set(prev);
							for (const id of rangeIds) next.add(id);
							return next;
						});
						// Don't update lastSelectedSceneIdRef for range selection expansion, usually
						return;
					}
				}
			}

			// Update ref for next potential range select
			lastSelectedSceneIdRef.current = sceneId;

			if (multiSelect) {
				setSelectedSceneIds((prev) => {
					const next = new Set(prev);
					if (next.has(sceneId)) next.delete(sceneId);
					else next.add(sceneId);
					return next;
				});
			} else if (!rangeSelect) {
				// Single click (no modifiers)
				setSelectedSceneIds(new Set());
				onSceneSelect(sceneId);
			}
		},
		[structure, onSceneSelect],
	);

	const confirmBulkDelete = async () => {
		if (selectedSceneIds.size === 0) return;

		setIsProcessingBulk(true);
		const toastId = toast.loading(
			`Deleting ${selectedSceneIds.size} scenes...`,
		);

		try {
			const result = await deleteScenes(Array.from(selectedSceneIds));
			if (result.success) {
				toast.success(`Deleted ${result.data?.count ?? 0} scenes`, {
					id: toastId,
				});
				setSelectedSceneIds(new Set());
				lastSelectedSceneIdRef.current = null;
				onStructureUpdate?.();
				// If active scene was deleted, deselect it
				if (activeSceneId && selectedSceneIds.has(activeSceneId)) {
					onSceneSelect(null);
				}
			} else {
				toast.error(result.error || "Failed to delete scenes", { id: toastId });
			}
		} catch (_e) {
			toast.error("Error deleting scenes", { id: toastId });
		} finally {
			setIsProcessingBulk(false);
			setIsDeleteDialogOpen(false);
		}
	};

	const handleBulkMove = async () => {
		if (!moveTargetChapterId || selectedSceneIds.size === 0) return;

		setIsProcessingBulk(true);
		const toastId = toast.loading("Moving scenes...");

		try {
			const result = await moveScenesToChapter(
				Array.from(selectedSceneIds),
				moveTargetChapterId,
			);
			if (result.success) {
				toast.success("Scenes moved successfully", { id: toastId });
				setSelectedSceneIds(new Set());
				lastSelectedSceneIdRef.current = null;
				setIsMoveDialogOpen(false);
				setMoveTargetChapterId("");
				onStructureUpdate?.();
			} else {
				toast.error(result.error || "Failed to move scenes", { id: toastId });
			}
		} catch (_e) {
			toast.error("Error moving scenes", { id: toastId });
		} finally {
			setIsProcessingBulk(false);
		}
	};

	// --- Existing Logic ---

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
						onSceneSelect(null);
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

	// --- Filtering ---
	const filteredStructure = useMemo(() => {
		if (!structure) return [];
		if (!searchQuery) return structure;

		const query = searchQuery.toLowerCase();
		return structure
			.map((chapter) => ({
				...chapter,
				scenes: chapter.scenes.filter((scene) =>
					scene.title.toLowerCase().includes(query),
				),
			}))
			.filter(
				(chapter) =>
					chapter.title.toLowerCase().includes(query) ||
					chapter.scenes.length > 0,
			);
	}, [structure, searchQuery]);

	// Auto-expand on search
	useEffect(() => {
		if (searchQuery && filteredStructure.length > 0) {
			setExpandedChapters(filteredStructure.map((c) => c.id));
		}
	}, [searchQuery, filteredStructure]);

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
		<div className="flex flex-col h-full relative">
			{/* Search & Filter Bar */}
			<div className="px-4 py-2 space-y-2 border-b border-border/20">
				<div className="relative">
					<Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
					<Input
						placeholder="Search scenes..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						onClear={() => setSearchQuery("")}
						className="pl-8 h-8 text-xs bg-secondary/50 border-transparent focus:border-primary/20"
					/>
				</div>
				<div className="flex items-center justify-between text-xs text-muted-foreground">
					<span>
						{structure.reduce((acc, c) => acc + c.scenes.length, 0)} Scenes
					</span>
					<div className="flex gap-1">
						<Button
							variant="ghost"
							size="icon"
							className="h-5 w-5"
							onClick={handleExpandAll}
							title="Expand All"
						>
							<ChevronsDown className="h-3 w-3" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-5 w-5"
							onClick={handleCollapseAll}
							title="Collapse All"
						>
							<ChevronsUp className="h-3 w-3" />
						</Button>
					</div>
				</div>
			</div>

			<ScrollArea className="flex-1">
				<Accordion
					type="multiple"
					value={expandedChapters}
					onValueChange={setExpandedChapters}
					className="w-full"
				>
					{filteredStructure.map((chapter) => (
						<AccordionItem
							key={chapter.id}
							value={chapter.id}
							className="border-b-0 px-2"
						>
							<ContextMenu>
								<ContextMenuTrigger disabled={readOnly}>
									<AccordionTrigger className="hover:no-underline py-2 text-sm font-medium group">
										<span className="truncate text-left flex-1 group-hover:text-foreground transition-colors">
											{chapter.title}
										</span>
										{searchQuery && (
											<span className="text-[10px] text-muted-foreground mr-2 bg-secondary px-1.5 py-0.5 rounded-full">
												{chapter.scenes.length}
											</span>
										)}
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
											isSelected={selectedSceneIds.has(scene.id)}
											chapterId={chapter.id}
											onSelect={handleSelectScene}
											onGenerateNext={handleGenerateNextScene}
											isGenerating={isGenerating}
											onRename={handleRenameScene}
											onDelete={handleDeleteScene}
											readOnly={readOnly}
										/>
									))}
									{!searchQuery && (
										<Button
											variant="ghost"
											size="sm"
											className="justify-start h-8 w-full px-2 text-xs text-muted-foreground italic opacity-50 hover:opacity-100"
											onClick={() => handleCreateSceneManually(chapter.id)}
											disabled={isGenerating || readOnly}
										>
											<Plus className="mr-2 h-3 w-3" />
											Add Scene
										</Button>
									)}
								</div>
							</AccordionContent>
						</AccordionItem>
					))}
					{/* Always allow adding a new chapter at the bottom */}
					{!searchQuery && (
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
			</ScrollArea>

			{/* Bulk Action Bar */}
			<AnimatePresence>
				{selectedSceneIds.size > 0 && !readOnly && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 20 }}
						className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] z-20"
					>
						<GlassCard
							variant="liquid"
							className="p-2 pl-4 flex items-center justify-between shadow-2xl border-primary/20 backdrop-blur-xl bg-background/80"
						>
							<div className="flex items-center gap-2 text-xs font-medium">
								<div className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">
									{selectedSceneIds.size}
								</div>
								<span className="hidden sm:inline">Selected</span>
							</div>

							<div className="flex items-center gap-1">
								<Button
									size="icon"
									variant="ghost"
									className="h-7 w-7 text-muted-foreground hover:text-foreground"
									onClick={() => setSelectedSceneIds(new Set())}
									title="Clear Selection"
									aria-label="Clear selection"
								>
									<X className="h-4 w-4" />
								</Button>
								<div className="h-4 w-px bg-border/50 mx-1" />
								<Button
									size="icon"
									variant="ghost"
									className="h-7 w-7 text-muted-foreground hover:text-primary"
									onClick={() => setIsMoveDialogOpen(true)}
									title="Move to Chapter"
									aria-label="Move to chapter"
								>
									<FolderInput className="h-4 w-4" />
								</Button>
								<Button
									size="icon"
									variant="ghost"
									className="h-7 w-7 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
									onClick={() => setIsDeleteDialogOpen(true)}
									title="Delete Selected"
									aria-label="Delete selected scenes"
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</div>
						</GlassCard>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Move Scenes Dialog */}
			<Dialog open={isMoveDialogOpen} onOpenChange={setIsMoveDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Move {selectedSceneIds.size} Scenes</DialogTitle>
						<DialogDescription>
							Select a destination chapter for the selected scenes.
						</DialogDescription>
					</DialogHeader>
					<div className="py-4">
						<Select
							value={moveTargetChapterId}
							onValueChange={setMoveTargetChapterId}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select a chapter..." />
							</SelectTrigger>
							<SelectContent>
								{structure?.map((chapter) => (
									<SelectItem key={chapter.id} value={chapter.id}>
										{chapter.title}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsMoveDialogOpen(false)}
							disabled={isProcessingBulk}
						>
							Cancel
						</Button>
						<Button
							onClick={handleBulkMove}
							disabled={!moveTargetChapterId || isProcessingBulk}
						>
							{isProcessingBulk ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<FolderInput className="mr-2 h-4 w-4" />
							)}
							Move Scenes
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete {selectedSceneIds.size} Scenes?</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete these scenes? This action cannot be
							undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsDeleteDialogOpen(false)}
							disabled={isProcessingBulk}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={confirmBulkDelete}
							disabled={isProcessingBulk}
							autoFocus
						>
							{isProcessingBulk ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<Trash2 className="mr-2 h-4 w-4" />
							)}
							Delete Scenes
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
