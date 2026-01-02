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
import type { SceneWithPrev } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SceneItemProps {
	scene: SceneWithPrev;
	isActive: boolean;
	isSelected?: boolean;
	chapterId: string;
	onSelect: (
		sceneId: string,
		multiSelect: boolean,
		rangeSelect: boolean,
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

	const handleClick = (e: React.MouseEvent) => {
		const isMulti = e.metaKey || e.ctrlKey;
		const isRange = e.shiftKey;
		onSelect(scene.id, isMulti, isRange);
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
						variant="ghost"
						size="sm"
						className={cn(
							"justify-start h-8 w-full px-2 text-xs font-normal transition-colors relative",
							// Active (viewing) state
							isActive &&
								!isSelected &&
								"bg-secondary/50 font-medium text-foreground",
							// Selected (bulk) state
							isSelected &&
								"bg-primary/20 hover:bg-primary/30 text-primary font-medium",
							// Overrides
							!isActive && !isSelected && "text-muted-foreground",
						)}
						onClick={handleClick}
						onDoubleClick={() => !readOnly && setIsEditing(true)}
						aria-selected={isSelected}
					>
						{/* Selection Indicator Line */}
						{isSelected && (
							<div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary rounded-l-md" />
						)}

						<FileText
							className={cn(
								"mr-2 h-3 w-3 transition-colors",
								isSelected ? "opacity-100" : "opacity-70",
							)}
						/>
						<span className="truncate">{scene.title}</span>
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
