"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	Book,
	ChevronDown,
	ChevronRight,
	FileText,
	Folder,
	LayoutDashboard,
	Lock,
	PanelLeftClose,
	Plus,
	Trash2,
} from "lucide-react";
import Link from "next/link";
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
			className="flex flex-col h-full border-r border-sidebar-border bg-sidebar/30 backdrop-blur-xl transition-all duration-300 ease-in-out"
			data-testid="writer-sidebar"
		>
			<div className="px-3 py-2 border-b border-sidebar-border/50">
				<Link href={`/projects/${project.id}/dashboard`}>
					<Button variant="ghost" size="sm" className="w-full justify-start">
						<LayoutDashboard className="mr-2 h-4 w-4" />
						Dashboard
					</Button>
				</Link>
			</div>

			<div className="px-4 py-3 border-b border-sidebar-border/50 flex items-center justify-between bg-sidebar/20 backdrop-blur-md sticky top-0 z-10">
				<div className="flex items-center gap-2.5">
					<Button
						variant="ghost"
						size="icon"
						className="h-7 w-7 -ml-2 text-muted-foreground/70 hover:text-foreground lg:hidden"
						onClick={toggleSidebar}
						aria-label="Close Sidebar"
					>
						<PanelLeftClose className="h-4 w-4" />
					</Button>
					<div className="flex items-center gap-2 text-sidebar-foreground/90">
						<Book className="h-4 w-4 opacity-70" />
						<h2 className="font-semibold text-sm tracking-tight">
							Book Structure
						</h2>
					</div>
				</div>
				<div className="flex items-center gap-0.5">
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
									className="h-7 w-7 text-muted-foreground/70 hover:text-foreground transition-colors"
									aria-label="Edit Structure"
								>
									<FileText className="h-4 w-4" />
								</Button>
							</StructureEditorDialog>
							<Button
								variant="ghost"
								size="icon"
								className="h-7 w-7 text-muted-foreground/70 hover:text-foreground transition-colors"
								onClick={handleAddChapter}
								aria-label="Add Chapter"
							>
								<Plus className="h-4 w-4" />
							</Button>
						</>
					)}
					{isReadOnly && (
						<span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/60 flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/50">
							<Lock className="h-3 w-3" /> Read Only
						</span>
					)}
				</div>
			</div>

			<ScrollArea className="flex-1">
				<div className="p-3 space-y-2">
					{loading ? (
						<SidebarSkeleton />
					) : !structure || structure.length === 0 ? (
						<div className="p-2">
							<EmptyState
								variant="glass"
								title={isReadOnly ? "No chapters" : "Start Writing"}
								description={
									isReadOnly
										? "This project has no content yet."
										: "Create your first chapter to begin your story."
								}
								className="p-4 py-8"
								action={
									!isReadOnly ? (
										<Button
											variant="outline"
											size="sm"
											onClick={handleAddChapter}
											className="w-full mt-4 bg-background/50 backdrop-blur-sm hover:bg-background/80"
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
									className={cn(
										"group/chapter rounded-xl transition-all duration-300 ease-out border border-transparent",
										expandedChapters[chapter.id]
											? "bg-sidebar-accent/30 shadow-sm border-sidebar-border/30 pb-2"
											: "hover:bg-sidebar-accent/20"
									)}
								>
									<div className="flex items-center gap-1 px-1 py-1">
										{/* biome-ignore lint: using div to prevent nested button hydration error */}
										<div
											role="button"
											tabIndex={0}
											onClick={() => toggleChapter(chapter.id)}
											onKeyDown={(e) => {
												if (e.key === "Enter" || e.key === " ") {
													e.preventDefault();
													toggleChapter(chapter.id);
												}
											}}
											className="flex-1 flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-lg text-sidebar-foreground cursor-pointer outline-none select-none w-full text-left"
										>
											<div className={cn(
												"p-1 rounded-md transition-colors",
												expandedChapters[chapter.id] ? "bg-sidebar-accent/50 text-foreground" : "text-muted-foreground/70"
											)}>
												{expandedChapters[chapter.id] ? (
													<ChevronDown className="h-3.5 w-3.5" />
												) : (
													<ChevronRight className="h-3.5 w-3.5" />
												)}
											</div>
											
											<div className="flex items-center gap-2 flex-1 min-w-0">
												<Folder className={cn(
													"h-4 w-4 transition-colors",
													expandedChapters[chapter.id] ? "text-primary dark:text-primary/90 fill-primary/10" : "text-muted-foreground/60"
												)} />
												{/* biome-ignore lint/a11y/noStaticElementInteractions: preventing parent activation */}
												<div
													className="flex-1 min-w-0 truncate"
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
														className={cn(
															"font-semibold tracking-tight transition-colors",
															expandedChapters[chapter.id] ? "text-foreground" : "text-muted-foreground group-hover/chapter:text-foreground/80"
														)}
													/>
												</div>
											</div>

											{chapter.scenes.length > 0 && (
												<span className="text-[10px] font-medium text-muted-foreground/50 bg-sidebar-accent/50 px-1.5 py-0.5 rounded-full shrink-0 min-w-[1.25rem] text-center">
													{chapter.scenes.length}
												</span>
											)}
										</div>
										{!isReadOnly && (
											<div className="flex items-center opacity-0 group-hover/chapter:opacity-100 transition-opacity px-1">
												<ChapterActions
													chapterId={chapter.id}
													onUpdate={fetchStructure}
													isReadOnly={isReadOnly}
												/>
												<Button
													variant="ghost"
													size="icon"
													className="h-7 w-7 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors rounded-lg"
													onClick={(e) => {
														e.stopPropagation();
														handleDeleteChapter(chapter.id);
													}}
													aria-label="Delete chapter"
												>
													<Trash2 className="h-3.5 w-3.5" />
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
													stiffness: 500,
													damping: 30,
													mass: 0.8
												}}
												className="overflow-hidden"
											>
												<div className="space-y-0.5 mt-1 px-2">
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
																	"group/scene relative flex items-center gap-1 rounded-lg transition-all duration-200",
																	activeSceneId === scene.id
																		? "bg-white/50 dark:bg-white/5 shadow-sm ring-1 ring-black/5 dark:ring-white/10"
																		: "hover:bg-sidebar-accent/40"
																)}
															>
																{/* Active Indicator */}
																{activeSceneId === scene.id && (
																	<motion.div 
																		layoutId="activeSceneIndicator"
																		className="absolute left-1 width-1 h-[60%] w-0.5 bg-primary rounded-full"
																		initial={{ opacity: 0 }}
																		animate={{ opacity: 1 }}
																		transition={{ duration: 0.2 }}
																	/>
																)}
																
																{/* biome-ignore lint: using div to prevent nested button hydration error */}
																<div
																	role="button"
																	tabIndex={0}
																	onClick={() => setActiveSceneId(scene.id)}
																	onKeyDown={(e) => {
																		if (e.key === "Enter" || e.key === " ") {
																			e.preventDefault();
																			setActiveSceneId(scene.id);
																		}
																	}}
																	className={cn(
																		"flex-1 flex items-center gap-3 pl-4 pr-2 py-2 text-sm cursor-pointer outline-none select-none w-full text-left",
																		activeSceneId === scene.id
																			? "text-primary dark:text-primary-foreground font-medium"
																			: "text-muted-foreground/80 group-hover/scene:text-foreground"
																	)}
																>
																	<div className={cn(
																		"h-1.5 w-1.5 rounded-full shrink-0 transition-colors duration-300",
																		activeSceneId === scene.id ? "bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" : "bg-border group-hover/scene:bg-muted-foreground/50"
																	)} />
																	{/* biome-ignore lint/a11y/noStaticElementInteractions: preventing parent activation */}
																	<div
																		className="flex-1 min-w-0"
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
																</div>
																{!isReadOnly && (
																	<Button
																		variant="ghost"
																		size="icon"
																		className="h-7 w-7 mr-1 text-muted-foreground/40 opacity-0 group-hover/scene:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all rounded-md"
																		onClick={(e) => {
																			e.stopPropagation();
																			handleDeleteScene(scene.id);
																		}}
																		aria-label="Delete scene"
																	>
																		<Trash2 className="h-3.5 w-3.5" />
																	</Button>
																)}
															</SortableItem>
														)}
													</SortableList>
													{!isReadOnly && (
														<Button
															variant="ghost"
															size="sm"
															className="w-full justify-start text-xs text-muted-foreground/60 hover:text-primary hover:bg-primary/5 pl-9 py-2 h-auto font-normal rounded-lg mt-1 transition-all"
															onClick={() => handleAddScene(chapter.id)}
														>
															<Plus className="mr-2 h-3 w-3" />
															Add Scene
														</Button>
													)}
													{chapter.scenes.length === 0 && (
														<div className="pl-9 py-2 text-xs text-muted-foreground/40 italic">
															No scenes yet
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
