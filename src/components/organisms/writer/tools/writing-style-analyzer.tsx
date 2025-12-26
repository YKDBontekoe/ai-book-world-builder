"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Palette, X, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useMemo } from "react";
import { useDebounceValue } from "usehooks-ts";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { GlassCard } from "@/components/molecules/glass-card";
import { useWriterContext } from "@/components/organisms/writer/writer-context";
import { useNarrativeIntelligence } from "@/hooks/use-narrative-intelligence";
import { useProjectEntities } from "@/hooks/use-project-entities";
import { cn } from "@/lib/utils";

interface StyleMetrics {
	tone: "formal" | "casual" | "neutral";
	voice: "active" | "passive" | "mixed";
	sentenceVariety: "high" | "medium" | "low";
	descriptiveLevel: "high" | "medium" | "low";
}

export function WritingStyleAnalyzer() {
	const { project, sceneContent } = useWriterContext();
	const { data: entities } = useProjectEntities(project.id);
	const [debouncedContent] = useDebounceValue(sceneContent || "", 1500);
	const narrativeMetrics = useNarrativeIntelligence({
		content: debouncedContent,
		entities: entities || [],
	});

	const styleMetrics = useMemo((): StyleMetrics => {
		if (!debouncedContent || debouncedContent.length < 50) {
			return {
				tone: "neutral",
				voice: "mixed",
				sentenceVariety: "medium",
				descriptiveLevel: "medium",
			};
		}

		const content = debouncedContent.toLowerCase();
		const sentences = debouncedContent.match(/[^.!?]+[.!?]+/g) || [];
		const words = debouncedContent.split(/\s+/);

		// Tone analysis
		const formalWords = [
			"therefore",
			"furthermore",
			"moreover",
			"consequently",
			"thus",
			"hence",
		];
		const casualWords = ["gonna", "wanna", "yeah", "okay", "hey", "well"];
		const formalCount = formalWords.filter((w) => content.includes(w)).length;
		const casualCount = casualWords.filter((w) => content.includes(w)).length;

		let tone: "formal" | "casual" | "neutral" = "neutral";
		if (formalCount > casualCount && formalCount > 0) tone = "formal";
		else if (casualCount > formalCount && casualCount > 0) tone = "casual";

		// Voice analysis (active vs passive)
		const passiveIndicators = /\b(was|were|been|being|is|are|am)\s+\w+ed\b/gi;
		const passiveMatches = debouncedContent.match(passiveIndicators) || [];
		const passiveRatio = sentences.length > 0 
			? passiveMatches.length / sentences.length 
			: 0;
		const voice: "active" | "passive" | "mixed" =
			passiveRatio > 0.3 ? "passive" : passiveRatio < 0.1 ? "active" : "mixed";

		// Sentence variety (based on length variance)
		const sentenceLengths = sentences.map((s) => s.split(/\s+/).length);
		const avgLength =
			sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
		const variance =
			sentenceLengths.reduce(
				(sum, len) => sum + Math.pow(len - avgLength, 2),
				0,
			) / sentenceLengths.length;
		const sentenceVariety: "high" | "medium" | "low" =
			variance > 100 ? "high" : variance < 25 ? "low" : "medium";

		// Descriptive level (adjectives, adverbs, sensory words)
		const descriptiveWords = /\b(beautiful|dark|bright|soft|loud|quiet|smooth|rough|warm|cold|sweet|bitter)\b/gi;
		const descriptiveMatches = debouncedContent.match(descriptiveWords) || [];
		const descriptiveRatio = descriptiveMatches.length / words.length;
		const descriptiveLevel: "high" | "medium" | "low" =
			descriptiveRatio > 0.05 ? "high" : descriptiveRatio < 0.01 ? "low" : "medium";

		return {
			tone,
			voice,
			sentenceVariety,
			descriptiveLevel,
		};
	}, [debouncedContent]);

	if (!debouncedContent || debouncedContent.length < 50) return null;

	return (
		<motion.div
			initial={{ opacity: 0, x: -20 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -20 }}
			transition={{ type: "spring", stiffness: 400, damping: 25 }}
			className="fixed top-20 right-4 z-30 w-72"
		>
			<GlassCard
				variant="liquid"
				className="p-4 space-y-3 border-primary/20 shadow-2xl"
			>
				<div className="flex items-center justify-between mb-2">
					<div className="flex items-center gap-2">
						<Palette className="h-4 w-4 text-primary" />
						<span className="text-xs font-bold uppercase text-muted-foreground">
							Writing Style
						</span>
					</div>
				</div>

				<div className="space-y-2.5">
					<StyleMetric
						label="Tone"
						value={styleMetrics.tone}
						options={["formal", "neutral", "casual"]}
					/>
					<StyleMetric
						label="Voice"
						value={styleMetrics.voice}
						options={["active", "mixed", "passive"]}
					/>
					<StyleMetric
						label="Sentence Variety"
						value={styleMetrics.sentenceVariety}
						options={["low", "medium", "high"]}
					/>
					<StyleMetric
						label="Descriptive Level"
						value={styleMetrics.descriptiveLevel}
						options={["low", "medium", "high"]}
					/>
				</div>

				<div className="pt-2 border-t border-white/10">
					<div className="flex items-center justify-between text-xs">
						<span className="text-muted-foreground">Pacing Score</span>
						<Badge
							variant="outline"
							className={cn(
								"text-[10px]",
								narrativeMetrics.pacingScore > 70
									? "border-orange-500/50 text-orange-500"
									: narrativeMetrics.pacingScore < 30
										? "border-blue-500/50 text-blue-500"
										: "border-green-500/50 text-green-500",
							)}
						>
							{Math.round(narrativeMetrics.pacingScore)}
						</Badge>
					</div>
				</div>
			</GlassCard>
		</motion.div>
	);
}

function StyleMetric({
	label,
	value,
	options,
}: {
	label: string;
	value: string;
	options: string[];
}) {
	const valueIndex = options.indexOf(value);
	const isHigh = valueIndex === options.length - 1;
	const isLow = valueIndex === 0;

	return (
		<div className="space-y-1">
			<div className="flex items-center justify-between text-xs">
				<span className="text-muted-foreground">{label}</span>
				<Badge
					variant="outline"
					className={cn(
						"text-[10px] capitalize",
						isHigh && "border-green-500/50 text-green-500",
						isLow && "border-orange-500/50 text-orange-500",
						!isHigh && !isLow && "border-blue-500/50 text-blue-500",
					)}
				>
					{value}
				</Badge>
			</div>
			<div className="flex items-center gap-1 h-1.5 bg-muted rounded-full overflow-hidden">
				{options.map((option, index) => (
					<div
						key={option}
						className={cn(
							"h-full flex-1 transition-colors",
							index === valueIndex
								? isHigh
									? "bg-green-500"
									: isLow
										? "bg-orange-500"
										: "bg-blue-500"
								: "bg-muted/30",
						)}
					/>
				))}
			</div>
		</div>
	);
}

