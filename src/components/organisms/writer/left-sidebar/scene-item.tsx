"use client";

import { FileText, Sparkles } from "lucide-react";
import { memo } from "react";
import { Button } from "@/components/atoms/button";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from "@/components/atoms/context-menu";
import type { SceneWithPrev } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SceneItemProps {
	scene: SceneWithPrev;
	isActive: boolean;
	isSelected?: boolean;
	chapterId: string;
	onSelect: (sceneId: string) => void;
	onToggleSelection?: (multi: boolean, range: boolean) => void;
	onGenerateNext: (chapterId: string, sceneId: string) => void;
	isGenerating: boolean;
}

export const SceneItem = memo(function SceneItem({
	scene,
	isActive,
	isSelected,
	chapterId,
	onSelect,
	onToggleSelection,
	onGenerateNext,
	isGenerating,
}: SceneItemProps) {
	return (
		<div className="relative">
			<ContextMenu>
				<ContextMenuTrigger>
					<Button
						variant={isActive ? "secondary" : "ghost"}
						size="sm"
						className={cn(
							"justify-start h-8 w-full px-2 text-xs font-normal",
							isActive && "bg-secondary/50 font-medium",
							isSelected && "bg-primary/20 hover:bg-primary/30 text-primary font-medium"
						)}
						onClick={(e) => {
							if (e.metaKey || e.ctrlKey || e.shiftKey) {
								e.preventDefault();
								e.stopPropagation();
								onToggleSelection?.(e.metaKey || e.ctrlKey, e.shiftKey);
							} else {
								onSelect(scene.id);
							}
						}}
					>
						<FileText className={cn(
							"mr-2 h-3 w-3 opacity-70",
							isSelected && "text-primary opacity-100"
						)} />
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
					<ContextMenuSeparator />
					<ContextMenuItem className="text-destructive" disabled>
						Delete Scene
					</ContextMenuItem>
				</ContextMenuContent>
			</ContextMenu>
		</div>
	);
});
