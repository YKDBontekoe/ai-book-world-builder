import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SortableItemProps {
	id: string;
	children: ReactNode;
	className?: string;
	disabled?: boolean;
}

export function SortableItem({
	id,
	children,
	className,
	disabled = false,
}: SortableItemProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id, disabled });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={cn(
				"relative group/sortable",
				isDragging && "z-50 opacity-50",
				className,
			)}
		>
			{!disabled && (
				<button
					type="button"
					className={cn(
						"absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full",
						"opacity-0 group-hover/sortable:opacity-100 transition-opacity",
						"p-1 hover:bg-white/10 rounded cursor-grab active:cursor-grabbing",
						"text-muted-foreground hover:text-foreground",
					)}
					{...attributes}
					{...listeners}
					aria-label="Drag to reorder"
				>
					<GripVertical className="h-4 w-4" />
				</button>
			)}
			{children}
		</div>
	);
}

interface SortableListProps<T extends { id: string }> {
	items: T[];
	onReorder: (items: T[]) => void;
	children: (item: T) => ReactNode;
	disabled?: boolean;
}

export function SortableList<T extends { id: string }>({
	items,
	onReorder,
	children,
	disabled = false,
}: SortableListProps<T>) {
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8, // Require 8px movement before drag starts
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			const oldIndex = items.findIndex((item) => item.id === active.id);
			const newIndex = items.findIndex((item) => item.id === over.id);

			if (oldIndex !== -1 && newIndex !== -1) {
				const newItems = arrayMove(items, oldIndex, newIndex);
				onReorder(newItems);
			}
		}
	};

	if (disabled) {
		return <>{items.map((item) => children(item))}</>;
	}

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragEnd={handleDragEnd}
		>
			<SortableContext items={items} strategy={verticalListSortingStrategy}>
				{items.map((item) => children(item))}
			</SortableContext>
		</DndContext>
	);
}
