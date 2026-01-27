"use client";

import { FilePlus2, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";
import {
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/atoms/accordion";
import { Button } from "@/components/atoms/button";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from "@/components/atoms/context-menu";
import { Input } from "@/components/atoms/input";
import { SceneItem } from "@/features/writer/components/left-sidebar/scene-item";
import type { ChapterWithScenes } from "@/lib/types";

interface SidebarChapterProps {
	chapter: ChapterWithScenes;
	activeSceneId: string | null;
	isGenerating: boolean;
	readOnly?: boolean;
	isSelectionMode: boolean;
	selectedSceneIds: Set<string>;
	onSceneSelect: (sceneId: string | null) => void;
	onGenerateNextScene: (chapterId: string, prevSceneId?: string) => void;
	onCreateSceneManually: (chapterId: string) => void;
	onRenameScene: (sceneId: string, newTitle: string) => void;
	onDeleteScene: (sceneId: string) => void;
	onToggleSceneSelect: (sceneId: string) => void;
	onRenameChapter?: (chapterId: string, newTitle: string) => void;
	onDeleteChapter?: (chapterId: string) => void;
}

export const SidebarChapter = memo(function SidebarChapter({
	chapter,
	activeSceneId,
	isGenerating,
	readOnly,
	isSelectionMode,
	selectedSceneIds,
	onSceneSelect,
	onGenerateNextScene,
	onCreateSceneManually,
	onRenameScene,
	onDeleteScene,
	onToggleSceneSelect,
	onRenameChapter,
	onDeleteChapter,
}: SidebarChapterProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [editValue, setEditValue] = useState(chapter.title);
	const inputRef = useRef<HTMLInputElement>(null);

	// Sync state
	useEffect(() => {
		setEditValue(chapter.title);
	}, [chapter.title]);

	// Focus logic
	useEffect(() => {
		if (isEditing && inputRef.current) {
			inputRef.current.focus();
			inputRef.current.select();
		}
	}, [isEditing]);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			// Trigger blur to save
			inputRef.current?.blur();
		} else if (e.key === "Escape") {
			e.preventDefault();
			e.stopPropagation();
			setEditValue(chapter.title);
			setIsEditing(false);
		}
	};

	const handleBlur = () => {
		if (isEditing) {
			if (editValue.trim() && editValue !== chapter.title) {
				onRenameChapter?.(chapter.id, editValue.trim());
			} else {
				setEditValue(chapter.title);
			}
			setIsEditing(false);
		}
	};

	return (
		<AccordionItem value={chapter.id} className="border-b-0 px-2">
			<ContextMenu>
				<ContextMenuTrigger disabled={readOnly}>
					<AccordionTrigger className="hover:no-underline py-2 text-sm font-semibold text-foreground/80 hover:text-foreground transition-colors group">
						{isEditing ? (
							<Input
								ref={inputRef}
								value={editValue}
								onChange={(e) => setEditValue(e.target.value)}
								onKeyDown={handleKeyDown}
								onBlur={handleBlur}
								onClick={(e) => e.stopPropagation()} // Prevent accordion toggle
								className="h-6 text-sm px-1 font-medium bg-background"
								aria-label="Chapter title"
							/>
						) : (
							<span className="truncate text-left">{chapter.title}</span>
						)}
					</AccordionTrigger>
				</ContextMenuTrigger>
				<ContextMenuContent>
					<ContextMenuItem
						onClick={() => onGenerateNextScene(chapter.id)}
						disabled={isGenerating}
					>
						<Sparkles className="mr-2 h-4 w-4" />
						Generate New Scene
					</ContextMenuItem>
					<ContextMenuItem onClick={() => onCreateSceneManually(chapter.id)}>
						<FilePlus2 className="mr-2 h-4 w-4" />
						Add Scene Manually
					</ContextMenuItem>
					<ContextMenuSeparator />
					<ContextMenuItem onClick={() => setIsEditing(true)}>
						<Pencil className="mr-2 h-4 w-4" />
						Rename Chapter
					</ContextMenuItem>
					<ContextMenuItem
						onClick={() => onDeleteChapter?.(chapter.id)}
						className="text-destructive focus:text-destructive"
					>
						<Trash2 className="mr-2 h-4 w-4" />
						Delete Chapter
					</ContextMenuItem>
				</ContextMenuContent>
			</ContextMenu>

			<AccordionContent className="pb-2 pt-0">
				<div className="flex flex-col gap-0.5 pl-2 relative ml-2 border-l border-border/40 my-1">
					{chapter.scenes.map((scene) => (
						<SceneItem
							key={scene.id}
							scene={scene}
							isActive={activeSceneId === scene.id}
							chapterId={chapter.id}
							onSelect={(id) => onSceneSelect(id)}
							onGenerateNext={onGenerateNextScene}
							isGenerating={isGenerating}
							onRename={onRenameScene}
							onDelete={onDeleteScene}
							readOnly={readOnly}
							isSelectionMode={isSelectionMode}
							isSelected={selectedSceneIds.has(scene.id)}
							onToggleSelect={onToggleSceneSelect}
						/>
					))}
					<Button
						variant="ghost"
						size="sm"
						className="justify-start h-8 w-full px-2 text-xs text-muted-foreground italic"
						onClick={() => onCreateSceneManually(chapter.id)}
						disabled={isGenerating || readOnly}
					>
						<Plus className="mr-2 h-3 w-3" />
						Add Scene
					</Button>
				</div>
			</AccordionContent>
		</AccordionItem>
	);
});
