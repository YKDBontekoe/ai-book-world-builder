"use client";

import { Check, FileText, Sparkles } from "lucide-react";
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
	onClick?: (
		sceneId: string,
		e: React.MouseEvent | React.KeyboardEvent,
	) => void;
	onGenerateNext: (chapterId: string, sceneId: string) => void;
	isGenerating: boolean;
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
}: SceneItemProps) {
	return (
		<div className="relative group">
			<ContextMenu>
				<ContextMenuTrigger>
					<Button
						variant={isActive ? "secondary" : "ghost"}
						size="sm"
						aria-selected={isSelected}
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
							{typeof navigator !== "undefined" &&
							(navigator.userAgentData?.platform === "macOS" ||
								/Mac|iPhone|iPad/.test(navigator.userAgent))
								? "⌘"
								: "Ctrl"}
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
					<ContextMenuSeparator />
					<ContextMenuItem className="text-destructive" disabled>
						Delete Scene
					</ContextMenuItem>
				</ContextMenuContent>
			</ContextMenu>
		</div>
	);
});
