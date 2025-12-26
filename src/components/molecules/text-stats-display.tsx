"use client";

import { BookOpen, Clock, FileText } from "lucide-react";
import { useMemo } from "react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/atoms/tooltip";
import { getTextStats } from "@/lib/utils/text-stats";
import { cn } from "@/lib/utils";

interface TextStatsDisplayProps {
	content: string;
	className?: string;
	variant?: "compact" | "detailed";
}

export function TextStatsDisplay({
	content,
	className,
	variant = "compact",
}: TextStatsDisplayProps) {
	const stats = useMemo(() => getTextStats(content), [content]);

	if (variant === "compact") {
		return (
			<TooltipProvider>
				<div
					className={cn(
						"flex items-center gap-3 text-xs text-muted-foreground",
						className,
					)}
				>
					<Tooltip>
						<TooltipTrigger asChild>
							<div className="flex items-center gap-1">
								<FileText className="h-3 w-3" />
								<span>{stats.words.toLocaleString()}</span>
			</div>
						</TooltipTrigger>
						<TooltipContent>
							<p>Word count</p>
						</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<div className="flex items-center gap-1">
								<Clock className="h-3 w-3" />
								<span>{stats.readingTimeFormatted}</span>
							</div>
						</TooltipTrigger>
						<TooltipContent>
							<p>Estimated reading time</p>
						</TooltipContent>
					</Tooltip>
				</div>
			</TooltipProvider>
		);
	}

	return (
		<div className={cn("space-y-2", className)}>
			<div className="grid grid-cols-2 gap-4">
				<div className="flex items-center gap-2">
					<FileText className="h-4 w-4 text-muted-foreground" />
					<div>
						<div className="text-sm font-medium">
							{stats.words.toLocaleString()}
						</div>
						<div className="text-xs text-muted-foreground">Words</div>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<Clock className="h-4 w-4 text-muted-foreground" />
					<div>
						<div className="text-sm font-medium">
							{stats.readingTimeFormatted}
						</div>
						<div className="text-xs text-muted-foreground">Reading time</div>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<BookOpen className="h-4 w-4 text-muted-foreground" />
					<div>
						<div className="text-sm font-medium">{stats.paragraphs}</div>
						<div className="text-xs text-muted-foreground">Paragraphs</div>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<div className="h-4 w-4 flex items-center justify-center text-muted-foreground font-mono text-xs">
						Ch
					</div>
					<div>
						<div className="text-sm font-medium">
							{stats.characters.toLocaleString()}
						</div>
						<div className="text-xs text-muted-foreground">Characters</div>
					</div>
				</div>
			</div>
		</div>
	);
}
