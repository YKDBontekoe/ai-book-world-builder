"use client";

import {
	DndContext,
	type DragEndEvent,
	DragOverlay,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, Flag, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getProjectStructure } from "@/app/actions/writer";
import { updateSceneChronology } from "@/app/actions/writer/timeline";
import { LoadingSpinner } from "@/components/atoms/loading-spinner";
import { ScrollArea, ScrollBar } from "@/components/atoms/scroll-area";
import { EmptyState } from "@/components/molecules/empty-state";
import { useBookCanvas } from "@/components/organisms/book-canvas/book-canvas-context";
import { cn } from "@/lib/utils";

type TimelineEvent = {
	id: string;
	type: "scene";
	data: any;
	chapterTitle: string;
	time: string;
	sequence: number; // The chronological sequence
};

// Sortable Timeline Item
function TimelineItem({
	event,
	isSelected,
	onClick,
	isEven,
}: {
	event: TimelineEvent;
	isSelected: boolean;
	onClick: () => void;
	isEven: boolean;
}) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: event.id, data: event });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={cn(
				"relative group cursor-grab active:cursor-grabbing",
				isEven ? "-mt-32" : "mt-32",
				isDragging ? "opacity-50 z-50" : "opacity-100 z-10",
			)}
		>
			<button
				type="button"
				className="absolute inset-0 w-full h-full z-10 cursor-grab active:cursor-grabbing opacity-0"
				onClick={onClick}
				aria-label={`Select scene ${event.data.title}`}
				{...attributes}
				{...listeners}
			/>
			{/* Connector Line */}
			<div
				className={cn(
					"absolute left-1/2 w-0.5 bg-border group-hover:bg-primary/50 transition-colors -z-10",
					isEven
						? "top-full h-16 origin-bottom"
						: "bottom-full h-16 origin-top",
				)}
			/>

			{/* Node Card */}
			<div
				className={cn(
					"w-48 p-3 rounded-lg border backdrop-blur-md transition-all duration-300 pointer-events-none",
					isSelected
						? "bg-primary/10 border-primary shadow-lg scale-105"
						: "bg-card/80 border-border hover:border-primary/50 hover:shadow-md",
				)}
			>
				<div className="flex items-center justify-between mb-1.5">
					<span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
						Seq: {event.sequence}
					</span>
					{isSelected && (
						<span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
					)}
				</div>
				<h4 className="font-medium text-sm line-clamp-2 leading-tight mb-1">
					{event.data.title}
				</h4>
				<div className="flex items-center gap-2 text-[10px] text-muted-foreground/70">
					<MapPin className="w-3 h-3" />
					<span>{event.data.timeSetting || "Time TBD"}</span>
				</div>
			</div>

			{/* Dot on Axis */}
			<div
				className={cn(
					"absolute left-1/2 -ml-1.5 w-3 h-3 rounded-full border-2 border-background z-20 transition-colors pointer-events-none",
					isEven ? "top-[calc(100%+3.5rem)]" : "bottom-[calc(100%+3.5rem)]",
					isSelected ? "bg-primary" : "bg-muted-foreground/30",
				)}
			/>
		</div>
	);
}

export function TimelinePane() {
	const { projectId, activeSceneId, setActiveSceneId } = useBookCanvas();
	const [activeDragId, setActiveDragId] = useState<string | null>(null);
	const [localEvents, setLocalEvents] = useState<TimelineEvent[]>([]);

	const { data: result, isLoading } = useQuery({
		queryKey: projectId
			? ["project-structure", projectId]
			: ["structure", "null"],
		queryFn: () =>
			projectId ? getProjectStructure(projectId) : Promise.resolve(null),
		enabled: !!projectId,
	});

	const structure = result?.structure;

	// Initial Load: Flatten structure and sort by chronologicalSequence
	useEffect(() => {
		if (structure) {
			let fallbackSeq = 0;
			const events: TimelineEvent[] = structure.flatMap((chapter) => {
				return chapter.scenes.map((scene) => {
					fallbackSeq++;
					// Default to narrative sequence if chronological is missing
					const seq = (scene as any).chronologicalSequence ?? fallbackSeq;
					return {
						id: scene.id,
						type: "scene",
						data: scene,
						chapterTitle: chapter.title,
						time: (scene as any).timeSetting || `Scene ${seq}`,
						sequence: seq,
					};
				});
			});

			// Sort by sequence
			const sortedEvents = events.sort((a, b) => a.sequence - b.sequence);
			setLocalEvents(sortedEvents);
		}
	}, [structure]);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
	);

	const handleDragEnd = async (event: DragEndEvent) => {
		const { active, over } = event;
		setActiveDragId(null);

		if (!over || active.id === over.id || !projectId) return;

		const oldIndex = localEvents.findIndex((e) => e.id === active.id);
		const newIndex = localEvents.findIndex((e) => e.id === over.id);

		if (oldIndex !== -1 && newIndex !== -1) {
			// Optimistic reorder
			const newItems = [...localEvents];
			const [movedItem] = newItems.splice(oldIndex, 1);
			newItems.splice(newIndex, 0, movedItem);

			// Re-calculate sequences based on new index
			const updatedItems = newItems.map((item, index) => ({
				...item,
				sequence: index + 1,
			}));

			setLocalEvents(updatedItems);

			// Server Action: Update the moved item's sequence
			const targetSequence = newIndex + 1; // 1-based index
			const result = await updateSceneChronology(
				active.id as string,
				targetSequence,
				projectId,
			);

			if (!result.success) {
				toast.error("Failed to update timeline");
			}
		}
	};

	if (isLoading) {
		return (
			<div className="flex h-full items-center justify-center">
				<LoadingSpinner />
			</div>
		);
	}

	if (!projectId || !structure || structure.length === 0) {
		return (
			<EmptyState
				icon={Calendar}
				title="Timeline Empty"
				description="Add chapters and scenes to see your story timeline."
			/>
		);
	}

	return (
		<div className="h-full flex flex-col bg-muted/5 relative overflow-hidden">
			<div className="p-4 border-b border-border/40 bg-background/50 backdrop-blur-sm z-10 flex justify-between items-center">
				<div>
					<h3 className="text-sm font-semibold flex items-center gap-2">
						<Clock className="w-4 h-4 text-primary" />
						Narrative Timeline
					</h3>
					<p className="text-xs text-muted-foreground">
						Drag to reorder chronologically
					</p>
				</div>
			</div>

			<DndContext
				sensors={sensors}
				onDragStart={(e) => setActiveDragId(e.active.id as string)}
				onDragEnd={handleDragEnd}
			>
				<ScrollArea className="flex-1 w-full h-full" orientation="horizontal">
					<div className="min-w-max h-full flex items-center p-10 relative">
						{/* Central Timeline Axis */}
						<div className="absolute left-0 right-0 top-1/2 h-0.5 bg-border z-0" />

						<div className="flex items-center gap-12 px-10 relative z-10">
							<SortableContext items={localEvents.map((e) => e.id)}>
								{localEvents.map((event, i) => (
									<TimelineItem
										key={event.id}
										event={event}
										isSelected={event.id === activeSceneId}
										onClick={() => setActiveSceneId?.(event.id)}
										isEven={i % 2 === 0}
									/>
								))}
							</SortableContext>

							{/* End Flag */}
							<div className="flex flex-col items-center justify-center ml-8 opacity-50">
								<Flag className="w-5 h-5 mb-2" />
								<span className="text-xs font-medium">The End</span>
							</div>
						</div>
					</div>
					<ScrollBar orientation="horizontal" />
				</ScrollArea>

				<DragOverlay>
					{activeDragId ? (
						<div className="w-48 p-3 rounded-lg border bg-card shadow-xl ring-2 ring-primary">
							<div className="font-medium text-sm">Moving Event...</div>
						</div>
					) : null}
				</DragOverlay>
			</DndContext>
		</div>
	);
}
