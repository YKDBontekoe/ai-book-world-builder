"use client";

import { Badge } from "@/components/atoms/badge";
import { writingStylePresets } from "@/lib/db/schema/generation";
import {
	BookOpen,
	CheckCircle2,
	Clock,
	Coins,
	FileText,
	Layers,
	Sparkles,
} from "lucide-react";
import {
	ESTIMATION_BASE_MIN_PER_CHAPTER,
	ESTIMATION_COST_PER_MILLION_TOKENS,
	ESTIMATION_REVISION_MULTIPLIER_PER_ROUND,
	ESTIMATION_TOKENS_PER_CHAPTER,
	ESTIMATION_TOKENS_REVISION_MULTIPLIER,
	WORDS_PER_PAGE,
} from "../constants";
import type { UseGenerationWizardReturn } from "../hooks/use-generation-wizard";

interface ReviewStepProps {
	wizard: UseGenerationWizardReturn;
}

export function ReviewStep({ wizard }: ReviewStepProps) {
	const { state } = wizard;

	const stylePreset = writingStylePresets.find(
		(p) => p.id === state.style.presetId,
	);

	const estimatedWordCount =
		state.structure.totalChapters *
		state.structure.pagesPerChapter *
		WORDS_PER_PAGE;

	// Rough time estimate based on chapters and settings
	const revisionMultiplier =
		1 + state.advanced.revisionRounds * ESTIMATION_REVISION_MULTIPLIER_PER_ROUND;
	const estimatedMinutes = Math.round(
		state.structure.totalChapters *
			ESTIMATION_BASE_MIN_PER_CHAPTER *
			revisionMultiplier,
	);

	// Rough cost estimate (simplified)
	const totalTokens =
		state.structure.totalChapters *
		ESTIMATION_TOKENS_PER_CHAPTER *
		(1 + state.advanced.revisionRounds * ESTIMATION_TOKENS_REVISION_MULTIPLIER);
	const estimatedCost =
		(totalTokens / 1000000) * ESTIMATION_COST_PER_MILLION_TOKENS;

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<h3 className="text-lg font-semibold">Review & Launch</h3>
				<p className="text-sm text-muted-foreground">
					Review your settings before starting generation.
				</p>
			</div>

			{/* Book Info */}
			<div className="p-4 rounded-lg border bg-gradient-to-br from-primary/5 to-primary/10">
				<div className="flex items-start gap-4">
					<div className="w-12 h-16 bg-primary/20 rounded flex items-center justify-center">
						<BookOpen className="w-6 h-6 text-primary" />
					</div>
					<div className="flex-1">
						<h4 className="font-semibold text-lg">
							{state.bookTitle || "Untitled Book"}
						</h4>
						{state.genre && (
							<p className="text-sm text-muted-foreground">
								{state.genre}
							</p>
						)}
						<div className="flex flex-wrap gap-2 mt-2">
							<Badge variant="secondary">
								{state.structure.totalChapters} Chapters
							</Badge>
							{state.structure.includePrologue && (
								<Badge variant="outline">Prologue</Badge>
							)}
							{state.structure.includeEpilogue && (
								<Badge variant="outline">Epilogue</Badge>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Settings Summary */}
			<div className="grid gap-4">
				{/* Style */}
				<div className="p-4 rounded-lg border">
					<div className="flex items-center gap-2 text-sm font-medium mb-2">
						<Sparkles className="w-4 h-4 text-purple-500" />
						Writing Style
					</div>
					<div className="text-sm text-muted-foreground">
						{stylePreset?.name || "Custom"} -{" "}
						{stylePreset?.description || state.style.customDescription}
					</div>
					{state.style.authorInspirations.length > 0 && (
						<div className="mt-2 flex flex-wrap gap-1">
							{state.style.authorInspirations.map((author) => (
								<Badge key={author} variant="outline" className="text-xs">
									{author}
								</Badge>
							))}
						</div>
					)}
				</div>

				{/* Structure */}
				<div className="p-4 rounded-lg border">
					<div className="flex items-center gap-2 text-sm font-medium mb-2">
						<Layers className="w-4 h-4 text-blue-500" />
						Structure
					</div>
					<div className="text-sm text-muted-foreground">
						{state.structure.totalChapters} chapters ×{" "}
						{state.structure.pagesPerChapter} pages each
					</div>
					<div className="text-sm font-medium mt-1">
						≈ {estimatedWordCount.toLocaleString()} words
					</div>
				</div>

				{/* Quality */}
				<div className="p-4 rounded-lg border">
					<div className="flex items-center gap-2 text-sm font-medium mb-2">
						<CheckCircle2 className="w-4 h-4 text-green-500" />
						Quality Settings
					</div>
					<div className="text-sm text-muted-foreground">
						{state.advanced.revisionRounds} revision round
						{state.advanced.revisionRounds !== 1 ? "s" : ""} per chapter
						{state.advanced.runConsistencyCheck &&
							" • Consistency check enabled"}
					</div>
				</div>

				{/* Outputs */}
				<div className="p-4 rounded-lg border">
					<div className="flex items-center gap-2 text-sm font-medium mb-2">
						<FileText className="w-4 h-4 text-amber-500" />
						Additional Outputs
					</div>
					<div className="flex flex-wrap gap-1">
						{state.advanced.generateBackCoverBlurb && (
							<Badge variant="secondary" className="text-xs">
								Back Cover
							</Badge>
						)}
						{state.advanced.generateChapterSummaries && (
							<Badge variant="secondary" className="text-xs">
								Summaries
							</Badge>
						)}
						{state.advanced.generateTableOfContents && (
							<Badge variant="secondary" className="text-xs">
								Table of Contents
							</Badge>
						)}
						{!state.advanced.generateBackCoverBlurb &&
							!state.advanced.generateChapterSummaries &&
							!state.advanced.generateTableOfContents && (
								<span className="text-sm text-muted-foreground">
									None selected
								</span>
							)}
					</div>
				</div>
			</div>

			{/* Estimates */}
			<div className="grid grid-cols-2 gap-4">
				<div className="p-4 rounded-lg bg-muted/50 border">
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Clock className="w-4 h-4" />
						Estimated Time
					</div>
					<div className="text-xl font-bold mt-1">
						{estimatedMinutes < 60
							? `~${estimatedMinutes} min`
							: `~${Math.round(estimatedMinutes / 60 * 10) / 10} hours`}
					</div>
				</div>
				<div className="p-4 rounded-lg bg-muted/50 border">
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Coins className="w-4 h-4" />
						Estimated Cost
					</div>
					<div className="text-xl font-bold mt-1">
						~${estimatedCost.toFixed(2)}
					</div>
				</div>
			</div>

			{/* Warning */}
			<div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
				<p className="text-sm text-amber-800 dark:text-amber-200">
					<strong>Note:</strong> Generation can be paused and resumed at
					any time. You'll be able to review and edit each chapter as it's
					generated.
				</p>
			</div>
		</div>
	);
}
