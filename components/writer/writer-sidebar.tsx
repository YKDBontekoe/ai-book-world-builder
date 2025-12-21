"use client";

import {
	ChevronDown,
	ChevronRight,
	FileText,
	Folder,
	Plus,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createNewChapter } from "@/app/actions/writer";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { EmptyState } from "../ui/empty-state";
import { ScrollArea } from "../ui/scroll-area";
import { SidebarSkeleton } from "./sidebar-skeleton";
import { StructureEditorDialog } from "./structure-editor-dialog";
import { useWriterContext } from "./writer-context";

export function WriterSidebar() {
	const {
		project,
		structure,
		structureText,
		activeSceneId,
		setActiveSceneId,
		loading,
		fetchStructure,
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
		const toastId = toast.loading("Creating chapter...");
		try {
			await createNewChapter(project.id);
			toast.success("Chapter created", { id: toastId });
			fetchStructure();
		} catch (e) {
			toast.error("Failed to create chapter", { id: toastId });
		}
	};

	return (
		<div className="flex flex-col h-full border-r bg-sidebar">
			<div className="p-4 border-b flex items-center justify-between bg-sidebar-accent/50">
				<h2 className="font-semibold text-sm text-sidebar-foreground">
					Book Structure
				</h2>
				<div className="flex items-center gap-1">
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
				</div>
			</div>

			<ScrollArea className="flex-1">
				<div className="p-2 space-y-1">
					{loading ? (
						<SidebarSkeleton />
					) : !structure || structure.length === 0 ? (
						<div className="p-2">
							<EmptyState
								variant="dashed"
								title="No chapters"
								description="Create a chapter to start."
								className="p-4 py-8"
								action={
									<Button
										variant="outline"
										size="sm"
										onClick={handleAddChapter}
										className="w-full mt-2"
									>
										<Plus className="mr-2 h-3 w-3" />
										Add Chapter
									</Button>
								}
							/>
						</div>
					) : (
						structure.map((chapter) => (
							<div key={chapter.id} className="space-y-1">
								<button
                   type="button"
									onClick={() => toggleChapter(chapter.id)}
									className={cn(
										"w-full flex items-center gap-2 px-2 py-1.5 text-sm font-medium rounded-md hover:bg-sidebar-accent/50 transition-colors text-sidebar-foreground",
										expandedChapters[chapter.id] && "bg-sidebar-accent",
									)}
								>
									{expandedChapters[chapter.id] ? (
										<ChevronDown className="h-4 w-4 text-muted-foreground" />
									) : (
										<ChevronRight className="h-4 w-4 text-muted-foreground" />
									)}
									<Folder className="h-4 w-4 text-blue-500/80" />
									<span className="truncate">{chapter.title}</span>
								</button>

								{expandedChapters[chapter.id] && (
									<div className="ml-4 pl-2 border-l border-border/50 space-y-1 mt-1">
										{chapter.scenes.map((scene) => (
											<button
                         type="button"
												key={scene.id}
												onClick={() => setActiveSceneId(scene.id)}
												className={cn(
													"w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-sidebar-accent/50 transition-colors text-left",
													activeSceneId === scene.id
														? "bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium"
														: "text-muted-foreground",
												)}
											>
												<div className="h-1.5 w-1.5 rounded-full bg-current opacity-50" />
												<span className="truncate">{scene.title}</span>
											</button>
										))}
										{chapter.scenes.length === 0 && (
											<div className="px-2 py-1.5 text-xs text-muted-foreground italic">
												No scenes
											</div>
										)}
									</div>
								)}
							</div>
						))
					)}
				</div>
			</ScrollArea>
		</div>
	);
}
