"use client";

import { FileText, Pencil, Sparkles, Trash2 } from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";
import { Button } from "@/components/atoms/button";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from "@/components/atoms/context-menu";
import { Input } from "@/components/atoms/input";
import { cn } from "@/lib/utils";

interface SceneItemProps {
	id: string;
	title: string;
	isActive: boolean;
	chapterId: string;
	onSelect: (sceneId: string) => void;
	onGenerateNext: (chapterId: string, sceneId: string) => void;
	isGenerating: boolean;
	onRename?: (sceneId: string, newTitle: string) => void;
	onDelete?: (sceneId: string) => void;
	readOnly?: boolean;
}

export const SceneItem = memo(function SceneItem({
	id,
	title,
	isActive,
	chapterId,
	onSelect,
	onGenerateNext,
	isGenerating,
	onRename,
	onDelete,
	readOnly,
}: SceneItemProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [editValue, setEditValue] = useState(title);
	const inputRef = useRef<HTMLInputElement>(null);

	// Sync state with prop if title changes externally
	useEffect(() => {
		setEditValue(title);
	}, [title]);

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
			setEditValue(title);
			setIsEditing(false);
		}
	};

	const handleBlur = () => {
		if (isCanceling.current) {
			return;
		}

		if (isEditing) {
			if (editValue.trim() && editValue !== title) {
				onRename?.(id, editValue.trim());
			} else {
				setEditValue(title);
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
						onClick={() => onSelect(id)}
						onDoubleClick={() => !readOnly && setIsEditing(true)}
					>
						<FileText className="mr-2 h-3 w-3 opacity-70" />
						<span className="truncate">{title}</span>
					</Button>
				</ContextMenuTrigger>
				<ContextMenuContent>
					<ContextMenuItem
						onClick={() => onGenerateNext(chapterId, id)}
						disabled={isGenerating}
					>
						<Sparkles className="mr-2 h-4 w-4" />
						Generate Continuation
					</ContextMenuItem>
					<ContextMenuItem onClick={() => setIsEditing(true)}>
						<Pencil className="mr-2 h-4 w-4" />
						Rename
					</ContextMenuItem>
					<ContextMenuSeparator />
					<ContextMenuItem
						className="text-destructive focus:text-destructive"
						onClick={() => onDelete?.(id)}
					>
						<Trash2 className="mr-2 h-4 w-4" />
						Delete Scene
					</ContextMenuItem>
				</ContextMenuContent>
			</ContextMenu>
		</div>
	);
});
