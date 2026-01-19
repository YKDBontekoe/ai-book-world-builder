"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	BookOpenIcon,
	ChevronRightIcon,
	FileTextIcon,
	MoreHorizontalIcon,
	PenIcon,
	PlusIcon,
	SparklesIcon,
	TrashIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import {
	createChapterAction,
	deleteChapterAction,
	reorderChaptersAction,
	updateChapterAction,
} from "@/app/actions/chapter-ops";
import {
	getOutlineData,
	type SerializedOutline,
} from "@/app/actions/project-stats";
import { Button } from "@/components/atoms/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/atoms/dropdown-menu";
import { Input } from "@/components/atoms/input";
import { LoadingSpinner } from "@/components/atoms/loading-spinner";
import { Textarea } from "@/components/atoms/textarea";
import { EmptyState } from "@/components/molecules/empty-state";
import { SectionHeader } from "@/components/molecules/section-header";
import {
	SortableItem,
	SortableList,
} from "@/components/molecules/sortable-list";
import { useBookCanvasLayout } from "@/components/organisms/book-canvas/book-canvas-context";
import { QUERY_KEYS } from "@/lib/query-options";
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

interface ChapterItemProps {
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

function ChapterItem({ chapter, onEdit, onDelete }: ChapterItemProps) {
	const [expanded, setExpanded] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [editTitle, setEditTitle] = useState(chapter.title);
	const [editNotes, setEditNotes] = useState(chapter.notes || "");
	const status = statusConfig[chapter.status] || statusConfig.planned;

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
				/>
				<Textarea
					value={editNotes}
					onChange={(e) => setEditNotes(e.target.value)}
					placeholder="Chapter notes..."
					className="text-xs min-h-[60px]"
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
					<div className="ml-8 mt-1 rounded-lg border-l-2 border-muted bg-muted/20 p-3">
						<p className="text-xs text-muted-foreground">{chapter.notes}</p>
					</div>
				)}
			</div>
		</SortableItem>
	);
}

function OutlineHeader({ outline }: { outline: SerializedOutline }) {
	return (
		<div className="rounded-xl border glass-panel p-4">
			<div className="flex items-start justify-between gap-3">
				<div className="flex-1 min-w-0">
					<h4 className="font-semibold text-base truncate">{outline.title}</h4>
					{outline.summary && (
						<p className="mt-1 text-xs text-muted-foreground line-clamp-2">
							{outline.summary}
						</p>
					)}
				</div>
				<div className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary shrink-0">
					<FileTextIcon className="h-3 w-3" />
					{outline.chapters.length} chapters
				</div>
			</div>
			<div className="mt-3 flex flex-wrap gap-2">
				<span className="rounded-full border bg-background px-2 py-0.5 text-xs text-muted-foreground">
					POV: {outline.pov}
				</span>
				<span className="rounded-full border bg-background px-2 py-0.5 text-xs text-muted-foreground">
					Tone: {outline.tone}
				</span>
				<span className="rounded-full border bg-background px-2 py-0.5 text-xs text-muted-foreground">
					Pacing: {outline.pacing}
				</span>
			</div>
		</div>
	);
}

export function OutlinePane() {
	const { projectId } = useBookCanvasLayout();
	const queryClient = useQueryClient();

	const { data: outlineResult, isLoading } = useQuery({
		queryKey: projectId ? QUERY_KEYS.outline(projectId) : ["outline", "null"],
		queryFn: async () => {
			if (!projectId) return null;
			return getOutlineData({ projectId });
		},
		enabled: !!projectId,
	});

	// Mutations
	const reorderMutation = useMutation({
		mutationFn: reorderChaptersAction,
		onError: () => {
			toast.error("Failed to reorder chapters");
			// The onSettled invalidation will handle reverting optimistic UI
		},
		onSettled: (_data, _error, variables) => {
			if (variables) {
				queryClient.invalidateQueries({
					queryKey: QUERY_KEYS.outline(variables.projectId),
				});
			}
		},
	});

	const updateMutation = useMutation({
		mutationFn: updateChapterAction,
		onSuccess: () => {
			toast.success("Chapter updated");
		},
		onError: () => toast.error("Failed to update chapter"),
		onSettled: (_data, _error, variables) => {
			if (variables) {
				queryClient.invalidateQueries({
					queryKey: QUERY_KEYS.outline(variables.projectId),
				});
			}
		},
	});

	const deleteMutation = useMutation({
		mutationFn: deleteChapterAction,
		onSuccess: () => {
			toast.success("Chapter deleted");
		},
		onError: () => toast.error("Failed to delete chapter"),
		onSettled: (_data, _error, variables) => {
			if (variables) {
				queryClient.invalidateQueries({
					queryKey: QUERY_KEYS.outline(variables.projectId),
				});
			}
		},
	});

	const createMutation = useMutation({
		mutationFn: createChapterAction,
		onSuccess: () => {
			toast.success("Chapter added");
		},
		onError: () => toast.error("Failed to add chapter"),
		onSettled: (_data, _error, variables) => {
			if (variables) {
				queryClient.invalidateQueries({
					queryKey: QUERY_KEYS.outline(variables.projectId),
				});
			}
		},
	});

	// Local state for optimistic reordering
	const [chapters, setChapters] = useState<
		SerializedOutline["chapters"] | null
	>(null);

	useEffect(() => {
		if (outlineResult?.success && outlineResult.data?.chapters) {
			setChapters(outlineResult.data.chapters);
		}
	}, [outlineResult]);

	const handleReorder = useCallback(
		(newItems: typeof chapters) => {
			if (!newItems || !projectId) return;

			// Optimistic update
			setChapters(newItems);

			// Call API
			const updates = newItems.map((item, index) => ({
				id: item.id,
				sequence: index + 1,
			}));

			reorderMutation.mutate({
				projectId,
				updates,
			});
		},
		[projectId, reorderMutation],
	);

	const handleAddChapter = () => {
		if (!projectId) return;
		createMutation.mutate({
			projectId,
			title: `Chapter ${chapters ? chapters.length + 1 : 1}`,
		});
	};

	if (!projectId) {
		return (
			<EmptyState
				icon={BookOpenIcon}
				title="No Project Selected"
				description="Select a project to view the story outline"
				className="h-full m-4"
			/>
		);
	}

	if (isLoading && !outlineResult) {
		return (
			<div className="flex h-full flex-col items-center justify-center p-8">
				<LoadingSpinner size="lg" variant="muted" />
				<p className="mt-2 text-sm text-muted-foreground">Loading outline...</p>
			</div>
		);
	}

	if (!outlineResult || !outlineResult.success || !outlineResult.data) {
		return (
			<EmptyState
				icon={PenIcon}
				iconClassName="text-blue-500"
				title="No Outline Yet"
				description="Ask the AI to create an outline for your story. Describe your plot, genre, and key characters."
				className="m-4"
				suggestions={["Create a fantasy outline", "Plan a 12-chapter thriller"]}
			/>
		);
	}

	const outline = outlineResult.data;
	// Use local state if available (for reordering), else fallback to query data
	const displayChapters = chapters || outline.chapters;

	// Calculate chapter progress
	const completed = displayChapters.filter(
		(c: { status: string }) => c.status === "final",
	).length;
	const inProgress = displayChapters.filter((c: { status: string }) =>
		["drafting", "drafted", "review"].includes(c.status),
	).length;

	return (
		<div className="flex flex-col gap-4 p-4 pb-20">
			{/* Header */}
			<SectionHeader
				title="Outline"
				description="Your story structure"
				action={
					(reorderMutation.isPending || isLoading) && (
						<LoadingSpinner size="sm" variant="muted" />
					)
				}
			/>

			{/* Outline metadata */}
			<OutlineHeader outline={outline} />

			{/* Progress bar */}
			{displayChapters.length > 0 && (
				<div className="space-y-1.5">
					<div className="flex justify-between text-xs text-muted-foreground">
						<span>Progress</span>
						<span>
							{completed}/{displayChapters.length} complete
						</span>
					</div>
					<div className="h-2 rounded-full bg-muted overflow-hidden">
						<div className="flex h-full">
							<div
								className="bg-green-500 transition-all"
								style={{
									width: `${(completed / displayChapters.length) * 100}%`,
								}}
							/>
							<div
								className="bg-blue-500 transition-all"
								style={{
									width: `${(inProgress / displayChapters.length) * 100}%`,
								}}
							/>
						</div>
					</div>
				</div>
			)}

			{/* Chapter list */}
			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<h4 className="font-medium text-sm text-muted-foreground">
						Chapters
					</h4>
					<Button
						size="sm"
						variant="ghost"
						onClick={handleAddChapter}
						disabled={createMutation.isPending}
					>
						<PlusIcon className="h-3.5 w-3.5 mr-1" />
						Add
					</Button>
				</div>

				{displayChapters.length > 0 ? (
					<SortableList
						items={displayChapters}
						onReorder={handleReorder}
						disabled={reorderMutation.isPending}
					>
						{(chapter) => (
							<ChapterItem
								key={chapter.id}
								chapter={chapter}
								onEdit={(id, data) =>
									updateMutation.mutate({ projectId, chapterId: id, data })
								}
								onDelete={(id) =>
									deleteMutation.mutate({ projectId, chapterId: id })
								}
							/>
						)}
					</SortableList>
				) : (
					<div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
						No chapters added yet. Ask the AI to add chapters or click Add
						above.
					</div>
				)}

				<Button
					variant="outline"
					className="w-full border-dashed"
					onClick={handleAddChapter}
					disabled={createMutation.isPending}
				>
					<PlusIcon className="h-4 w-4 mr-2" />
					Add Chapter
				</Button>
			</div>

			{/* Story beats */}
			{outline.beats && outline.beats.length > 0 && (
				<div className="space-y-2">
					<h4 className="font-medium text-sm text-muted-foreground flex items-center gap-1.5">
						<SparklesIcon className="h-3.5 w-3.5" />
						Story Beats
					</h4>
					<div className="rounded-lg border bg-muted/20 p-3">
						<ul className="space-y-1.5">
							{outline.beats.map((beat: string, i: number) => (
								<li
									key={`${i}-${beat.substring(0, 20)}`}
									className="flex items-start gap-2 text-xs"
								>
									<span className="font-mono text-muted-foreground">
										{i + 1}.
									</span>
									<span>{beat}</span>
								</li>
							))}
						</ul>
					</div>
				</div>
			)}
		</div>
	);
}
