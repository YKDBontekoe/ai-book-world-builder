"use client";

import { BookOpenIcon, Loader2, PlusIcon, SparklesIcon } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";
import {
	getScenesData,
	type SerializedChapterWithScenes,
} from "@/app/actions/scene-data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useBookCanvas } from "../book-canvas-context";
import { SceneCard } from "../cards/scene-card";

function ChapterSection({ chapter }: { chapter: SerializedChapterWithScenes }) {
	const [expanded, setExpanded] = useState(true);

	return (
		<div className="space-y-2">
			<button
				className="flex w-full items-center justify-between sticky top-0 z-10 bg-background/95 backdrop-blur-sm p-2 -mx-2 border-b cursor-pointer hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-left"
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
				<div className="space-y-3 pl-2 border-l-2 border-muted ml-1">
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

	const { data: chapters, isLoading } = useSWR(
		projectId ? ["scenes", projectId] : null,
		([_, id]) => getScenesData(id),
		{ refreshInterval: 5000 },
	);

	if (!projectId) {
		return (
			<div className="flex h-full flex-col items-center justify-center p-8 text-center">
				<BookOpenIcon className="h-10 w-10 text-muted-foreground/50 mb-3" />
				<p className="font-medium text-sm">No Project Selected</p>
				<p className="text-xs text-muted-foreground mt-1">
					Select a project to view scene cards
				</p>
			</div>
		);
	}

	if (isLoading && !chapters) {
		return (
			<div className="flex h-full flex-col items-center justify-center p-8">
				<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
				<p className="mt-2 text-sm text-muted-foreground">
					Loading specific details...
				</p>
			</div>
		);
	}

	if (!chapters || chapters.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/10 m-4 p-8 text-center">
				<div className="mb-4 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 p-4">
					<SparklesIcon className="h-6 w-6 text-amber-500" />
				</div>
				<h4 className="font-medium text-sm">No Scenes Found</h4>
				<p className="mt-1 max-w-xs text-xs text-muted-foreground">
					Your story outline hasn't been broken down into scenes yet. Ask the AI
					to "Plan scene cards for Chapter 1".
				</p>
			</div>
		);
	}

	return (
		<div className="p-4 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="font-semibold text-lg">Scene Cards</h3>
					<p className="text-muted-foreground text-sm">Beat-by-beat planning</p>
				</div>
				<Button size="sm" className="h-8 gap-1.5">
					<SparklesIcon className="h-3.5 w-3.5" />
					Auto-Plan
				</Button>
			</div>

			<div className="space-y-6">
				{chapters.map((chapter) => (
					<ChapterSection key={chapter.id} chapter={chapter} />
				))}
			</div>
		</div>
	);
}
