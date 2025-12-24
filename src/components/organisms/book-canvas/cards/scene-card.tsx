"use client";

import {
	ChevronDownIcon,
	ChevronRightIcon,
	HeartIcon,
	LightbulbIcon,
	LockIcon,
	MapPinIcon,
	PencilIcon,
	SparklesIcon,
	TargetIcon,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/button";
import type { SceneCard as SceneCardType } from "@/lib/db/schema";

interface SceneCardProps {
	card: SceneCardType | null;
	title: string;
	sequence: number;
}

export function SceneCard({ card, title, sequence }: SceneCardProps) {
	const [expanded, setExpanded] = useState(false);

	// If no card data exists, show a placeholder or minimal view
	if (!card) {
		return (
			<div className="group rounded-lg border bg-card p-3 shadow-sm transition-all hover:bg-accent/5">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-mono text-muted-foreground">
							{sequence}
						</span>
						<span className="font-medium text-sm">{title}</span>
					</div>
					<Button
						variant="ghost"
						size="icon"
						className="h-6 w-6 opacity-0 group-hover:opacity-100"
						title="Generate Details"
					>
						<SparklesIcon className="h-3.5 w-3.5" />
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="rounded-lg border bg-card shadow-sm transition-all hover:shadow-md">
			{/* Header */}
			<button
				type="button"
				className="flex w-full cursor-pointer items-center justify-between p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-t-lg text-left"
				onClick={() => setExpanded(!expanded)}
			>
				<div className="flex items-center gap-2">
					<span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-mono text-primary font-medium">
						{sequence}
					</span>
					<div>
						<h4 className="font-medium text-sm leading-none">{title}</h4>
						<p className="mt-1 text-xs text-muted-foreground line-clamp-1">
							{card.purpose}
						</p>
					</div>
				</div>
				<div className="h-6 w-6 flex items-center justify-center text-muted-foreground">
					{expanded ? (
						<ChevronDownIcon className="h-4 w-4" />
					) : (
						<ChevronRightIcon className="h-4 w-4" />
					)}
				</div>
			</button>

			{/* Expanded Content */}
			{expanded && (
				<div className="border-t bg-muted/10 p-3 space-y-4 animate-in slide-in-from-top-1 duration-200">
					{/* Purpose */}
					<div className="space-y-1">
						<h5 className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
							<TargetIcon className="h-3.5 w-3.5" />
							Purpose
						</h5>
						<p className="text-sm">{card.purpose}</p>
					</div>

					{/* Setting & Atmosphere */}
					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-1">
							<h5 className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
								<MapPinIcon className="h-3.5 w-3.5" />
								Setting
							</h5>
							<p className="text-sm">{card.setting || "Not specified"}</p>
						</div>
						<div className="space-y-1">
							<h5 className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
								<LightbulbIcon className="h-3.5 w-3.5" />
								Atmosphere
							</h5>
							<p className="text-sm">{card.atmosphere || "Not specified"}</p>
						</div>
					</div>

					{/* Emotional Beats */}
					{card.emotionalBeats && card.emotionalBeats.length > 0 && (
						<div className="space-y-1">
							<h5 className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
								<HeartIcon className="h-3.5 w-3.5" />
								Emotional Beats
							</h5>
							<ul className="space-y-1">
								{card.emotionalBeats.map((beat, i) => (
									<li
										key={`${i}-${beat.substring(0, 10)}`}
										className="flex items-start gap-2 text-sm"
									>
										<span className="mt-1.5 h-1 w-1 rounded-full bg-primary shrink-0" />
										<span>{beat}</span>
									</li>
								))}
							</ul>
						</div>
					)}

					{/* Character Goals */}
					{card.characterGoals &&
						Object.keys(card.characterGoals).length > 0 && (
							<div className="space-y-1">
								<h5 className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
									<TargetIcon className="h-3.5 w-3.5" />
									Character Goals
								</h5>
								<div className="grid gap-2">
									{Object.entries(card.characterGoals).map(([char, goal]) => (
										<div
											key={char}
											className="rounded border bg-background/50 p-2 text-sm"
										>
											<span className="font-semibold text-primary">
												{char}:
											</span>{" "}
											{goal}
										</div>
									))}
								</div>
							</div>
						)}

					{/* Constraints & Reveal */}
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						{card.constraints && card.constraints.length > 0 && (
							<div className="space-y-1">
								<h5 className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
									<LockIcon className="h-3.5 w-3.5" />
									Constraints
								</h5>
								<ul className="list-disc list-inside text-sm text-muted-foreground">
									{card.constraints.map((c, i) => (
										<li key={`${i}-${c.substring(0, 10)}`}>{c}</li>
									))}
								</ul>
							</div>
						)}
						{card.plannedReveal && (
							<div className="space-y-1">
								<h5 className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
									<SparklesIcon className="h-3.5 w-3.5" />
									Key Reveal
								</h5>
								<p className="text-sm text-amber-600 dark:text-amber-400">
									{card.plannedReveal}
								</p>
							</div>
						)}
					</div>

					{/* Footer Actions */}
					<div className="flex justify-end pt-2">
						<Button variant="outline" size="sm" className="h-7 text-xs gap-1">
							<PencilIcon className="h-3 w-3" />
							Edit Details
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
