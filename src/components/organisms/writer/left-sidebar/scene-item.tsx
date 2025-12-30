"use client";

import { Check, FileText, Pencil, Sparkles, Trash2 } from "lucide-react";
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
import type { SceneWithPrev } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SceneItemProps {
	scene: SceneWithPrev;
	isActive: boolean;
	isSelected?: boolean;
	chapterId: string;
	onSelect: (sceneId: string) => void;
	onClick?: (
		sceneId: string,
		e: React.MouseEvent | React.KeyboardEvent,
	) => void;
	onGenerateNext: (chapterId: string, sceneId: string) => void;
	isGenerating: boolean;
	onRename?: (sceneId: string, newTitle: string) => void;
	onDelete?: (sceneId: string) => void;
	readOnly?: boolean;
}

export const SceneItem = memo(function SceneItem({
	scene,
	isActive,
	isSelected,
	chapterId,
	onSelect,
	onClick,
	onGenerateNext,
	isGenerating,
	onRename,
	onDelete,
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

	return (
		<div className="relative group">
			<ContextMenu>
				<ContextMenuTrigger disabled={readOnly}>
					<Button
						variant={isActive ? "secondary" : "ghost"}
						size="sm"
						className={cn(
							"justify-start h-8 w-full px-2 text-xs font-normal relative transition-all duration-200",
							isActive && "bg-secondary/50 font-medium",
							isSelected &&
								"bg-primary/10 text-primary hover:bg-primary/20 ring-1 ring-primary/20",
						)}
						onClick={(e) => {
							if (onClick) {
								onClick(scene.id, e);
							} else {
								onSelect(scene.id);
							}
						}}
						onDoubleClick={() => !readOnly && setIsEditing(true)}
					>
						{isSelected ? (
							<Check className="mr-2 h-3 w-3 text-primary animate-in zoom-in-50 duration-200" />
						) : (
							<FileText
								className={cn(
									"mr-2 h-3 w-3 transition-opacity duration-200",
									isActive ? "opacity-100" : "opacity-70",
								)}
							/>
						)}
						<span className="truncate flex-1 text-left">{scene.title}</span>

						{/* Selection Hint (visible on hover) */}
						<div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[9px] text-muted-foreground font-mono bg-background/50 px-1 rounded backdrop-blur-sm pointer-events-none">
							⌘
						</div>
					</Button>
				</ContextMenuTrigger>
				<ContextMenuContent>
					<ContextMenuItem
						onClick={() => onGenerateNext(chapterId, scene.id)}
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
