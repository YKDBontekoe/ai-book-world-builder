"use client";

import { useQuery } from "@tanstack/react-query";
import { BookOpenIcon, PlusIcon, SparklesIcon } from "lucide-react";
import { useState } from "react";
import {
	getScenesData,
	type SerializedChapterWithScenes,
} from "@/app/actions/scene-data";
import { Button } from "@/components/atoms/button";
import { LoadingSpinner } from "@/components/atoms/loading-spinner";
import { EmptyState } from "@/components/molecules/empty-state";
import { SectionHeader } from "@/components/molecules/section-header";
import { useBookCanvas } from "@/components/organisms/book-canvas/book-canvas-context";
import { SceneCard } from "@/components/organisms/book-canvas/cards/scene-card";
import { QUERY_KEYS } from "@/lib/query-options";
import { cn } from "@/lib/utils";

function ChapterSection({ chapter }: { chapter: SerializedChapterWithScenes }) {
	const [expanded, setExpanded] = useState(true);

	return (
		<div className="space-y-2">
			<button
				className="flex w-full items-center justify-between sticky top-0 z-10 glass-panel rounded-lg mb-2 p-3 cursor-pointer hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-left"
				onClick={() => setExpanded(!expanded)}
				type="button"
			>
				<h4 className="font-semibold text-sm">
					Chapter {chapter.sequence}: {chapter.title}
				</h4>
				<div className="flex items-center gap-2">
					<span className="text-xs text-muted-foreground">
						{chapter.scenes.length} scenes
					</span>
					<div
						className={cn(
							"transition-transform duration-200",
							expanded ? "rotate-90" : "",
						)}
					>
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<polyline points="9 18 15 12 9 6" />
						</svg>
					</div>
				</div>
			</button>

			{expanded && (
				<div className="space-y-3 px-1">
					{chapter.scenes.length > 0 ? (
						chapter.scenes.map((scene) => (
							<SceneCard
								key={scene.id}
								card={scene.card}
								title={scene.title}
								sequence={scene.sequence}
							/>
						))
					) : (
						<div className="flex flex-col items-center justify-center p-6 border border-dashed rounded-lg bg-muted/20 text-center">
							<p className="text-sm text-muted-foreground mb-2">
								No scenes planned yet
							</p>
							<Button variant="outline" size="sm" className="h-8 gap-1">
								<PlusIcon className="h-3.5 w-3.5" />
								Add Scene
							</Button>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

export function ScenePane() {
	const { projectId } = useBookCanvas();

	const { data: chaptersResult, isLoading } = useQuery({
		queryKey: projectId ? QUERY_KEYS.scenes(projectId) : ["scenes", "null"],
		queryFn: () => (projectId ? getScenesData({ projectId }) : null),
		enabled: !!projectId,
		refetchInterval: 5000,
	});

	const chapters =
		chaptersResult?.success && chaptersResult.data ? chaptersResult.data : [];

	if (!projectId) {
		return (
			<EmptyState
				icon={BookOpenIcon}
				title="No Project Selected"
				description="Select a project to view scene cards"
				className="h-full m-4"
			/>
		);
	}

	if (isLoading && !chapters) {
		return (
			<div className="flex h-full flex-col items-center justify-center p-8">
				<LoadingSpinner size="lg" variant="muted" />
				<p className="mt-2 text-sm text-muted-foreground">
					Loading specific details...
				</p>
			</div>
		);
	}

	if (!chapters || chapters.length === 0) {
		return (
			<EmptyState
				icon={SparklesIcon}
				iconClassName="text-amber-500"
				title="No Scenes Found"
				description="Your story outline hasn't been broken down into scenes yet. Ask the AI to 'Plan scene cards for Chapter 1'."
				className="m-4"
				suggestions={["Plan scene cards for Chapter 1"]}
			/>
		);
	}

	return (
		<div className="p-4 space-y-6">
			<SectionHeader
				title="Scene Cards"
				description="Beat-by-beat planning"
				action={
					<Button size="sm" className="h-8 gap-1.5">
						<SparklesIcon className="h-3.5 w-3.5" />
						Auto-Plan
					</Button>
				}
			/>

			<div className="space-y-6">
				{chapters.map((chapter) => (
					<ChapterSection key={chapter.id} chapter={chapter} />
				))}
			</div>
		</div>
	);
}
