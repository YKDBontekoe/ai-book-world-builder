"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	ChevronDown,
	ChevronRight,
	FileText,
	Folder,
	Lock,
	PanelLeftClose,
	Plus,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
	createNewChapter,
	createSceneInChapter,
	deleteChapter,
	deleteScene,
	reorderChapters,
	reorderScenes,
	updateChapterTitle,
	updateSceneTitle,
} from "@/app/actions/writer";
import { Button } from "@/components/atoms/button";
import { ScrollArea } from "@/components/atoms/scroll-area";
import { EmptyState } from "@/components/molecules/empty-state";
import {
	SortableItem,
	SortableList,
} from "@/components/molecules/sortable-list";
import { ChapterActions } from "@/components/organisms/writer/chapter-actions";
import { InlineEditableTitle } from "@/components/organisms/writer/inline-editable-title";
import { SidebarSkeleton } from "@/components/organisms/writer/sidebar-skeleton";
import { StructureEditorDialog } from "@/components/organisms/writer/structure-editor-dialog";
import { useWriterContext } from "@/components/organisms/writer/writer-context";
import { useWriterLayoutContext } from "@/components/organisms/writer/writer-layout-context";
import { cn } from "@/lib/utils";

export function WriterSidebar() {
	const { toggleSidebar } = useWriterLayoutContext();
	const {
		project,
		structure,
		structureText,
		activeSceneId,
		setActiveSceneId,
		loading,
		fetchStructure,
		isReadOnly,
	} = useWriterContext();

	const [expandedChapters, setExpandedChapters] = useState<
		Record<string, boolean>
	>({});

	const toggleChapter = (chapterId: string) => {
		setExpandedChapters((prev) => ({
			...prev,
			[chapterId]: !prev[chapterId],
		}));
	};

	const handleAddChapter = async () => {
		if (isReadOnly) return;
		const toastId = toast.loading("Creating chapter...");
		try {
			await createNewChapter(project.id);
			toast.success("Chapter created", { id: toastId });
			fetchStructure();
		} catch {
			toast.error("Failed to create chapter", { id: toastId });
		}
	};

	const handleUpdateChapterTitle = async (
		chapterId: string,
		newTitle: string,
	) => {
		const result = await updateChapterTitle(chapterId, newTitle);
		if (result.success) {
			fetchStructure();
			return true;
		}
		toast.error(result.error || "Failed to update chapter title");
		return false;
	};

	const handleUpdateSceneTitle = async (
		sceneId: string,
		newTitle: string,
	) => {
		const result = await updateSceneTitle(sceneId, newTitle);
		if (result.success) {
			fetchStructure();
			return true;
		}
		toast.error(result.error || "Failed to update scene title");
		return false;
	};

	const handleDeleteChapter = async (chapterId: string) => {
		if (isReadOnly) return;
		if (
			!confirm(
				"Are you sure you want to delete this chapter? All scenes in this chapter will also be deleted.",
			)
		) {
			return;
		}

		const toastId = toast.loading("Deleting chapter...");
		try {
			const result = await deleteChapter(chapterId);
			if (result.success) {
				toast.success("Chapter deleted", { id: toastId });
				fetchStructure();
			} else {
				toast.error(result.error || "Failed to delete chapter", {
					id: toastId,
				});
			}
		} catch {
			toast.error("Failed to delete chapter", { id: toastId });
		}
	};

	const handleDeleteScene = async (sceneId: string) => {
		if (isReadOnly) return;
		if (!confirm("Are you sure you want to delete this scene?")) {
			return;
		}

		const toastId = toast.loading("Deleting scene...");
		try {
			const result = await deleteScene(sceneId);
			if (result.success) {
				toast.success("Scene deleted", { id: toastId });
				fetchStructure();
			} else {
				toast.error(result.error || "Failed to delete scene", {
					id: toastId,
				});
			}
		} catch {
			toast.error("Failed to delete scene", { id: toastId });
		}
	};

	const handleAddScene = async (chapterId: string) => {
		if (isReadOnly) return;
		const toastId = toast.loading("Creating scene...");
		try {
			const result = await createSceneInChapter(
				chapterId,
				"New Scene",
				undefined,
			);
			if (result.success) {
				toast.success("Scene created", { id: toastId });
				fetchStructure();
				if (result.sceneId) {
					setActiveSceneId(result.sceneId);
				}
			} else {
				toast.error(result.error || "Failed to create scene", {
					id: toastId,
				});
			}
		} catch {
			toast.error("Failed to create scene", { id: toastId });
		}
	};

	const handleReorderChapters = async (
		reorderedChapters: typeof structure,
	) => {
		if (!reorderedChapters || reorderedChapters.length === 0) return;

		// Get volume ID from first chapter
		const volumeId = reorderedChapters[0].volumeId;
		if (!volumeId) return;

		const chapterIds = reorderedChapters.map((ch) => ch.id);

		const toastId = toast.loading("Reordering chapters...");
		const result = await reorderChapters(chapterIds, volumeId);

		if (result.success) {
			toast.success("Chapters reordered", { id: toastId });
			fetchStructure();
		} else {
			toast.error(result.error || "Failed to reorder chapters", {
				id: toastId,
			});
			// Revert on error
			fetchStructure();
		}
	};

	const handleReorderScenes = async (
		reorderedScenes: Array<{ id: string }>,
		chapterId: string,
	) => {
		const sceneIds = reorderedScenes.map((s) => s.id);

		const toastId = toast.loading("Reordering scenes...");
		const result = await reorderScenes(sceneIds, chapterId);

		if (result.success) {
			toast.success("Scenes reordered", { id: toastId });
			fetchStructure();
		} else {
			toast.error(result.error || "Failed to reorder scenes", {
				id: toastId,
			});
			// Revert on error
			fetchStructure();
		}
	};

	return (
		<div
			className="flex flex-col h-full border-r bg-sidebar"
			data-testid="writer-sidebar"
		>
			<div className="p-4 border-b flex items-center justify-between bg-sidebar-accent/50">
				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="icon"
						className="h-6 w-6 -ml-2 text-muted-foreground lg:hidden"
						onClick={toggleSidebar}
						aria-label="Close Sidebar"
					>
						<PanelLeftClose className="h-4 w-4" />
					</Button>
					<h2 className="font-semibold text-sm text-sidebar-foreground">
						Book Structure
					</h2>
				</div>
				<div className="flex items-center gap-1">
					{!isReadOnly && (
						<>
							<StructureEditorDialog
								projectId={project.id}
								currentStructure={structureText}
								onSave={() => {
									fetchStructure();
								}}
							>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8"
									aria-label="Edit Structure"
								>
									<FileText className="h-4 w-4" />
								</Button>
							</StructureEditorDialog>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8"
								onClick={handleAddChapter}
								aria-label="Add Chapter"
							>
								<Plus className="h-4 w-4" />
							</Button>
						</>
					)}
					{isReadOnly && (
						<span className="text-xs text-muted-foreground flex items-center gap-1">
							<Lock className="h-3 w-3" /> Read Only
						</span>
					)}
				</div>
			</div>

			<ScrollArea className="flex-1">
				<div className="p-2 space-y-1">
					{loading ? (
						<SidebarSkeleton />
					) : !structure || structure.length === 0 ? (
						<div className="p-2">
							<EmptyState
								variant="glass"
								title={isReadOnly ? "No chapters" : "No chapters"}
								description={
									isReadOnly
										? "This project has no content yet."
										: "Create a chapter to start."
								}
								className="p-4 py-8"
								action={
									!isReadOnly ? (
										<Button
											variant="outline"
											size="sm"
											onClick={handleAddChapter}
											className="w-full mt-2"
										>
											<Plus className="mr-2 h-3 w-3" />
											Add Chapter
										</Button>
									) : undefined
								}
							/>
						</div>
					) : (
						<SortableList
							items={structure}
							onReorder={handleReorderChapters}
							disabled={isReadOnly}
						>
							{(chapter) => (
								<SortableItem
									key={chapter.id}
									id={chapter.id}
									disabled={isReadOnly}
									className="space-y-1"
								>
									<div className="flex items-center gap-1 group">
										<button
											type="button"
											onClick={() => toggleChapter(chapter.id)}
											className={cn(
												"flex-1 flex items-center gap-2 px-2 py-1.5 text-sm font-medium rounded-md hover:bg-sidebar-accent/50 transition-colors text-sidebar-foreground",
												expandedChapters[chapter.id] && "bg-sidebar-accent",
											)}
										>
											{expandedChapters[chapter.id] ? (
												<ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
											) : (
												<ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
											)}
											<Folder className="h-4 w-4 text-blue-500/80 shrink-0" />
											<div
												className="flex-1 min-w-0"
												onClick={(e) => e.stopPropagation()}
												onKeyDown={(e) => {
													if (e.key === "Enter" || e.key === " ") {
														e.stopPropagation();
													}
												}}
											>
												<InlineEditableTitle
													value={chapter.title}
													onSave={(newTitle) =>
														handleUpdateChapterTitle(chapter.id, newTitle)
													}
													disabled={isReadOnly}
													className="font-medium"
												/>
											</div>
											{chapter.scenes.length > 0 && (
												<span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md font-mono shrink-0">
													{chapter.scenes.length}
												</span>
											)}
										</button>
										{!isReadOnly && (
											<div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
												<ChapterActions
													chapterId={chapter.id}
													onUpdate={fetchStructure}
													isReadOnly={isReadOnly}
												/>
												<Button
													variant="ghost"
													size="icon"
													className="h-6 w-6"
													onClick={(e) => {
														e.stopPropagation();
														handleDeleteChapter(chapter.id);
													}}
													aria-label="Delete chapter"
												>
													<Trash2 className="h-3 w-3 text-destructive" />
												</Button>
											</div>
										)}
									</div>

									<AnimatePresence>
										{expandedChapters[chapter.id] && (
											<motion.div
												initial={{ height: 0, opacity: 0 }}
												animate={{ height: "auto", opacity: 1 }}
												exit={{ height: 0, opacity: 0 }}
												transition={{
													type: "spring",
													stiffness: 400,
													damping: 25,
												}}
												className="overflow-hidden"
											>
												<div className="ml-4 pl-2 border-l border-border/50 space-y-1 mt-1 pb-1">
													<SortableList
														items={chapter.scenes}
														onReorder={(reorderedScenes) =>
															handleReorderScenes(reorderedScenes, chapter.id)
														}
														disabled={isReadOnly}
													>
														{(scene) => (
															<SortableItem
																key={scene.id}
																id={scene.id}
																disabled={isReadOnly}
																className={cn(
																	"group/scene flex items-center gap-1",
																	activeSceneId === scene.id &&
																		"bg-blue-500/5 rounded-md px-1",
																)}
															>
																<button
																	type="button"
																	onClick={() => setActiveSceneId(scene.id)}
																	className={cn(
																		"flex-1 flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-sidebar-accent/50 transition-colors text-left",
																		activeSceneId === scene.id
																			? "bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium"
																			: "text-muted-foreground",
																	)}
																>
																	<div className="h-1.5 w-1.5 rounded-full bg-current opacity-50 shrink-0" />
																	<div
																		className="flex-1 min-w-0"
																		onClick={(e) => e.stopPropagation()}
																		onKeyDown={(e) => {
																			if (e.key === "Enter" || e.key === " ") {
																				e.stopPropagation();
																			}
																		}}
																	>
																		<InlineEditableTitle
																			value={scene.title}
																			onSave={(newTitle) =>
																				handleUpdateSceneTitle(scene.id, newTitle)
																			}
																			disabled={isReadOnly}
																		/>
																	</div>
																</button>
																{!isReadOnly && (
																	<Button
																		variant="ghost"
																		size="icon"
																		className="h-6 w-6 opacity-0 group-hover/scene:opacity-100 transition-opacity"
																		onClick={(e) => {
																			e.stopPropagation();
																			handleDeleteScene(scene.id);
																		}}
																		aria-label="Delete scene"
																	>
																		<Trash2 className="h-3 w-3 text-destructive" />
																	</Button>
																)}
															</SortableItem>
														)}
													</SortableList>
													{!isReadOnly && (
														<Button
															variant="ghost"
															size="sm"
															className="w-full justify-start text-xs text-muted-foreground hover:text-foreground ml-4"
															onClick={() => handleAddScene(chapter.id)}
														>
															<Plus className="mr-2 h-3 w-3" />
															Add Scene
														</Button>
													)}
													{chapter.scenes.length === 0 && (
														<div className="px-2 py-1.5 text-xs text-muted-foreground italic">
															No scenes
														</div>
													)}
												</div>
											</motion.div>
										)}
									</AnimatePresence>
								</SortableItem>
							)}
						</SortableList>
					)}
				</div>
			</ScrollArea>
		</div>
	);
}
