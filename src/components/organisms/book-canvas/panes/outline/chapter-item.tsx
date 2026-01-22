"use client";

import {
	ChevronRightIcon,
	MoreHorizontalIcon,
	PenIcon,
	TrashIcon,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";

import { Button } from "@/components/atoms/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/atoms/dropdown-menu";
import { Input } from "@/components/atoms/input";
import { Textarea } from "@/components/atoms/textarea";
import { SortableItem } from "@/components/molecules/sortable-list";
import { cn } from "@/lib/utils";

const statusConfig: Record<
	string,
	{ label: string; color: string; bgColor: string }
> = {
	planned: {
		label: "Planned",
		color: "text-muted-foreground",
		bgColor: "bg-muted",
	},
	drafting: {
		label: "Drafting",
		color: "text-blue-600 dark:text-blue-400",
		bgColor: "bg-blue-100 dark:bg-blue-900/30",
	},
	drafted: {
		label: "Drafted",
		color: "text-amber-600 dark:text-amber-400",
		bgColor: "bg-amber-100 dark:bg-amber-900/30",
	},
	review: {
		label: "Review",
		color: "text-purple-600 dark:text-purple-400",
		bgColor: "bg-purple-100 dark:bg-purple-900/30",
	},
	final: {
		label: "Final",
		color: "text-green-600 dark:text-green-400",
		bgColor: "bg-green-100 dark:bg-green-900/30",
	},
};

export interface ChapterItemProps {
	chapter: {
		id: string;
		title: string;
		notes: string | null;
		status: string;
		sequence: number;
	};
	onEdit: (id: string, data: { title: string; notes?: string }) => void;
	onDelete: (id: string) => void;
}

export function ChapterItem({
	chapter,
	onEdit,
	onDelete,
}: ChapterItemProps): React.JSX.Element {
	const [expanded, setExpanded] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [editTitle, setEditTitle] = useState(chapter.title);
	const [editNotes, setEditNotes] = useState(chapter.notes || "");
	const status = statusConfig[chapter.status] || statusConfig.planned;
	const notesId = `chapter-notes-${chapter.id}`;

	const handleSave = () => {
		onEdit(chapter.id, { title: editTitle, notes: editNotes });
		setIsEditing(false);
	};

	const handleCancel = () => {
		setEditTitle(chapter.title);
		setEditNotes(chapter.notes || "");
		setIsEditing(false);
	};

	// Reset local state if prop changes
	useEffect(() => {
		setEditTitle(chapter.title);
		setEditNotes(chapter.notes || "");
	}, [chapter.title, chapter.notes]);

	if (isEditing) {
		return (
			<div className="rounded-lg border bg-card p-3 space-y-3 ring-2 ring-primary/20">
				<Input
					value={editTitle}
					onChange={(e) => setEditTitle(e.target.value)}
					placeholder="Chapter Title"
					className="h-8 text-sm font-medium"
					autoFocus
					aria-label="Chapter title"
				/>
				<Textarea
					value={editNotes}
					onChange={(e) => setEditNotes(e.target.value)}
					placeholder="Chapter notes..."
					className="text-xs min-h-[60px]"
					aria-label="Chapter notes"
				/>
				<div className="flex justify-end gap-2">
					<Button size="sm" variant="ghost" onClick={handleCancel}>
						Cancel
					</Button>
					<Button size="sm" onClick={handleSave}>
						Save
					</Button>
				</div>
			</div>
		);
	}

	return (
		<SortableItem id={chapter.id}>
			<div className="group relative">
				<div
					className={cn(
						"flex w-full items-center gap-2 rounded-lg border bg-card p-2.5 text-left transition-all hover:bg-accent/50 pl-8", // added padding for drag handle
						expanded && "ring-1 ring-primary/20",
					)}
				>
					<button
						type="button"
						onClick={() => setExpanded(!expanded)}
						className="flex items-center gap-2 flex-1 min-w-0"
						aria-expanded={expanded}
						aria-controls={notesId}
					>
						<ChevronRightIcon
							className={cn(
								"h-4 w-4 text-muted-foreground transition-transform shrink-0",
								expanded && "rotate-90",
							)}
						/>
						<span className="font-mono text-xs text-muted-foreground">
							{chapter.sequence}.
						</span>
						<span className="font-medium text-sm truncate">
							{chapter.title}
						</span>
					</button>

					<span
						className={cn(
							"rounded-full px-2 py-0.5 text-xs font-medium shrink-0",
							status.color,
							status.bgColor,
						)}
					>
						{status.label}
					</span>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
								aria-label="Chapter options"
							>
								<MoreHorizontalIcon className="h-3.5 w-3.5" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={() => setIsEditing(true)}>
								<PenIcon className="h-3.5 w-3.5 mr-2" />
								Edit
							</DropdownMenuItem>
							<DropdownMenuItem
								className="text-destructive focus:text-destructive"
								onClick={() => onDelete(chapter.id)}
							>
								<TrashIcon className="h-3.5 w-3.5 mr-2" />
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
				{expanded && chapter.notes && (
					<div
						id={notesId}
						className="ml-8 mt-1 rounded-lg border-l-2 border-muted bg-muted/20 p-3"
					>
						<p className="text-xs text-muted-foreground">{chapter.notes}</p>
					</div>
				)}
			</div>
		</SortableItem>
	);
}
