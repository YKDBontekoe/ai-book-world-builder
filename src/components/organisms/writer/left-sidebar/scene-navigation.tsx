"use client";

import {
	BookPlus,
	ChevronsDown,
	ChevronsUp,
	FilePlus2,
	Loader2,
	Plus,
	Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
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
import { SceneItem } from "@/components/organisms/writer/left-sidebar/scene-item";
import type { Project } from "@/lib/db/schema";
import type { ChapterWithScenes } from "@/lib/types";

interface SceneNavigationProps {
	project: Project;
	activeSceneId: string | null;
	onSceneSelect: (sceneId: string) => void;
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
					toast.error(result.error || "Failed to create scene", { id: toastId });
				}
			} catch (_e) {
				toast.error("Error creating scene", { id: toastId });
			}
		},
		[onStructureUpdate, onSceneSelect],
	);

	const handleRenameScene = useCallback(
		async (sceneId: string, newTitle: string) => {
			try {
				const result = await updateSceneTitle(sceneId, newTitle);
				if (result.success) {
					toast.success("Scene renamed");
					onStructureUpdate?.();
				} else {
					toast.error("Failed to rename scene");
				}
			} catch (_e) {
				toast.error("Error renaming scene");
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
						onSceneSelect(""); // Clear selection
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
			<div className="p-4 flex flex-col items-center justify-center h-full text-center space-y-4">
				<p className="text-sm text-muted-foreground">No chapters yet.</p>
				<Button
					onClick={handleCreateChapter}
					disabled={isCreatingChapter || readOnly}
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
		<div className="flex flex-col h-full">
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
			<ScrollArea className="flex-1">
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
								<div className="flex flex-col gap-1 pl-2 relative border-l ml-2">
									{chapter.scenes.map((scene) => (
										<SceneItem
											key={scene.id}
											scene={scene}
											isActive={activeSceneId === scene.id}
											chapterId={chapter.id}
											onSelect={onSceneSelect}
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
		</div>
	);
}
