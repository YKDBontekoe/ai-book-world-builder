"use client";

import {
	DndContext,
	type DragEndEvent,
	type DragOverEvent,
	DragOverlay,
	type DragStartEvent,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GripVertical } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import type {
	SerializedChapterWithScenes,
	SerializedScene,
} from "@/app/actions/scene-data";
import { Badge } from "@/components/atoms/badge";
import { ScrollArea } from "@/components/atoms/scroll-area";
import { updateSceneStatus } from "@/features/writer/actions/scene-status";
import { QUERY_KEYS } from "@/lib/query-options";
import { cn } from "@/lib/utils";

const COLUMNS = [
	{ id: "planned", title: "Planned", color: "bg-muted" },
	{ id: "drafting", title: "Drafting", color: "bg-blue-500/10" },
	{ id: "drafted", title: "Drafted", color: "bg-green-500/10" },
	{ id: "review", title: "Review", color: "bg-purple-500/10" },
	{ id: "final", title: "Final", color: "bg-primary/10" },
] as const;

interface KanbanCardProps {
	scene: SerializedScene;
	chapterTitle?: string;
}

function KanbanCard({ scene, chapterTitle }: KanbanCardProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: scene.id,
		data: { type: "scene", scene },
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	if (isDragging) {
		return (
			<div
				ref={setNodeRef}
				style={style}
				className="opacity-30 p-3 rounded-md border bg-card h-[100px]"
			/>
		);
	}

	return (
		<div
			ref={setNodeRef}
			style={style}
			className="p-3 rounded-md border bg-card shadow-sm hover:shadow-md transition-all group cursor-grab active:cursor-grabbing"
			{...attributes}
			{...listeners}
		>
			<div className="flex justify-between items-start mb-2">
				<Badge variant="outline" className="text-[10px] h-5 px-1.5">
					Ch {scene.sequence}
				</Badge>
				<GripVertical className="h-3 w-3 text-muted-foreground/50 opacity-0 group-hover:opacity-100" />
			</div>
			<div className="font-medium text-sm leading-tight mb-1">
				{scene.title}
			</div>
			<div className="text-[10px] text-muted-foreground line-clamp-2">
				{scene.card?.purpose || "No purpose defined"}
			</div>
			{chapterTitle && (
				<div className="mt-2 text-[10px] text-muted-foreground/70 truncate border-t pt-1">
					{chapterTitle}
				</div>
			)}
		</div>
	);
}

export function KanbanView({
	chapters,
	projectId,
}: {
	chapters: SerializedChapterWithScenes[];
	projectId: string;
}) {
	const queryClient = useQueryClient();
	const [activeId, setActiveId] = useState<string | null>(null);

	// Flatten scenes and group by status
	const scenes = useMemo(() => {
		return chapters.flatMap((c) =>
			c.scenes.map((s) => ({ ...s, chapterTitle: c.title })),
		);
	}, [chapters]);

	const scenesByStatus = useMemo(() => {
		const acc: Record<string, typeof scenes> = {};
		COLUMNS.forEach((col) => {
			acc[col.id] = [];
		});
		scenes.forEach((scene) => {
			const status = scene.status || "planned";
			if (!acc[status]) acc[status] = []; // fallback for unknown status
			acc[status].push(scene);
		});
		return acc;
	}, [scenes]);

	const { mutate: moveScene } = useMutation({
		mutationFn: async ({
			sceneId,
			status,
		}: {
			sceneId: string;
			status: string;
		}) => {
			return updateSceneStatus(sceneId, status, projectId);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.scenes(projectId) });
		},
		onError: () => {
			toast.error("Failed to update status");
		},
	});

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
	);

	const handleDragStart = (event: DragStartEvent) => {
		setActiveId(event.active.id as string);
	};

	const handleDragOver = (event: DragOverEvent) => {
		const { over } = event;
		if (!over) return;
		// Just visual feedback, logic handled in DragEnd for status change
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		setActiveId(null);

		if (!over) return;

		const activeSceneId = active.id as string;
		const overId = over.id as string;

		// Find the target column status
		let targetStatus = overId;
		// If dropped over a card, find that card's status
		const overScene = scenes.find((s) => s.id === overId);
		if (overScene) {
			targetStatus = overScene.status;
		}

		// Validation
		if (!COLUMNS.find((c) => c.id === targetStatus)) return;

		const activeScene = scenes.find((s) => s.id === activeSceneId);
		if (activeScene && activeScene.status !== targetStatus) {
			// Update Status
			moveScene({ sceneId: activeSceneId, status: targetStatus });
		}
	};

	const activeScene = activeId ? scenes.find((s) => s.id === activeId) : null;

	return (
		<DndContext
			sensors={sensors}
			onDragStart={handleDragStart}
			onDragOver={handleDragOver}
			onDragEnd={handleDragEnd}
		>
			<div className="h-full flex gap-4 overflow-x-auto pb-4">
				{COLUMNS.map((col) => (
					<div
						key={col.id}
						className="flex-shrink-0 w-64 flex flex-col rounded-lg bg-muted/20 border border-border/50"
					>
						<div
							className={cn(
								"p-3 font-medium text-xs uppercase tracking-wider flex justify-between items-center rounded-t-lg",
								col.color,
							)}
						>
							{col.title}
							<Badge variant="secondary" className="text-[10px] h-5">
								{scenesByStatus[col.id]?.length || 0}
							</Badge>
						</div>
						<ScrollArea className="flex-1">
							<div className="p-2 flex flex-col gap-2 min-h-[150px]">
								<SortableContext
									items={scenesByStatus[col.id]?.map((s) => s.id) || []}
								>
									{scenesByStatus[col.id]?.map((scene) => (
										<KanbanCard
											key={scene.id}
											scene={scene}
											chapterTitle={scene.chapterTitle}
										/>
									))}
								</SortableContext>
								{/* Drop Zone Placeholder for empty columns */}
								{(!scenesByStatus[col.id] ||
									scenesByStatus[col.id].length === 0) && (
									<div
										id={col.id} // ID matches status for dropping
										className="flex-1 min-h-[100px] flex items-center justify-center text-xs text-muted-foreground/30 border-2 border-dashed border-transparent hover:border-muted-foreground/20 rounded-md transition-colors"
									>
										Drop here
									</div>
								)}
								{/* Explicit drop target at bottom of list if not empty */}
								{scenesByStatus[col.id]?.length > 0 && (
									<div
										id={col.id}
										className="h-8 -mt-2 z-0" // Invisible target at bottom
									/>
								)}
							</div>
						</ScrollArea>
					</div>
				))}
			</div>

			<DragOverlay>
				{activeScene ? (
					<div className="p-3 rounded-md border bg-card shadow-xl w-60 rotate-2 cursor-grabbing">
						<div className="font-medium text-sm leading-tight mb-1">
							{activeScene.title}
						</div>
					</div>
				) : null}
			</DragOverlay>
		</DndContext>
	);
}
