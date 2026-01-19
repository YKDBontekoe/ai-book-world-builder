"use client";

import { FilePlus2, Plus, Sparkles } from "lucide-react";
import { memo } from "react";
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
	ContextMenuTrigger,
} from "@/components/atoms/context-menu";
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
}: SidebarChapterProps) {
	return (
		<AccordionItem value={chapter.id} className="border-b-0 px-2">
			<ContextMenu>
				<ContextMenuTrigger disabled={readOnly}>
					<AccordionTrigger className="hover:no-underline py-2 text-sm font-medium">
						<span className="truncate text-left">{chapter.title}</span>
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
				</ContextMenuContent>
			</ContextMenu>

			<AccordionContent className="pb-2 pt-0">
				<div className="flex flex-col gap-1 pl-2 relative ml-2">
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
