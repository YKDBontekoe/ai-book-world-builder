"use client";

import {
	Book,
	FileText,
	LayoutDashboard,
	Lock,
	PanelLeftClose,
	Plus,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/atoms/button";
import { ScrollArea } from "@/components/atoms/scroll-area";
import { EmptyState } from "@/components/molecules/empty-state";
import { SortableList } from "@/components/molecules/sortable-list";
import { SidebarChapterItem } from "@/components/organisms/writer/sidebar/sidebar-chapter-item";
import { SidebarSkeleton } from "@/components/organisms/writer/sidebar-skeleton";
import { StructureEditorDialog } from "@/components/organisms/writer/structure-editor-dialog";
import { useWriterContext } from "@/components/organisms/writer/writer-context";
import { useWriterLayoutContext } from "@/components/organisms/writer/writer-layout-context";
import { useWriterSidebarActions } from "@/hooks/use-writer-sidebar-actions";

export function WriterSidebar() {
	const { toggleSidebar } = useWriterLayoutContext();
	const {
		project,
		structure,
		structureText,
		loading,
		fetchStructure,
		isReadOnly,
	} = useWriterContext();

	const {
		handleAddChapter,
		handleUpdateChapterTitle,
		handleUpdateSceneTitle,
		handleDeleteChapter,
		handleDeleteScene,
		handleAddScene,
		handleReorderChapters,
		handleReorderScenes,
	} = useWriterSidebarActions();

	const [expandedChapters, setExpandedChapters] = useState<
		Record<string, boolean>
	>({});

	const toggleChapter = (chapterId: string) => {
		setExpandedChapters((prev) => ({
			...prev,
			[chapterId]: !prev[chapterId],
		}));
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
								<SidebarChapterItem
									key={chapter.id}
									chapter={chapter}
									isExpanded={expandedChapters[chapter.id] ?? false}
									isReadOnly={isReadOnly}
									onToggle={() => toggleChapter(chapter.id)}
									onUpdateTitle={handleUpdateChapterTitle}
									onDelete={handleDeleteChapter}
									onReorderScenes={handleReorderScenes}
									onUpdateSceneTitle={handleUpdateSceneTitle}
									onDeleteScene={handleDeleteScene}
									onAddScene={handleAddScene}
									onUpdateStructure={fetchStructure}
								/>
							)}
						</SortableList>
					)}
				</div>
			</ScrollArea>
		</div>
	);
}
