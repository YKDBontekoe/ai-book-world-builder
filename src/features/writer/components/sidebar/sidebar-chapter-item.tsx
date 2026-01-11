"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronRight, Folder, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/atoms/button";
import {
	SortableItem,
	SortableList,
} from "@/components/molecules/sortable-list";
import { ChapterActions } from "@/features/writer/components/chapter-actions";
import { InlineEditableTitle } from "@/features/writer/components/inline-editable-title";
import { SidebarSceneItem } from "@/features/writer/components/sidebar/sidebar-scene-item";
import { cn } from "@/lib/utils";

interface SidebarChapterItemProps {
	chapter: {
		id: string;
		title: string;
		scenes: Array<{ id: string; title: string }>;
	};
	isExpanded: boolean;
	isReadOnly: boolean;
	onToggle: () => void;
	onUpdateTitle: (id: string, newTitle: string) => Promise<boolean>;
	onDelete: (id: string) => void;
	onReorderScenes: (scenes: Array<{ id: string }>, chapterId: string) => void;
	onUpdateSceneTitle: (id: string, newTitle: string) => Promise<boolean>;
	onDeleteScene: (id: string) => void;
	onAddScene: (chapterId: string) => void;
	onUpdateStructure: () => void;
}

export function SidebarChapterItem({
	chapter,
	isExpanded,
	isReadOnly,
	onToggle,
	onUpdateTitle,
	onDelete,
	onReorderScenes,
	onUpdateSceneTitle,
	onDeleteScene,
	onAddScene,
	onUpdateStructure,
}: SidebarChapterItemProps) {
	return (
		<SortableItem
			key={chapter.id}
			id={chapter.id}
			disabled={isReadOnly}
			className={cn(
				"group/chapter rounded-xl transition-all duration-300 ease-out border border-transparent",
				isExpanded
					? "bg-sidebar-accent/30 shadow-sm border-sidebar-border/30 pb-2"
					: "hover:bg-sidebar-accent/20",
			)}
		>
			<div className="flex items-center gap-1 px-1 py-1">
				{/* biome-ignore lint: using div to prevent nested button hydration error */}
				<div
					role="button"
					tabIndex={0}
					onClick={onToggle}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault();
							onToggle();
						}
					}}
					className="flex-1 flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-lg text-sidebar-foreground cursor-pointer outline-none select-none w-full text-left"
				>
					<div
						className={cn(
							"p-1 rounded-md transition-colors",
							isExpanded
								? "bg-sidebar-accent/50 text-foreground"
								: "text-muted-foreground/70",
						)}
					>
						{isExpanded ? (
							<ChevronDown className="h-3.5 w-3.5" />
						) : (
							<ChevronRight className="h-3.5 w-3.5" />
						)}
					</div>

					<div className="flex items-center gap-2 flex-1 min-w-0">
						<Folder
							className={cn(
								"h-4 w-4 transition-colors",
								isExpanded
									? "text-primary dark:text-primary/90 fill-primary/10"
									: "text-muted-foreground/60",
							)}
						/>
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
								onSave={(newTitle) => onUpdateTitle(chapter.id, newTitle)}
								disabled={isReadOnly}
								className={cn(
									"font-semibold tracking-tight transition-colors",
									isExpanded
										? "text-foreground"
										: "text-muted-foreground group-hover/chapter:text-foreground/80",
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
							onUpdate={onUpdateStructure}
							isReadOnly={isReadOnly}
						/>
						<Button
							variant="ghost"
							size="icon"
							className="h-7 w-7 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors rounded-lg"
							onClick={(e) => {
								e.stopPropagation();
								onDelete(chapter.id);
							}}
							aria-label="Delete chapter"
						>
							<Trash2 className="h-3.5 w-3.5" />
						</Button>
					</div>
				)}
			</div>

			<AnimatePresence>
				{isExpanded && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{
							type: "spring",
							stiffness: 500,
							damping: 30,
							mass: 0.8,
						}}
						className="overflow-hidden"
					>
						<div className="space-y-0.5 mt-1 px-2">
							<SortableList
								items={chapter.scenes}
								onReorder={(reorderedScenes) =>
									onReorderScenes(reorderedScenes, chapter.id)
								}
								disabled={isReadOnly}
							>
								{(scene) => (
									<SidebarSceneItem
										key={scene.id}
										scene={scene}
										isReadOnly={isReadOnly}
										onUpdateTitle={onUpdateSceneTitle}
										onDelete={onDeleteScene}
									/>
								)}
							</SortableList>
							{!isReadOnly && (
								<Button
									variant="ghost"
									size="sm"
									className="w-full justify-start text-xs text-muted-foreground/60 hover:text-primary hover:bg-primary/5 pl-9 py-2 h-auto font-normal rounded-lg mt-1 transition-all"
									onClick={() => onAddScene(chapter.id)}
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
	);
}
