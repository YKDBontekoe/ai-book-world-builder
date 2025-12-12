"use client";

import {
	BookOpen,
	Check,
	CheckCircle2,
	Clock,
	Coins,
	FileText,
	HelpCircle,
	Image,
	Lightbulb,
	List,
	PenTool,
	RefreshCw,
	Sparkles,
	Users,
	XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	estimateGenerationCost,
	getCostBreakdown,
} from "@/lib/ai/cost-estimation";
import { getChatModelById } from "@/lib/ai/models";
import type {
	ContextSelection,
	GenerationSettings,
	Project,
} from "@/lib/db/schema";
import { cn } from "@/lib/utils";

interface GenerationReviewPanelProps {
	project: Project;
	settings: Partial<GenerationSettings>;
	contextSelection: ContextSelection;
	onStartGeneration: () => void;
	isStarting: boolean;
}

export function GenerationReviewPanel({
	settings,
	contextSelection,
}: GenerationReviewPanelProps) {
	// Get models for display names
	const writerModel = getChatModelById(settings.writerModelId);
	const reviewerModel = getChatModelById(settings.reviewerModelId);

	// Calculate cost estimate using the AI SDK pricing
	const costEstimate = estimateGenerationCost({
		totalChapters: settings.totalChapters || 10,
		pagesPerChapter: settings.pagesPerChapter || 8,
		revisionRounds: settings.revisionRounds || 1,
		writerModelId: settings.writerModelId || "anthropic-claude-sonnet-4-5",
		reviewerModelId: settings.reviewerModelId || "openai-gpt-4o-mini",
		includePrologue: settings.includePrologue,
		includeEpilogue: settings.includeEpilogue,
		generateFrontCover: settings.generateFrontCover,
		generateBackCoverBlurb: settings.generateBackCoverBlurb,
		generateCharacterSheets: settings.generateCharacterSheets,
		generateChapterSummaries: settings.generateChapterSummaries,
		runConsistencyCheck: settings.runConsistencyCheck,
	});

	const costBreakdown = getCostBreakdown(
		costEstimate,
		writerModel?.name,
		reviewerModel?.name,
	);

	const estimatedTime = Math.ceil(
		(settings.totalChapters || 10) * (settings.revisionRounds || 1) * 2,
	);

	// Calculate context stats
	const selectedEntities = contextSelection.entities.filter(
		(e) => e.included,
	).length;
	const selectedOutlines = contextSelection.outlines.filter(
		(o) => o.included,
	).length;
	const selectedScenes = contextSelection.scenes.filter(
		(s) => s.included,
	).length;

	// Readiness checks
	const readinessChecks = [
		{
			label: "Characters & Entities",
			value: selectedEntities,
			required: 1,
			icon: <Users className="h-4 w-4" />,
			tip: "More characters = richer story",
		},
		{
			label: "Story Outline",
			value: selectedOutlines,
			required: 1,
			icon: <FileText className="h-4 w-4" />,
			tip: "Required for structure",
		},
		{
			label: "Scenes Defined",
			value: selectedScenes,
			required: 0,
			icon: <Sparkles className="h-4 w-4" />,
			tip: "Optional but helps pacing",
		},
	];

	const passedChecks = readinessChecks.filter(
		(check) => check.value >= check.required,
	).length;
	const readinessScore = Math.round(
		(passedChecks / readinessChecks.length) * 100,
	);

	// What will be generated
	const generationItems = [
		{
			label: "Chapters",
			value: settings.totalChapters || 10,
			icon: <BookOpen className="h-5 w-5" />,
			active: true,
		},
		{
			label: "Words/Chapter",
			value: `~${((settings.pagesPerChapter || 8) * 250).toLocaleString()}`,
			icon: <PenTool className="h-5 w-5" />,
			active: true,
		},
		{
			label: "Revisions",
			value: settings.revisionRounds || 1,
			icon: <RefreshCw className="h-5 w-5" />,
			active: true,
		},
		{
			label: "Prologue",
			value: settings.includePrologue ? "Yes" : "No",
			icon: <BookOpen className="h-5 w-5" />,
			active: settings.includePrologue,
		},
		{
			label: "Epilogue",
			value: settings.includeEpilogue ? "Yes" : "No",
			icon: <BookOpen className="h-5 w-5" />,
			active: settings.includeEpilogue,
		},
		{
			label: "Cover Art",
			value: settings.generateFrontCover ? "Yes" : "No",
			icon: <Image className="h-5 w-5" />,
			active: settings.generateFrontCover,
		},
		{
			label: "Blurb",
			value: settings.generateBackCoverBlurb ? "Yes" : "No",
			icon: <PenTool className="h-5 w-5" />,
			active: settings.generateBackCoverBlurb,
		},
		{
			label: "TOC",
			value: settings.generateTableOfContents ? "Yes" : "No",
			icon: <List className="h-5 w-5" />,
			active: settings.generateTableOfContents,
		},
	];

	return (
		<TooltipProvider>
			<div className="space-y-6">
				{/* Header - Glassmorphic */}
				<div className="rounded-2xl border border-border/50 bg-background/50 p-8 text-center backdrop-blur-sm">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 backdrop-blur-sm">
						<CheckCircle2 className="h-8 w-8 text-emerald-500" />
					</div>
					<h2 className="text-2xl font-bold">Ready to Generate</h2>
					<p className="mt-2 text-muted-foreground">
						Review your settings before starting generation
					</p>
				</div>

				<div className="grid gap-6 lg:grid-cols-2">
					{/* Readiness Card - Glassmorphic */}
					<Card className="border-border/50 bg-background/50 backdrop-blur-sm">
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-base">
								<CheckCircle2 className="h-5 w-5 text-blue-500" />
								Readiness Check
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center gap-4">
								<div
									className={cn(
										"relative flex h-20 w-20 items-center justify-center rounded-2xl border-2 text-2xl font-bold backdrop-blur-sm",
										readinessScore >= 80
											? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
											: readinessScore >= 50
												? "border-amber-500/30 bg-amber-500/10 text-amber-500"
												: "border-red-500/30 bg-red-500/10 text-red-500",
									)}
								>
									{readinessScore}%
								</div>
								<div className="flex-1">
									<p
										className={cn(
											"text-sm font-medium",
											readinessScore >= 80
												? "text-emerald-600 dark:text-emerald-400"
												: readinessScore >= 50
													? "text-amber-600 dark:text-amber-400"
													: "text-red-600 dark:text-red-400",
										)}
									>
										{readinessScore >= 80
											? "Great! Your project is ready."
											: readinessScore >= 50
												? "Consider adding more context."
												: "Add more content for best results."}
									</p>
									<Progress value={readinessScore} className="mt-2 h-2" />
								</div>
							</div>

							<div className="space-y-2">
								{readinessChecks.map((check) => {
									const passed = check.value >= check.required;
									return (
										<div
											key={check.label}
											className={cn(
												"flex items-center justify-between rounded-xl border px-3 py-2 backdrop-blur-sm transition-colors",
												passed
													? "border-emerald-500/20 bg-emerald-500/5"
													: "border-border/50 bg-background/50",
											)}
										>
											<div className="flex items-center gap-2">
												<span
													className={
														passed
															? "text-emerald-500"
															: "text-muted-foreground"
													}
												>
													{check.icon}
												</span>
												<span className="text-sm">{check.label}</span>
												<Tooltip>
													<TooltipTrigger>
														<HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
													</TooltipTrigger>
													<TooltipContent>
														<p>{check.tip}</p>
													</TooltipContent>
												</Tooltip>
											</div>
											<div className="flex items-center gap-2">
												<Badge
													variant="secondary"
													className={cn(
														passed
															? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
															: "",
													)}
												>
													{check.value} selected
												</Badge>
												{passed ? (
													<Check className="h-4 w-4 text-emerald-500" />
												) : (
													<XCircle className="h-4 w-4 text-muted-foreground" />
												)}
											</div>
										</div>
									);
								})}
							</div>
						</CardContent>
					</Card>

					{/* Cost & Time Card - Glassmorphic */}
					<Card className="border-border/50 bg-background/50 backdrop-blur-sm">
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-base">
								<Coins className="h-5 w-5 text-violet-500" />
								Estimated Cost & Time
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-3 gap-3">
								<div className="rounded-xl border border-border/50 bg-background/50 p-4 text-center backdrop-blur-sm">
									<FileText className="mx-auto h-5 w-5 text-blue-500" />
									<p className="mt-2 font-mono text-2xl font-bold">
										{costEstimate.estimatedWords.toLocaleString()}
									</p>
									<p className="text-xs text-muted-foreground">Words</p>
								</div>
								<div className="rounded-xl border border-border/50 bg-background/50 p-4 text-center backdrop-blur-sm">
									<Clock className="mx-auto h-5 w-5 text-amber-500" />
									<p className="mt-2 font-mono text-2xl font-bold">
										{estimatedTime}m
									</p>
									<p className="text-xs text-muted-foreground">Est. Time</p>
								</div>
								<div className="rounded-xl border border-border/50 bg-background/50 p-4 text-center backdrop-blur-sm">
									<Coins className="mx-auto h-5 w-5 text-emerald-500" />
									<p className="mt-2 font-mono text-2xl font-bold">
										${costEstimate.totalCost.toFixed(2)}
									</p>
									<p className="text-xs text-muted-foreground">Est. Cost</p>
								</div>
							</div>

							{/* Cost breakdown */}
							<div className="mt-4 space-y-2 rounded-xl border border-border/50 bg-muted/30 p-3 backdrop-blur-sm">
								<p className="text-xs font-medium text-muted-foreground">
									Cost Breakdown (using AI SDK pricing)
								</p>
								{costBreakdown.map((item) => (
									<div
										key={item.label}
										className="flex items-center justify-between text-sm"
									>
										<span className="flex items-center gap-2">
											<span className={`h-2 w-2 rounded-full ${item.color}`} />
											{item.label}
										</span>
										<span className="font-mono">${item.cost.toFixed(2)}</span>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Generation Summary - Glassmorphic */}
				<Card className="border-border/50 bg-background/50 backdrop-blur-sm">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-base">
							<Sparkles className="h-5 w-5 text-pink-500" />
							What Will Be Generated
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
							{generationItems.map((item) => (
								<div
									key={item.label}
									className={cn(
										"rounded-xl border p-3 text-center backdrop-blur-sm transition-colors",
										item.active
											? "border-border/50 bg-background/50"
											: "border-border/30 bg-muted/20 opacity-50",
									)}
								>
									<span
										className={cn(
											"mx-auto block",
											item.active ? "text-primary" : "text-muted-foreground",
										)}
									>
										{item.icon}
									</span>
									<p className="mt-1 text-lg font-bold">{item.value}</p>
									<p className="text-xs text-muted-foreground">{item.label}</p>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Pro Tips - Glassmorphic */}
				<div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 backdrop-blur-sm">
					<div className="flex items-start gap-3">
						<Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
						<div>
							<p className="font-medium text-blue-700 dark:text-blue-300">
								Tips
							</p>
							<ul className="mt-2 space-y-1 text-sm text-blue-600 dark:text-blue-400">
								<li className="flex items-center gap-2">
									<Check className="h-3 w-3" /> Generation runs in the
									background
								</li>
								<li className="flex items-center gap-2">
									<Check className="h-3 w-3" /> You can pause and resume at any
									time
								</li>
								<li className="flex items-center gap-2">
									<Check className="h-3 w-3" /> Review each chapter as it
									completes
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</TooltipProvider>
	);
}
