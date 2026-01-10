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
import { GripVertical, LayoutList, Pencil, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import type {
	SerializedChapterWithScenes,
	SerializedScene,
} from "@/app/actions/scene-data";
import { deleteScene, updateSceneTitle } from "@/app/actions/writer/scene";
import { updateSceneStatus } from "@/app/actions/writer/scene-status";
import { Badge } from "@/components/atoms/badge";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from "@/components/atoms/context-menu";
import { Input } from "@/components/atoms/input";
import { ScrollArea } from "@/components/atoms/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/atoms/select";
import { useWriterContext } from "@/components/organisms/writer/writer-context";
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
	onRename: (sceneId: string, newTitle: string) => void;
	onDelete: (sceneId: string) => void;
	onNavigate: (sceneId: string) => void;
}

function KanbanCard({
	scene,
	chapterTitle,
	onRename,
	onDelete,
	onNavigate,
}: KanbanCardProps) {
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

	const [isEditing, setIsEditing] = useState(false);
	const [editValue, setEditValue] = useState(scene.title);
	const inputRef = useRef<HTMLInputElement>(null);
	const isCanceling = useRef(false);

	// Sync state with prop if title changes externally
	useEffect(() => {
		setEditValue(scene.title);
	}, [scene.title]);

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
				onRename(scene.id, editValue.trim());
			} else {
				setEditValue(scene.title);
			}
			setIsEditing(false);
		}
	};

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
		<ContextMenu>
			<ContextMenuTrigger>
				{/* biome-ignore lint/a11y/useSemanticElements: interactive div needed for drag handle + click actions */}
				<div
					ref={setNodeRef}
					style={style}
					className="relative p-3 rounded-md border bg-card shadow-sm hover:shadow-md transition-all group cursor-grab active:cursor-grabbing select-none focus:ring-2 focus:ring-ring focus:outline-none"
					{...attributes}
					{...listeners}
					onDoubleClick={() => setIsEditing(true)}
					role="button"
					tabIndex={0}
				>
					<div className="flex justify-between items-start mb-2">
						<Badge variant="outline" className="text-[10px] h-5 px-1.5">
							Ch {scene.sequence}
						</Badge>
						<GripVertical className="h-3 w-3 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
					</div>

					{isEditing ? (
						<Input
							ref={inputRef}
							value={editValue}
							onChange={(e) => setEditValue(e.target.value)}
							onKeyDown={handleKeyDown}
							onBlur={handleBlur}
							className="h-6 text-sm px-1 mb-1 font-medium bg-background"
							aria-label="Scene title"
							// Prevent drag events from interfering with input
							onPointerDown={(e) => e.stopPropagation()}
						/>
					) : (
						<div className="font-medium text-sm leading-tight mb-1">
							{scene.title}
						</div>
					)}

					<div className="text-[10px] text-muted-foreground line-clamp-2">
						{scene.card?.purpose || "No purpose defined"}
					</div>
					{chapterTitle && (
						<div className="mt-2 text-[10px] text-muted-foreground/70 truncate border-t pt-1">
							{chapterTitle}
						</div>
					)}
				</div>
			</ContextMenuTrigger>
			<ContextMenuContent>
				<ContextMenuItem onClick={() => onNavigate(scene.id)}>
					<LayoutList className="mr-2 h-4 w-4" />
					Open in Editor
				</ContextMenuItem>
				<ContextMenuItem onClick={() => setIsEditing(true)}>
					<Pencil className="mr-2 h-4 w-4" />
					Rename
				</ContextMenuItem>
				<ContextMenuSeparator />
				<ContextMenuItem
					className="text-destructive focus:text-destructive"
					onClick={() => onDelete(scene.id)}
				>
					<Trash2 className="mr-2 h-4 w-4" />
					Delete Scene
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
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
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedChapterId, setSelectedChapterId] = useState<string>("all");
	const { setActiveSceneId, setIsCanvasOpen } = useWriterContext();

	// Flatten scenes and group by status
	const allScenes = useMemo(() => {
		return chapters.flatMap((c) =>
			c.scenes.map((s) => ({ ...s, chapterTitle: c.title })),
		);
	}, [chapters]);

	// Filter scenes based on search and chapter selection
	const filteredScenes = useMemo(() => {
		return allScenes.filter((scene) => {
			const matchesSearch = scene.title
				.toLowerCase()
				.includes(searchQuery.toLowerCase());
			const matchesChapter =
				selectedChapterId === "all" || scene.chapterId === selectedChapterId;
			return matchesSearch && matchesChapter;
		});
	}, [allScenes, searchQuery, selectedChapterId]);

	const scenesByStatus = useMemo(() => {
		const acc: Record<string, typeof filteredScenes> = {};
		COLUMNS.forEach((col) => {
			acc[col.id] = [];
		});
		filteredScenes.forEach((scene) => {
			const status = scene.status || "planned";
			if (!acc[status]) acc[status] = []; // fallback for unknown status
			acc[status].push(scene);
		});
		return acc;
	}, [filteredScenes]);

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

	const { mutate: renameScene } = useMutation({
		mutationFn: async ({ id, title }: { id: string; title: string }) => {
			return updateSceneTitle(id, title);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [`project-structure:${projectId}`],
			});
			toast.success("Scene renamed");
		},
		onError: () => {
			toast.error("Failed to rename scene");
		},
	});

	const { mutate: removeScene } = useMutation({
		mutationFn: async (id: string) => {
			return deleteScene(id);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [`project-structure:${projectId}`],
			});
			toast.success("Scene deleted");
		},
		onError: () => {
			toast.error("Failed to delete scene");
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
		const overScene = allScenes.find((s) => s.id === overId);
		if (overScene) {
			targetStatus = overScene.status;
		}

		// Validation
		if (!COLUMNS.find((c) => c.id === targetStatus)) return;

		const activeScene = allScenes.find((s) => s.id === activeSceneId);
		if (activeScene && activeScene.status !== targetStatus) {
			// Update Status
			moveScene({ sceneId: activeSceneId, status: targetStatus });
		}
	};

	const handleNavigate = (sceneId: string) => {
		setActiveSceneId(sceneId);
		setIsCanvasOpen(false); // Close canvas to focus on editor
	};

	const activeScene = activeId
		? allScenes.find((s) => s.id === activeId)
		: null;

	return (
		<div className="flex flex-col h-full space-y-4">
			{/* Toolbar */}
			<div className="flex items-center gap-3 px-1">
				<div className="relative flex-1 max-w-sm">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search scenes..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						onClear={() => setSearchQuery("")}
						className="pl-9 h-9"
					/>
				</div>
				<div className="w-48">
					<Select
						value={selectedChapterId}
						onValueChange={setSelectedChapterId}
					>
						<SelectTrigger className="h-9">
							<SelectValue placeholder="All Chapters" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Chapters</SelectItem>
							{chapters.map((chapter) => (
								<SelectItem key={chapter.id} value={chapter.id}>
									Ch {chapter.sequence}: {chapter.title}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Kanban Board */}
			<DndContext
				sensors={sensors}
				onDragStart={handleDragStart}
				onDragOver={handleDragOver}
				onDragEnd={handleDragEnd}
			>
				<div className="flex-1 overflow-hidden">
					<div className="h-full flex gap-4 overflow-x-auto pb-4 px-1">
						{COLUMNS.map((col) => (
							<div
								key={col.id}
								className="flex-shrink-0 w-64 flex flex-col rounded-lg bg-muted/20 border border-border/50 h-full max-h-full"
							>
								<div
									className={cn(
										"p-3 font-medium text-xs uppercase tracking-wider flex justify-between items-center rounded-t-lg shrink-0",
										col.color,
									)}
								>
									{col.title}
									<Badge variant="secondary" className="text-[10px] h-5">
										{scenesByStatus[col.id]?.length || 0}
									</Badge>
								</div>
								<ScrollArea className="flex-1">
									<div className="p-2 flex flex-col gap-2 min-h-[100px]">
										<SortableContext
											items={scenesByStatus[col.id]?.map((s) => s.id) || []}
										>
											{scenesByStatus[col.id]?.map((scene) => (
												<KanbanCard
													key={scene.id}
													scene={scene}
													chapterTitle={scene.chapterTitle}
													onRename={(id, title) => renameScene({ id, title })}
													onDelete={(id) => removeScene(id)}
													onNavigate={handleNavigate}
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
		</div>
	);
}
