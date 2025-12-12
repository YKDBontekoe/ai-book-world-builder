"use client";

import {
	BookOpenIcon,
	ChevronRightIcon,
	FileTextIcon,
	PenIcon,
	SparklesIcon,
} from "lucide-react";
import { useState } from "react";
import useSWR from "swr";
import {
	getOutlineData,
	type SerializedOutline,
} from "@/app/actions/project-stats";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { cn } from "@/lib/utils";
import { useBookCanvas } from "../book-canvas-context";

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

function ChapterItem({
	chapter,
}: {
	chapter: {
		id: string;
		title: string;
		notes: string | null;
		status: string;
		sequence: number;
	};
}) {
	const [expanded, setExpanded] = useState(false);
	const status = statusConfig[chapter.status] || statusConfig.planned;

	return (
		<div className="group">
			<button
				className={cn(
					"flex w-full items-center gap-2 rounded-lg border bg-card p-2.5 text-left transition-all hover:bg-accent/50",
					expanded && "ring-1 ring-primary/20",
				)}
				onClick={() => setExpanded(!expanded)}
				type="button"
			>
				<ChevronRightIcon
					className={cn(
						"h-4 w-4 text-muted-foreground transition-transform shrink-0",
						expanded && "rotate-90",
					)}
				/>
				<span className="flex items-center gap-2 flex-1 min-w-0">
					<span className="font-mono text-xs text-muted-foreground">
						{chapter.sequence}.
					</span>
					<span className="font-medium text-sm truncate">{chapter.title}</span>
				</span>
				<span
					className={cn(
						"rounded-full px-2 py-0.5 text-xs font-medium shrink-0",
						status.color,
						status.bgColor,
					)}
				>
					{status.label}
				</span>
			</button>
			{expanded && chapter.notes && (
				<div className="ml-8 mt-1 rounded-lg border-l-2 border-muted bg-muted/20 p-3">
					<p className="text-xs text-muted-foreground">{chapter.notes}</p>
				</div>
			)}
		</div>
	);
}

function OutlineHeader({ outline }: { outline: SerializedOutline }) {
	return (
		<div className="rounded-xl border bg-gradient-to-br from-primary/5 to-transparent p-4">
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
	const { projectId } = useBookCanvas();

	const { data: outline, isLoading } = useSWR(
		projectId ? ["outline", projectId] : null,
		([_, id]) => getOutlineData(id),
		{ refreshInterval: 5000 },
	);

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

	if (isLoading && !outline) {
		return (
			<div className="flex h-full flex-col items-center justify-center p-8">
				<LoadingSpinner size="lg" variant="muted" />
				<p className="mt-2 text-sm text-muted-foreground">Loading outline...</p>
			</div>
		);
	}

	if (!outline) {
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

	// Calculate chapter progress
	const completed = outline.chapters.filter((c) => c.status === "final").length;
	const inProgress = outline.chapters.filter((c) =>
		["drafting", "drafted", "review"].includes(c.status),
	).length;

	return (
		<div className="flex flex-col gap-4 p-4">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h3 className="font-semibold text-lg">Outline</h3>
					<p className="text-muted-foreground text-sm">Your story structure</p>
				</div>
				{isLoading && <LoadingSpinner size="xs" variant="muted" />}
			</div>

			{/* Outline metadata */}
			<OutlineHeader outline={outline} />

			{/* Progress bar */}
			{outline.chapters.length > 0 && (
				<div className="space-y-1.5">
					<div className="flex justify-between text-xs text-muted-foreground">
						<span>Progress</span>
						<span>
							{completed}/{outline.chapters.length} complete
						</span>
					</div>
					<div className="h-2 rounded-full bg-muted overflow-hidden">
						<div className="flex h-full">
							<div
								className="bg-green-500 transition-all"
								style={{
									width: `${(completed / outline.chapters.length) * 100}%`,
								}}
							/>
							<div
								className="bg-blue-500 transition-all"
								style={{
									width: `${(inProgress / outline.chapters.length) * 100}%`,
								}}
							/>
						</div>
					</div>
				</div>
			)}

			{/* Chapter list */}
			<div className="space-y-2">
				<h4 className="font-medium text-sm text-muted-foreground">Chapters</h4>
				{outline.chapters.length > 0 ? (
					<div className="space-y-1.5">
						{outline.chapters.map((chapter) => (
							<ChapterItem key={chapter.id} chapter={chapter} />
						))}
					</div>
				) : (
					<div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
						No chapters added yet. Ask the AI to add chapters to your outline.
					</div>
				)}
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
							{outline.beats.map((beat, i) => (
								<li key={i} className="flex items-start gap-2 text-xs">
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
