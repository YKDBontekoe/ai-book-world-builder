"use client";

import { BookPlus, Loader2, Plus, Sparkles, Trash2, X } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { bulkDeleteScenes } from "@/app/actions/scene-ops";
import { createNewChapter, generateScene } from "@/app/actions/writer";
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
import { useSceneSelection } from "@/hooks/use-scene-selection";
import type { Project } from "@/lib/db/schema";
import type { ChapterWithScenes } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

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

	// Flatten structure for range selection
	const allSceneIds = structure?.flatMap(c => c.scenes.map(s => s.id)) || [];

	const {
		selectedSceneIds,
		toggleSelection,
		clearSelection,
		hasSelection
	} = useSceneSelection();

	const [hiddenSceneIds, setHiddenSceneIds] = useState<Set<string>>(new Set());

	const handleBulkDelete = async () => {
		const count = selectedSceneIds.size;
		const idsToDelete = Array.from(selectedSceneIds);

		// 1. Clear selection so UI looks clean
		clearSelection();

		// 2. Hide items optimistically
		setHiddenSceneIds(new Set(idsToDelete));

		// 3. Show Toast with Undo
		// We use a promise or customized timeout
		const undoTimeoutMs = 4000;
		let isUndone = false;

		const toastId = toast.success(`Deleted ${count} scenes`, {
			action: {
				label: "Undo",
				onClick: () => {
					isUndone = true;
					setHiddenSceneIds(new Set());
					toast.dismiss(toastId);
					toast.info("Deletion cancelled");
				}
			},
			duration: undoTimeoutMs,
		});

		// 4. Delayed execution
		setTimeout(async () => {
			if (!isUndone) {
				const result = await bulkDeleteScenes(idsToDelete);
				if (result.success) {
					onStructureUpdate?.();
				} else {
					toast.error("Failed to delete scenes");
					// Revert hiding if failed
					setHiddenSceneIds(new Set());
				}
			}
		}, undoTimeoutMs + 100); // Slight buffer
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
		<ScrollArea className="flex-1">
			<Accordion
				type="multiple"
				defaultValue={structure.map((c) => c.id)}
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
								{chapter.scenes
									.filter(s => !hiddenSceneIds.has(s.id))
									.map((scene) => (
									<SceneItem
										key={scene.id}
										scene={scene}
										isActive={activeSceneId === scene.id}
										chapterId={chapter.id}
										onSelect={onSceneSelect}
										onGenerateNext={handleGenerateNextScene}
										isGenerating={isGenerating}
										isSelected={selectedSceneIds.has(scene.id)}
										onToggleSelection={(multi, range) =>
											toggleSelection(scene.id, multi, range, allSceneIds)
										}
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

			<AnimatePresence>
				{hasSelection && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 20 }}
						className="absolute bottom-4 left-4 right-4 z-50"
					>
						<GlassCard className="flex items-center justify-between p-2 pl-4 pr-2 bg-black/80 border-white/10 shadow-2xl backdrop-blur-xl rounded-xl">
							<span className="text-xs font-medium text-white/90">
								{selectedSceneIds.size} selected
							</span>
							<div className="flex items-center gap-1">
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/20 rounded-lg"
									onClick={clearSelection}
								>
									<X className="h-4 w-4" />
								</Button>
								<Button
									variant="destructive"
									size="sm"
									className="h-8 px-3 rounded-lg text-xs font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300 border border-red-500/20"
									onClick={handleBulkDelete}
								>
									<Trash2 className="h-3 w-3 mr-2" />
									Delete
								</Button>
							</div>
						</GlassCard>
					</motion.div>
				)}
			</AnimatePresence>
		</ScrollArea>
	);
}
