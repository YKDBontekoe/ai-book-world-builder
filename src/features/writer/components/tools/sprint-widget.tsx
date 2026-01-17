"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, Square, Timer, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/atoms/popover";
import { GlassCard } from "@/components/molecules/glass-card";
import { useWriterContext } from "@/features/writer/components/writer-context";
import { useNarrativeIntelligence } from "@/hooks/use-narrative-intelligence";
import { useProjectEntities } from "@/hooks/use-project-entities";
import { cn } from "@/lib/utils";

export function SprintWidget() {
	const { project, sceneContent } = useWriterContext();
	const { data: entities } = useProjectEntities(project.id);
	const narrativeMetrics = useNarrativeIntelligence({
		content: sceneContent || "",
		entities: entities || [],
	});

	// Sprint State
	const [isActive, setIsActive] = useState(false);
	const [isPaused, setIsPaused] = useState(false);
	const [durationMinutes, setDurationMinutes] = useState(15);
	const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
	const [startWordCount, setStartWordCount] = useState(0);
	const [sessionWords, setSessionWords] = useState(0);
	const sessionWordsRef = useRef(0);

	// Sync current word count
	const currentWordCount = narrativeMetrics.wordCount;

	useEffect(() => {
		if (isActive && !isPaused) {
			const count = Math.max(0, currentWordCount - startWordCount);
			setSessionWords(count);
			sessionWordsRef.current = count;
		}
	}, [currentWordCount, isActive, isPaused, startWordCount]);

	// Timer Logic
	useEffect(() => {
		if (!isActive || isPaused) return;

		const interval = setInterval(() => {
			setTimeLeft((prev) => {
				if (prev <= 1) {
					// Sprint finished
					setIsActive(false);
					toast.success(
						`Sprint Complete! You wrote ${sessionWordsRef.current} words.`,
					);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(interval);
	}, [isActive, isPaused]);

	const startSprint = () => {
		setStartWordCount(currentWordCount);
		setSessionWords(0);
		setTimeLeft(durationMinutes * 60);
		setIsActive(true);
		setIsPaused(false);
		toast.success("Sprint started! Go!");
	};

	const togglePause = () => {
		setIsPaused(!isPaused);
	};

	const stopSprint = () => {
		setIsActive(false);
		toast.info(`Sprint stopped. Total: ${sessionWords} words.`);
	};

	const formatTime = (seconds: number) => {
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return `${m}:${s.toString().padStart(2, "0")}`;
	};

	return (
		<div className="flex items-center gap-2">
			<AnimatePresence mode="wait">
				{!isActive ? (
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.9 }}
					>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant="ghost"
									size="sm"
									className="h-8 px-2 text-xs gap-1.5 hover:bg-primary/10 hover:text-primary transition-colors"
								>
									<Zap className="h-3.5 w-3.5" />
									Sprint
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-64 p-0" align="end">
								<GlassCard variant="liquid" className="p-4 space-y-4">
									<div className="flex items-center gap-2 mb-2">
										<Timer className="h-4 w-4 text-primary" />
										<span className="font-semibold text-sm">Start Sprint</span>
									</div>
									<div className="space-y-2">
										<Label className="text-xs">Duration (minutes)</Label>
										<div className="flex gap-2">
											{[15, 30, 60].map((m) => (
												<Button
													key={m}
													variant={
														durationMinutes === m ? "default" : "outline"
													}
													size="sm"
													onClick={() => setDurationMinutes(m)}
													className="flex-1 text-xs h-7"
												>
													{m}m
												</Button>
											))}
										</div>
										<Input
											type="number"
											value={durationMinutes}
											onChange={(e) =>
												setDurationMinutes(
													Number.parseInt(e.target.value, 10) || 15,
												)
											}
											className="h-8 text-xs"
											min={1}
										/>
									</div>
									<Button
										onClick={startSprint}
										className="w-full h-8 text-xs font-semibold"
										size="sm"
									>
										Start Writing
									</Button>
								</GlassCard>
							</PopoverContent>
						</Popover>
					</motion.div>
				) : (
					<motion.div
						initial={{ opacity: 0, width: 0 }}
						animate={{ opacity: 1, width: "auto" }}
						exit={{ opacity: 0, width: 0 }}
						className="flex items-center gap-2 bg-primary/10 rounded-full px-2 py-1 pr-3 border border-primary/20 backdrop-blur-md"
					>
						<div className="flex items-center gap-1.5 text-xs font-mono font-medium text-primary">
							<span
								className={cn("animate-pulse", timeLeft < 60 && "text-red-500")}
							>
								{formatTime(timeLeft)}
							</span>
							<span className="w-px h-3 bg-primary/20" />
							<span>{sessionWords} words</span>
						</div>
						<div className="flex items-center gap-1 ml-1">
							<Button
								variant="ghost"
								size="icon"
								className="h-5 w-5 rounded-full hover:bg-primary/20"
								onClick={togglePause}
							>
								{isPaused ? (
									<Play className="h-2.5 w-2.5 fill-current" />
								) : (
									<Pause className="h-2.5 w-2.5 fill-current" />
								)}
							</Button>
							<Button
								variant="ghost"
								size="icon"
								className="h-5 w-5 rounded-full hover:bg-red-500/20 hover:text-red-500"
								onClick={stopSprint}
							>
								<Square className="h-2.5 w-2.5 fill-current" />
							</Button>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
