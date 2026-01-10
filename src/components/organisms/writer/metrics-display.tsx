"use client";

import { BookOpen, TrendingUp } from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/atoms/tooltip";
import { cn } from "@/lib/utils";

type MetricsVariant = "compact" | "tooltip";

interface MetricsDisplayProps {
	wordCount: number;
	pacingScore: number;
	readingTimeMinutes: number;
	variant: MetricsVariant;
}

export function MetricsDisplay({
	wordCount,
	pacingScore,
	readingTimeMinutes,
	variant,
}: MetricsDisplayProps): JSX.Element | null {
	if (wordCount <= 0) {
		return null;
	}

	const pacingClasses =
		pacingScore > 70
			? "bg-orange-500/10 text-orange-500"
			: pacingScore < 30
				? "bg-blue-500/10 text-blue-500"
				: "bg-green-500/10 text-green-500";

	if (variant === "compact") {
		return (
			<>
				<div className="flex items-center justify-between rounded-md bg-accent/30 px-2 py-1">
					<span className="flex items-center gap-2">
						<BookOpen className="h-3 w-3" />
						Word Count
					</span>
					<span className="font-mono">{wordCount.toLocaleString()}</span>
				</div>
				<div
					className={cn(
						"flex items-center justify-between rounded-md px-2 py-1 font-medium",
						pacingClasses,
					)}
				>
					<span className="flex items-center gap-2">
						<TrendingUp className="h-3 w-3" />
						Pacing
					</span>
					{Math.round(pacingScore)}
				</div>
			</>
		);
	}

	return (
		<>
			<Tooltip>
				<TooltipTrigger asChild>
					<div className="flex items-center gap-1.5 rounded-md bg-accent/30 px-2 py-1 text-xs transition-colors hover:bg-accent/50 cursor-default">
						<BookOpen className="h-3 w-3" />
						<span className="font-mono">{wordCount.toLocaleString()}</span>
					</div>
				</TooltipTrigger>
				<TooltipContent>
					Word Count • {readingTimeMinutes} min read
				</TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger asChild>
					<div
						className={cn(
							"flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium cursor-default",
							pacingClasses,
						)}
					>
						<TrendingUp className="h-3 w-3" />
						{Math.round(pacingScore)}
					</div>
				</TooltipTrigger>
				<TooltipContent>
					Pacing Score:{" "}
					{pacingScore > 70
						? "Fast/Action"
						: pacingScore < 30
							? "Slow/Descriptive"
							: "Balanced"}
				</TooltipContent>
			</Tooltip>
		</>
	);
}
