"use client";

import { BookOpenIcon, PenIcon, PlusIcon, SparklesIcon } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { LoadingSpinner } from "@/components/atoms/loading-spinner";
import { EmptyState } from "@/components/molecules/empty-state";
import { SectionHeader } from "@/components/molecules/section-header";
import { SortableList } from "@/components/molecules/sortable-list";
import { useBookCanvasLayout } from "@/components/organisms/book-canvas/book-canvas-context";
import { ChapterItem } from "@/components/organisms/book-canvas/panes/outline/chapter-item";
import { OutlineHeader } from "@/components/organisms/book-canvas/panes/outline/outline-header";
import { useOutline } from "@/components/organisms/book-canvas/panes/outline/use-outline";

export function OutlinePane() {
	const { projectId } = useBookCanvasLayout();

	const {
		outlineResult,
		isLoading,
		chapters: displayChapters,
		handleReorder,
		handleAddChapter,
		updateMutation,
		deleteMutation,
		createMutation,
		reorderMutation,
	} = useOutline(projectId);

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
