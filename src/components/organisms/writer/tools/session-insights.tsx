"use client";


import {
	BarChart3,
	Clock,
	Target,
	TrendingUp,
	X,
	Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/atoms/popover";
import { GlassCard } from "@/components/molecules/glass-card";
import { useWriterContext } from "@/components/organisms/writer/writer-context";
import { useNarrativeIntelligence } from "@/hooks/use-narrative-intelligence";
import { useProjectEntities } from "@/hooks/use-project-entities";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "usehooks-ts";

interface SessionStats {
	startTime: number;
	wordCountStart: number;
	wordCountCurrent: number;
	editsCount: number;
	timeSpent: number; // in minutes
}

export function SessionInsights() {
	const { project, sceneContent } = useWriterContext();
	const { data: entities } = useProjectEntities(project.id);
	const [isOpen, setIsOpen] = useState(false);
	const [sessionStats, setSessionStats] = useLocalStorage<SessionStats>(
		`session-stats-${project.id}`,
		{
			startTime: Date.now(),
			wordCountStart: 0,
			wordCountCurrent: 0,
			editsCount: 0,
			timeSpent: 0,
		},
	);

	const narrativeMetrics = useNarrativeIntelligence({
		content: sceneContent || "",
		entities: entities || [],
	});

	const lastWordCountRef = useRef(sessionStats.wordCountCurrent);

	// Update session stats
	useEffect(() => {
		if (!sceneContent) return;

		const currentWordCount = narrativeMetrics.wordCount;
		
		// Only update if the word count has actually changed from our last record
		// This prevents infinite loops where state updates trigger the effect again
		if (currentWordCount !== lastWordCountRef.current) {
			lastWordCountRef.current = currentWordCount;
			
			setSessionStats((prev) => ({
				...prev,
				wordCountCurrent: currentWordCount,
				editsCount: prev.editsCount + 1,
			}));
		}
	}, [sceneContent, narrativeMetrics.wordCount, setSessionStats]);

	// Calculate time spent
	const timeSpent = Math.floor(
		(Date.now() - sessionStats.startTime) / 1000 / 60,
	);
	const wordsWritten = Math.max(
		0,
		sessionStats.wordCountCurrent - sessionStats.wordCountStart,
	);
	const wordsPerMinute =
		timeSpent > 0 ? Math.round(wordsWritten / timeSpent) : 0;

	const resetSession = () => {
		setSessionStats({
			startTime: Date.now(),
			wordCountStart: sessionStats.wordCountCurrent,
			wordCountCurrent: sessionStats.wordCountCurrent,
			editsCount: 0,
			timeSpent: 0,
		});
	};

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="h-7 px-2 text-xs gap-1.5"
				>
					<BarChart3 className="h-3 w-3" />
					Session
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="w-80 p-0 border-primary/20"
				align="end"
				side="top"
			>
				<GlassCard variant="liquid" className="p-4 space-y-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<BarChart3 className="h-4 w-4 text-primary" />
							<span className="font-semibold text-sm">Session Insights</span>
						</div>
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6"
							onClick={() => setIsOpen(false)}
						>
							<X className="h-3 w-3" />
						</Button>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<StatCard
							icon={Clock}
							label="Time"
							value={`${timeSpent}m`}
							color="text-blue-400"
						/>
						<StatCard
							icon={Target}
							label="Words Written"
							value={wordsWritten.toLocaleString()}
							color="text-green-400"
						/>
						<StatCard
							icon={Zap}
							label="WPM"
							value={wordsPerMinute.toString()}
							color="text-purple-400"
						/>
						<StatCard
							icon={TrendingUp}
							label="Edits"
							value={sessionStats.editsCount.toString()}
							color="text-orange-400"
						/>
					</div>

					<div className="pt-2 border-t border-white/10 space-y-2">
						<div className="flex items-center justify-between text-xs">
							<span className="text-muted-foreground">Current Word Count</span>
							<Badge variant="outline" className="text-[10px]">
								{narrativeMetrics.wordCount.toLocaleString()}
							</Badge>
						</div>
						<div className="flex items-center justify-between text-xs">
							<span className="text-muted-foreground">Reading Time</span>
							<Badge variant="outline" className="text-[10px]">
								~{narrativeMetrics.readingTimeMinutes} min
							</Badge>
						</div>
					</div>

					<Button
						variant="outline"
						size="sm"
						className="w-full h-8 text-xs"
						onClick={resetSession}
					>
						Reset Session
					</Button>
				</GlassCard>
			</PopoverContent>
		</Popover>
	);
}

function StatCard({
	icon: Icon,
	label,
	value,
	color,
}: {
	icon: React.ElementType;
	label: string;
	value: string;
	color: string;
}) {
	return (
		<div className="p-3 rounded-lg bg-background/40 border border-white/5">
			<div className="flex items-center gap-2 mb-1">
				<Icon className={cn("h-3 w-3", color)} />
				<span className="text-[10px] text-muted-foreground uppercase tracking-wider">
					{label}
				</span>
			</div>
			<div className={cn("text-lg font-bold font-mono", color)}>
				{value}
			</div>
		</div>
	);
}

