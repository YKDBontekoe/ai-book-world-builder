"use client";

import { FileText, Pencil, Sparkles, Trash2, Copy, ArrowRight, BookOpen } from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";
import { Button } from "@/components/atoms/button";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuTrigger,
	ContextMenuSub,
	ContextMenuSubContent,
	ContextMenuSubTrigger,
} from "@/components/atoms/context-menu";
import { Input } from "@/components/atoms/input";
import type { SceneWithPrev, ChapterWithScenes } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SceneItemProps {
	scene: SceneWithPrev;
	isActive: boolean;
	chapterId: string;
	onSelect: (sceneId: string) => void;
	onGenerateNext: (chapterId: string, sceneId: string) => void;
	isGenerating: boolean;
	onRename?: (sceneId: string, newTitle: string) => void;
	onDelete?: (sceneId: string) => void;
	onDuplicate?: (sceneId: string) => void;
	onMoveToChapter?: (sceneId: string, targetChapterId: string) => void;
	chapters?: ChapterWithScenes[];
	readOnly?: boolean;
}

export const SceneItem = memo(function SceneItem({
	scene,
	isActive,
	chapterId,
	onSelect,
	onGenerateNext,
	isGenerating,
	onRename,
	onDelete,
	onDuplicate,
	onMoveToChapter,
	chapters,
	readOnly,
}: SceneItemProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [editValue, setEditValue] = useState(scene.title);
	const inputRef = useRef<HTMLInputElement>(null);

	// Sync state with prop if title changes externally
	useEffect(() => {
		setEditValue(scene.title);
	}, [scene.title]);

	const isCanceling = useRef(false);

	useEffect(() => {
		if (isEditing) {
			isCanceling.current = false;
			if (inputRef.current) {
				inputRef.current.focus();
				inputRef.current.select();
			}
		}
	}, [isEditing]);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			inputRef.current?.blur();
		} else if (e.key === "Escape") {
			e.preventDefault();
			e.stopPropagation();
			isCanceling.current = true;
			// Don't call onRename, just reset
			setEditValue(scene.title);
			setIsEditing(false);
		}
	};

	const handleBlur = () => {
		if (isCanceling.current) {
			return;
		}

		if (isEditing) {
			if (editValue.trim() && editValue !== scene.title) {
				onRename?.(scene.id, editValue.trim());
			} else {
				setEditValue(scene.title);
			}
			setIsEditing(false);
		}
	};

	if (isEditing) {
		return (
			<div className="px-2 h-8 flex items-center">
				<Input
					ref={inputRef}
					value={editValue}
					onChange={(e) => setEditValue(e.target.value)}
					onKeyDown={handleKeyDown}
					onBlur={handleBlur}
					className="h-6 text-xs px-1"
					aria-label="Scene title"
				/>
			</div>
		);
	}

	const otherChapters = chapters?.filter((c) => c.id !== chapterId) || [];

	return (
		<div className="relative">
			<ContextMenu>
				<ContextMenuTrigger disabled={readOnly}>
					<Button
						variant={isActive ? "secondary" : "ghost"}
						size="sm"
						className={cn(
							"justify-start h-8 w-full px-2 text-xs font-normal",
							isActive && "bg-secondary/50 font-medium",
						)}
						onClick={() => onSelect(scene.id)}
						onDoubleClick={() => !readOnly && setIsEditing(true)}
					>
						<FileText className="mr-2 h-3 w-3 opacity-70" />
						<span className="truncate">{scene.title}</span>
					</Button>
				</ContextMenuTrigger>
				<ContextMenuContent className="w-48">
					<ContextMenuItem
						onClick={() => onGenerateNext(chapterId, scene.id)}
						disabled={isGenerating}
					>
						<Sparkles className="mr-2 h-4 w-4" />
						Generate Continuation
					</ContextMenuItem>

					<ContextMenuSeparator />

					<ContextMenuItem onClick={() => setIsEditing(true)}>
						<Pencil className="mr-2 h-4 w-4" />
						Rename
					</ContextMenuItem>

					<ContextMenuItem onClick={() => onDuplicate?.(scene.id)}>
						<Copy className="mr-2 h-4 w-4" />
						Duplicate
					</ContextMenuItem>

					{otherChapters.length > 0 && onMoveToChapter && (
						<ContextMenuSub>
							<ContextMenuSubTrigger>
								<ArrowRight className="mr-2 h-4 w-4" />
								Move to Chapter
							</ContextMenuSubTrigger>
							<ContextMenuSubContent className="w-48 max-h-64 overflow-y-auto">
								{otherChapters.map((chapter) => (
									<ContextMenuItem
										key={chapter.id}
										onClick={() => onMoveToChapter(scene.id, chapter.id)}
									>
										<BookOpen className="mr-2 h-4 w-4 opacity-50" />
										<span className="truncate">{chapter.title}</span>
									</ContextMenuItem>
								))}
							</ContextMenuSubContent>
						</ContextMenuSub>
					)}

					<ContextMenuSeparator />

					<ContextMenuItem
						className="text-destructive focus:text-destructive"
						onClick={() => onDelete?.(scene.id)}
					>
						<Trash2 className="mr-2 h-4 w-4" />
						Delete Scene
					</ContextMenuItem>
				</ContextMenuContent>
			</ContextMenu>
		</div>
	);
});
