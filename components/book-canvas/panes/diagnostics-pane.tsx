"use client";

import { useQuery } from "@tanstack/react-query";
import {
	AlertTriangleIcon,
	BookIcon,
	CheckCircleIcon,
	GlobeIcon,
	InfoIcon,
	Loader2,
	Sparkles,
	SparklesIcon,
	TrendingUpIcon,
	UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { getProjectStats } from "@/app/actions/project-stats";
import { Button } from "@/components/ui/button";
import { QUERY_KEYS } from "@/lib/query-options";
import { cn } from "@/lib/utils";
import { useBookCanvas } from "../book-canvas-context";

function ScoreRing({
	score,
	label,
	icon: Icon,
	color,
}: {
	score: number;
	label: string;
	icon: React.ElementType;
	color: string;
}) {
	const getScoreClass = (s: number) => {
		if (s >= 70) return "text-green-600 dark:text-green-400";
		if (s >= 40) return "text-amber-600 dark:text-amber-400";
		return "text-muted-foreground";
	};

	const getStrokeColor = (s: number) => {
		if (s >= 70) return "stroke-green-500";
		if (s >= 40) return "stroke-amber-500";
		return "stroke-muted-foreground/30";
	};

	return (
		<div className="flex flex-col items-center gap-1.5">
			<div className="relative flex h-16 w-16 items-center justify-center">
				<svg className="-rotate-90 h-full w-full" viewBox="0 0 36 36">
					<path
						className="stroke-muted/30"
						d="M18 2.5 a 15.5 15.5 0 1 1 0 31 a 15.5 15.5 0 1 1 0 -31"
						fill="none"
						strokeWidth="3"
					/>
					<path
						className={cn("transition-all duration-500", getStrokeColor(score))}
						d="M18 2.5 a 15.5 15.5 0 1 1 0 31 a 15.5 15.5 0 1 1 0 -31"
						fill="none"
						strokeDasharray={`${score}, 100`}
						strokeLinecap="round"
						strokeWidth="3"
					/>
				</svg>
				<div className="absolute flex flex-col items-center">
					<Icon className={cn("h-4 w-4 mb-0.5", color)} />
					<span className={cn("font-bold text-sm", getScoreClass(score))}>
						{score}
					</span>
				</div>
			</div>
			<span className="text-muted-foreground text-xs font-medium">{label}</span>
		</div>
	);
}

function FeedbackItem({
	label,
	score,
	feedback,
}: {
	label: string;
	score: number;
	feedback: string;
}) {
	return (
		<div className="flex items-start gap-2 rounded-lg border bg-background p-3">
			<div
				className={cn(
					"mt-0.5 h-2 w-2 rounded-full",
					score >= 60
						? "bg-green-500"
						: score >= 30
							? "bg-amber-500"
							: "bg-muted-foreground/30",
				)}
			/>
			<div className="flex-1">
				<div className="flex items-center justify-between">
					<span className="font-medium text-sm">{label}</span>
					<span className="text-muted-foreground text-xs">{score}%</span>
				</div>
				<p className="text-muted-foreground text-xs">{feedback}</p>
			</div>
		</div>
	);
}

export function DiagnosticsPane() {
	const { projectId, triggerChatAction } = useBookCanvas();

	const { data: stats, isLoading } = useQuery({
		queryKey: projectId
			? QUERY_KEYS.diagnostics(projectId)
			: ["diagnostics", "null"],
		queryFn: () => (projectId ? getProjectStats(projectId) : Promise.resolve(null)),
		enabled: !!projectId,
		refetchInterval: 5000,
	});

	if (!projectId) {
		return (
			<div className="flex h-full flex-col items-center justify-center p-8 text-center">
				<TrendingUpIcon className="h-10 w-10 text-muted-foreground/50 mb-3" />
				<p className="font-medium text-sm">No Project Selected</p>
				<p className="text-xs text-muted-foreground mt-1">
					Select a project to view readiness metrics
				</p>
			</div>
		);
	}

	if (isLoading && !stats) {
		return (
			<div className="flex h-full flex-col items-center justify-center p-8">
				<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
				<p className="mt-2 text-sm text-muted-foreground">
					Loading readiness...
				</p>
			</div>
		);
	}

	const readiness = stats?.readiness ?? {
		characters: { score: 0, feedback: "Add characters to get started" },
		worldBuilding: { score: 0, feedback: "Create locations and items" },
		plotStructure: { score: 0, feedback: "Create an outline" },
		overall: 0,
	};

	const overallScore = readiness.overall;
	const hasWarnings = overallScore < 40;
	const hasContent = overallScore > 0;

	return (
		<div className="flex flex-col gap-4 p-4">
			{/* Header */}
			<div className="flex items-center gap-2">
				<h3 className="font-semibold text-lg">Readiness</h3>
				<span
					className={cn(
						"rounded-full px-2 py-0.5 text-xs font-medium transition-colors",
						overallScore >= 60
							? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
							: overallScore >= 30
								? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
								: "bg-muted text-muted-foreground",
					)}
				>
					{overallScore}% Ready
				</span>
				{isLoading && (
					<Loader2 className="h-3 w-3 animate-spin text-muted-foreground ml-auto" />
				)}
			</div>

			{/* Score Rings */}
			<div className="flex justify-around rounded-xl border bg-gradient-to-b from-muted/20 to-muted/5 p-4">
				<ScoreRing
					color="text-purple-500"
					icon={UsersIcon}
					label="Characters"
					score={readiness.characters.score}
				/>
				<ScoreRing
					color="text-emerald-500"
					icon={GlobeIcon}
					label="World"
					score={readiness.worldBuilding.score}
				/>
				<ScoreRing
					color="text-blue-500"
					icon={BookIcon}
					label="Plot"
					score={readiness.plotStructure.score}
				/>
			</div>

			{/* Project Stats */}
			{stats && (
				<div className="grid grid-cols-3 gap-2 text-center">
					<div className="rounded-lg border bg-muted/20 p-2">
						<div className="font-bold text-lg">{stats.entityCounts.total}</div>
						<div className="text-muted-foreground text-xs">Entities</div>
					</div>
					<div className="rounded-lg border bg-muted/20 p-2">
						<div className="font-bold text-lg">{stats.relationshipCount}</div>
						<div className="text-muted-foreground text-xs">Connections</div>
					</div>
					<div className="rounded-lg border bg-muted/20 p-2">
						<div className="font-bold text-lg">{stats.chapterCounts.total}</div>
						<div className="text-muted-foreground text-xs">Chapters</div>
					</div>
				</div>
			)}

			{/* Feedback Items */}
			<div className="space-y-2">
				<FeedbackItem
					feedback={readiness.characters.feedback}
					label="Characters"
					score={readiness.characters.score}
				/>
				<FeedbackItem
					feedback={readiness.worldBuilding.feedback}
					label="World Building"
					score={readiness.worldBuilding.score}
				/>
				<FeedbackItem
					feedback={readiness.plotStructure.feedback}
					label="Plot Structure"
					score={readiness.plotStructure.score}
				/>
			</div>

			{/* Info/Warning Box */}
			{hasContent ? (
				hasWarnings ? (
					<div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
						<AlertTriangleIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
						<div>
							<p className="font-medium text-amber-900 text-sm dark:text-amber-100">
								Low Readiness
							</p>
							<p className="text-amber-700 text-xs dark:text-amber-300">
								You can still write, but adding more content will improve
								quality.
							</p>
						</div>
					</div>
				) : (
					<div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950/30">
						<CheckCircleIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
						<div>
							<p className="font-medium text-green-900 text-sm dark:text-green-100">
								Good to Write!
							</p>
							<p className="text-green-700 text-xs dark:text-green-300">
								Your world is well-prepared for chapter generation.
							</p>
						</div>
					</div>
				)
			) : (
				<div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/30">
					<SparklesIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
					<div>
						<p className="font-medium text-blue-900 text-sm dark:text-blue-100">
							Getting Started
						</p>
						<p className="text-blue-700 text-xs dark:text-blue-300">
							Start chatting to build your story. Ask me to create characters,
							locations, or dive right into writing!
						</p>
					</div>
				</div>
			)}

			{/* CTA */}
			<div className="flex flex-col gap-2">
				{/* Primary: Direct link to generation page */}
				<Button asChild className="w-full gap-2" size="lg">
					<Link href={`/projects/${projectId}/generate`}>
						<Sparkles className="h-4 w-4" />
						Open Book Generator
					</Link>
				</Button>

				<div className="flex gap-2">
					<Button
						className="flex-1"
						size="sm"
						variant="outline"
						onClick={() =>
							triggerChatAction({
								type: "send_message",
								payload: "Start writing the book based on the current plan.",
							})
						}
					>
						<SparklesIcon className="mr-1.5 h-3.5 w-3.5" />
						Quick Start via Chat
					</Button>

					<Button
						className="flex-1"
						size="sm"
						variant="outline"
						onClick={() =>
							triggerChatAction({
								type: "send_message",
								payload: "Assess the project readiness.",
							})
						}
					>
						<InfoIcon className="mr-1.5 h-3.5 w-3.5" />
						Assess Readiness
					</Button>
				</div>

				{overallScore < 60 && (
					<p className="text-center text-muted-foreground text-xs">
						You can always proceed — these are just suggestions!
					</p>
				)}
			</div>
		</div>
	);
}
