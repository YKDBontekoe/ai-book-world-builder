"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	BookPlus,
	ChevronsDown,
	ChevronsUp,
	Loader2,
	Plus,
	Sparkles,
	Trash2,
	Undo2,
	X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
	bulkDeleteScenes,
	createNewChapter,
	generateScene,
	restoreScenes,
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
import { GlassCard } from "@/components/molecules/glass-card";
import { SceneItem } from "@/components/organisms/writer/left-sidebar/scene-item";
import type { Project, Scene } from "@/lib/db/schema";
import type { ChapterWithScenes } from "@/lib/types";

interface SceneNavigationProps {
	project: Project;
	activeSceneId: string | null;
	onSceneSelect: (sceneId: string) => void;
	structure: ChapterWithScenes[] | null;
	loading: boolean;
	onStructureUpdate?: () => void;
}

export function SceneNavigation({
	project,
	activeSceneId,
	onSceneSelect,
	structure,
	loading,
	onStructureUpdate,
}: SceneNavigationProps) {
	const [isGenerating, setIsGenerating] = useState(false);
	const [isCreatingChapter, setIsCreatingChapter] = useState(false);
	const [expandedChapters, setExpandedChapters] = useState<string[]>([]);
	const [selectedSceneIds, setSelectedSceneIds] = useState<Set<string>>(
		new Set(),
	);
	const [isDeleting, setIsDeleting] = useState(false);

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

	const toggleSelection = (id: string, multiSelect: boolean) => {
		setSelectedSceneIds((prev) => {
			const next = new Set(multiSelect ? prev : []);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	const handleSceneClick = (
		sceneId: string,
		e: React.MouseEvent,
	) => {
		// Check for modifier keys (Cmd/Ctrl for multi-select)
		const isMultiSelect = e.ctrlKey || e.metaKey;

		if (isMultiSelect) {
			e.preventDefault();
			toggleSelection(sceneId, true);
		} else if (selectedSceneIds.size > 0 && !isMultiSelect) {
			// If we have selection but click without modifier, clear selection and navigate
			setSelectedSceneIds(new Set());
			onSceneSelect(sceneId);
		} else {
			// Normal navigation
			onSceneSelect(sceneId);
		}
	};

	const handleBulkDelete = async () => {
		if (selectedSceneIds.size === 0) return;

		setIsDeleting(true);
		const count = selectedSceneIds.size;
		const toastId = toast.loading(`Deleting ${count} scenes...`);

		try {
			const idsToDelete = Array.from(selectedSceneIds);
			const result = await bulkDeleteScenes(idsToDelete);

			if (result.success && result.deletedScenes) {
				toast.success(`${count} scenes deleted`, {
					id: toastId,
					action: {
						label: "Undo",
						onClick: () => {
							if (result.deletedScenes) {
								handleRestore(result.deletedScenes);
							}
						},
					},
				});
				setSelectedSceneIds(new Set());
				if (onStructureUpdate) onStructureUpdate();
			} else {
				toast.error(result.error || "Failed to delete scenes", { id: toastId });
			}
		} catch (_e) {
			toast.error("Error deleting scenes", { id: toastId });
		} finally {
			setIsDeleting(false);
		}
	};

	const handleRestore = async (scenesToRestore: Scene[]) => {
		const toastId = toast.loading("Restoring scenes...");
		try {
			const result = await restoreScenes(scenesToRestore);
			if (result.success) {
				toast.success("Scenes restored", { id: toastId });
				if (onStructureUpdate) onStructureUpdate();
			} else {
				toast.error("Failed to restore scenes", { id: toastId });
			}
		} catch (_e) {
			toast.error("Error restoring scenes", { id: toastId });
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
					if (onStructureUpdate) {
						onStructureUpdate();
					} else {
						window.location.reload();
					}
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

	const handleCreateChapter = async () => {
		setIsCreatingChapter(true);
		const toastId = toast.loading("Creating new chapter...");
		try {
			const result = await createNewChapter(project.id);
			if (result.success) {
				toast.success("Chapter created!", { id: toastId });
				if (onStructureUpdate) {
					onStructureUpdate();
				} else {
					window.location.reload();
				}
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
			<div className="p-4 flex flex-col items-center justify-center h-full text-center space-y-4">
				<p className="text-sm text-muted-foreground">No chapters yet.</p>
				<Button
					onClick={handleCreateChapter}
					disabled={isCreatingChapter}
					variant="outline"
					size="sm"
				>
					{isCreatingChapter ? (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					) : (
						<BookPlus className="mr-2 h-4 w-4" />
					)}
					Add Chapter
				</Button>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full relative">
			<div className="flex items-center justify-between px-4 py-2 border-b">
				<span className="text-xs font-medium text-muted-foreground">
					{structure.length} Chapters
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
			<ScrollArea className="flex-1 pb-16">
				<Accordion
					type="multiple"
					value={expandedChapters}
					onValueChange={setExpandedChapters}
					className="w-full"
				>
					{structure.map((chapter) => (
						<AccordionItem
							key={chapter.id}
							value={chapter.id}
							className="border-b-0 px-2"
						>
							<ContextMenu>
								<ContextMenuTrigger>
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
									<ContextMenuItem disabled>
										<Plus className="mr-2 h-4 w-4" />
										Add Scene Manually (Coming Soon)
									</ContextMenuItem>
								</ContextMenuContent>
							</ContextMenu>

							<AccordionContent className="pb-2 pt-0">
								<div className="flex flex-col gap-1 pl-2 relative border-l ml-2">
									{chapter.scenes.map((scene) => (
										<SceneItem
											key={scene.id}
											scene={scene}
											isActive={activeSceneId === scene.id}
											isSelected={selectedSceneIds.has(scene.id)}
											chapterId={chapter.id}
											onSelect={(id) => onSceneSelect(id)}
											onClick={(id, e) => handleSceneClick(id, e)}
											onGenerateNext={handleGenerateNextScene}
											isGenerating={isGenerating}
										/>
									))}
									<Button
										variant="ghost"
										size="sm"
										className="justify-start h-8 w-full px-2 text-xs text-muted-foreground italic"
										onClick={() => handleGenerateNextScene(chapter.id)}
										disabled={isGenerating}
									>
										{isGenerating ? (
											<Loader2 className="mr-2 h-3 w-3 animate-spin" />
										) : (
											<Plus className="mr-2 h-3 w-3" />
										)}
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
							disabled={isCreatingChapter}
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
			<AnimatePresence>
				{selectedSceneIds.size > 0 && (
					<motion.div
						initial={{ y: 100, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						exit={{ y: 100, opacity: 0 }}
						transition={{ type: "spring", stiffness: 400, damping: 25 }}
						className="absolute bottom-4 left-4 right-4 z-50"
					>
						<GlassCard
							variant="liquid"
							// Note: rounded-full is a deliberate design choice for the pill-shaped floating bar
							className="p-2 flex items-center justify-between shadow-xl border-primary/20 bg-background/80 backdrop-blur-xl rounded-full"
						>
							<div className="flex items-center gap-3 px-3">
								<div className="bg-primary/20 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
									{selectedSceneIds.size}
								</div>
								<span className="text-xs font-medium text-muted-foreground">
									Selected
								</span>
							</div>
							<div className="flex items-center gap-1">
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
									onClick={handleBulkDelete}
									disabled={isDeleting}
									title="Delete Selected"
									aria-label={`Delete ${selectedSceneIds.size} selected scenes`}
								>
									{isDeleting ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<Trash2 className="h-4 w-4" />
									)}
								</Button>
								<div className="w-px h-4 bg-border mx-1" />
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 rounded-full"
									onClick={() => setSelectedSceneIds(new Set())}
									title="Cancel Selection"
								>
									<X className="h-4 w-4" />
								</Button>
							</div>
						</GlassCard>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
