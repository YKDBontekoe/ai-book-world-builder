"use client";

import { motion } from "framer-motion";
import { Target, X } from "lucide-react";
import { useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/atoms/popover";
import { Slider } from "@/components/atoms/slider";
import { GlassCard } from "@/components/molecules/glass-card";
import { useWriterContent } from "@/features/writer/components/writer-content-context";
import { useWriterContext } from "@/features/writer/components/writer-context";
import { useNarrativeIntelligence } from "@/hooks/use-narrative-intelligence";
import { useProjectEntities } from "@/hooks/use-project-entities";
import { cn } from "@/lib/utils";

interface WritingGoals {
	wordCountTarget: number;
	pacingTarget: number | null; // null means no target
}

export function WritingGoals() {
	const { project } = useWriterContext();
	const { sceneContent } = useWriterContent();
	const { data: entities } = useProjectEntities(project.id);
	const narrativeMetrics = useNarrativeIntelligence({
		content: sceneContent || "",
		entities: entities || [],
	});

	const [goals, setGoals] = useLocalStorage<WritingGoals>(
		`writing-goals-${project.id}`,
		{ wordCountTarget: 1000, pacingTarget: null },
	);

	const [isOpen, setIsOpen] = useState(false);
	const [tempGoals, setTempGoals] = useState(goals);

	const wordProgress =
		goals.wordCountTarget > 0
			? Math.min(
					100,
					(narrativeMetrics.wordCount / goals.wordCountTarget) * 100,
				)
			: 0;

	const pacingProgress =
		goals.pacingTarget !== null && narrativeMetrics.pacingScore > 0
			? Math.min(
					100,
					Math.abs(narrativeMetrics.pacingScore - goals.pacingTarget) < 10
						? 100
						: 100 -
								Math.abs(narrativeMetrics.pacingScore - goals.pacingTarget) * 2,
				)
			: null;

	const handleSave = () => {
		setGoals(tempGoals);
		setIsOpen(false);
	};

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1.5">
					<Target className="h-3 w-3" />
					Goals
					{wordProgress >= 100 && (
						<span className="ml-1 text-green-500">✓</span>
					)}
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
							<Target className="h-4 w-4 text-primary" />
							<span className="font-semibold text-sm">Writing Goals</span>
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

					{/* Word Count Goal */}
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<Label htmlFor="word-target" className="text-xs">
								Word Count Target
							</Label>
							<span className="text-xs text-muted-foreground">
								{narrativeMetrics.wordCount} / {tempGoals.wordCountTarget}
							</span>
						</div>
						<div className="space-y-2">
							<Input
								id="word-target"
								type="number"
								value={tempGoals.wordCountTarget}
								onChange={(e) =>
									setTempGoals({
										...tempGoals,
										wordCountTarget: Number.parseInt(e.target.value, 10) || 0,
									})
								}
								className="h-8 text-sm"
								min={0}
							/>
							<div className="relative h-2 bg-muted rounded-full overflow-hidden">
								<motion.div
									className={cn(
										"absolute inset-y-0 left-0 rounded-full transition-colors",
										wordProgress >= 100
											? "bg-green-500"
											: wordProgress >= 50
												? "bg-primary"
												: "bg-orange-500",
									)}
									initial={{ width: 0 }}
									animate={{ width: `${wordProgress}%` }}
									transition={{ type: "spring", stiffness: 200, damping: 20 }}
								/>
							</div>
							{wordProgress >= 100 && (
								<p className="text-xs text-green-500 font-medium">
									🎉 Goal achieved!
								</p>
							)}
						</div>
					</div>

					{/* Pacing Goal */}
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<Label htmlFor="pacing-target" className="text-xs">
								Pacing Target (Optional)
							</Label>
							{tempGoals.pacingTarget !== null && (
								<span className="text-xs text-muted-foreground">
									Current: {Math.round(narrativeMetrics.pacingScore)}
								</span>
							)}
						</div>
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<Slider
									id="pacing-target"
									value={[
										tempGoals.pacingTarget !== null
											? tempGoals.pacingTarget
											: 50,
									]}
									onValueChange={([value]) =>
										setTempGoals({
											...tempGoals,
											pacingTarget: value,
										})
									}
									min={0}
									max={100}
									step={5}
									className="flex-1"
								/>
								<Button
									variant="ghost"
									size="sm"
									className="h-7 px-2 text-xs"
									onClick={() =>
										setTempGoals({
											...tempGoals,
											pacingTarget: tempGoals.pacingTarget !== null ? null : 50,
										})
									}
								>
									{tempGoals.pacingTarget !== null ? "Clear" : "Set"}
								</Button>
							</div>
							{tempGoals.pacingTarget !== null && (
								<>
									<div className="relative h-2 bg-muted rounded-full overflow-hidden">
										{pacingProgress !== null && (
											<motion.div
												className={cn(
													"absolute inset-y-0 left-0 rounded-full transition-colors",
													pacingProgress >= 80
														? "bg-green-500"
														: pacingProgress >= 50
															? "bg-primary"
															: "bg-orange-500",
												)}
												initial={{ width: 0 }}
												animate={{ width: `${pacingProgress}%` }}
												transition={{
													type: "spring",
													stiffness: 200,
													damping: 20,
												}}
											/>
										)}
									</div>
									<p className="text-xs text-muted-foreground">
										Target: {tempGoals.pacingTarget} (
										{tempGoals.pacingTarget > 70
											? "Fast"
											: tempGoals.pacingTarget < 30
												? "Slow"
												: "Balanced"}
										)
									</p>
								</>
							)}
						</div>
					</div>

					<div className="flex gap-2 pt-2">
						<Button
							size="sm"
							className="flex-1 h-8 text-xs"
							onClick={handleSave}
						>
							Save Goals
						</Button>
						<Button
							variant="outline"
							size="sm"
							className="h-8 text-xs"
							onClick={() => {
								setTempGoals(goals);
								setIsOpen(false);
							}}
						>
							Cancel
						</Button>
					</div>
				</GlassCard>
			</PopoverContent>
		</Popover>
	);
}
