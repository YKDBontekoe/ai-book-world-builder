"use client";

import {
	AlertCircle,
	BookOpen,
	CheckCircle2,
	ChevronDown,
	ChevronRight,
	Pause,
	Play,
	Square,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { EmptyState } from "../ui/empty-state";
import { GlassCard } from "../ui/glass-card";
import { LoadingSpinner } from "../ui/loading-spinner";
import { Progress } from "../ui/progress";
import { SectionHeader } from "../ui/section-header";
import { StatusBadge } from "../ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { cn } from "../../lib/utils";
import { useGenerationDashboard, type GenerationStep } from "../../hooks/use-generation-dashboard";

interface GenerationDashboardProps {
	projectId: string;
	generationId: string | null;
	onComplete?: () => void;
}

export function GenerationDashboard({
	projectId,
	generationId,
	onComplete,
}: GenerationDashboardProps) {
	const {
		isLoading,
		isPaused,
		generationStatus,
		steps,
		assets,
		error,
		isExporting,
		handlePause,
		handleResume,
		handleCancel,
		handleExport,
	} = useGenerationDashboard(projectId, generationId, onComplete);

	const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
	const [selectedStepId, setSelectedStepId] = useState<string | null>(null);

	const completedSteps = steps.filter((s) => s.status === "completed").length;
	const totalSteps = steps.length;
	const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
	const totalWords = steps.reduce((acc, s) => acc + (s.wordCount || 0), 0);

	const currentStep = steps.find((s) => s.status === "running");

	const toggleStep = (stepId: string) => {
		setExpandedSteps((prev) => {
			const next = new Set(prev);
			if (next.has(stepId)) {
				next.delete(stepId);
			} else {
				next.add(stepId);
			}
			return next;
		});
	};

	const getStepIcon = (step: GenerationStep) => {
		switch (step.status) {
			case "completed":
				return (
					<CheckCircle2 className="h-4 w-4 text-[var(--status-success)]" />
				);
			case "running":
				return <LoadingSpinner size="sm" variant="info" />;
			case "failed":
				return <AlertCircle className="h-4 w-4 text-[var(--status-error)]" />;
			case "paused":
				return <Pause className="h-4 w-4 text-[var(--status-warning)]" />;
			default:
				return <div className="h-4 w-4 rounded-full border-2 border-muted" />;
		}
	};

	const getStepLabel = (stepType: string) => {
		switch (stepType) {
			case "prologue":
				return "Prologue";
			case "epilogue":
				return "Epilogue";
			case "chapter_writing":
				return "Writing";
			case "chapter_reviewing":
				return "Reviewing";
			case "chapter_revision":
				return "Revising";
			case "front_cover":
				return "Cover Art";
			case "back_cover":
				return "Back Cover";
			case "consistency_check":
				return "Consistency Check";
			default:
				return stepType;
		}
	};

	// Get preview content
	const getPreviewContent = () => {
		const selectedStep = selectedStepId
			? steps.find((s) => s.id === selectedStepId)
			: currentStep || steps.find((s) => s.status === "completed");

		if (selectedStep?.agentOutput) {
			return selectedStep.agentOutput;
		}

		// Check assets for prologue/epilogue
		const prologueAsset = assets.find((a) => a.assetType === "prologue");
		const epilogueAsset = assets.find((a) => a.assetType === "epilogue");

		if (selectedStep?.stepType === "prologue" && prologueAsset?.content) {
			return prologueAsset.content;
		}

		if (selectedStep?.stepType === "epilogue" && epilogueAsset?.content) {
			return epilogueAsset.content;
		}

		// Default to first completed step with content
		const firstWithContent = steps.find((s) => s.agentOutput);
		if (firstWithContent?.agentOutput) {
			return firstWithContent.agentOutput;
		}

		if (prologueAsset?.content) {
			return prologueAsset.content;
		}

		return null;
	};

	if (isLoading) {
		return (
			<div className="flex h-full items-center justify-center">
				<LoadingSpinner size="lg" variant="primary" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex h-full items-center justify-center">
				<EmptyState
					icon={AlertCircle}
					iconClassName="text-[var(--status-error)]"
					title="Error"
					description={error}
				/>
			</div>
		);
	}

	const previewContent = getPreviewContent();

	return (
		<div className="relative flex flex-col lg:flex-row h-full gap-6 p-4 lg:p-8 bg-muted/5 overflow-hidden">
			{/* Ambient Background */}
			<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />

			{/* Left: Progress & Controls */}
			<GlassCard
				variant="liquid"
				padding="none"
				className="w-full lg:w-1/3 flex flex-col overflow-hidden border-glass-border/50 shadow-xl"
			>
				{/* Stats Header */}
				<div className="border-b border-border/10 bg-white/40 dark:bg-black/20 backdrop-blur-md px-6 py-4 shrink-0">
					<SectionHeader
						title="Generation Progress"
						description={
							currentStep
								? `Working on: ${getStepLabel(currentStep.stepType)}`
								: generationStatus === "completed"
									? "Generation complete!"
									: "Initializing..."
						}
						action={
							<StatusBadge
								status={
									generationStatus === "completed"
										? "success"
										: generationStatus === "failed"
											? "error"
											: isPaused
												? "warning"
												: "running"
								}
							>
								{generationStatus === "completed"
									? "Complete"
									: generationStatus === "failed"
										? "Failed"
										: isPaused
											? "Paused"
											: "Running"}
							</StatusBadge>
						}
						className="mb-4"
					/>

					{/* Progress Bar */}
					<div className="mt-4 space-y-2">
						<div className="flex justify-between text-sm">
							<span>Overall Progress</span>
							<span className="font-medium">{Math.round(progress)}%</span>
						</div>
						<Progress value={progress} className="h-3" />
					</div>

					{/* Stats */}
					<div className="mt-4 grid grid-cols-3 gap-4 text-center">
						<div>
							<p className="text-xs text-muted-foreground">Steps</p>
							<p className="font-mono text-lg font-semibold">
								{completedSteps}/{totalSteps}
							</p>
						</div>
						<div>
							<p className="text-xs text-muted-foreground">Words</p>
							<p className="font-mono text-lg font-semibold">
								{totalWords.toLocaleString()}
							</p>
						</div>
						<div>
							<p className="text-xs text-muted-foreground">Status</p>
							<p className="font-mono text-lg font-semibold capitalize">
								{generationStatus}
							</p>
						</div>
					</div>
				</div>

				{/* Controls */}
				<div className="border-b border-border/10 px-6 py-4 bg-background/20">
					<div className="flex flex-col gap-2">
						<div className="flex gap-2">
							{isPaused ? (
								<Button className="flex-1 gap-2" onClick={handleResume}>
									<Play className="h-4 w-4" />
									Resume
								</Button>
							) : (
								<Button
									variant="outline"
									className="flex-1 gap-2"
									onClick={handlePause}
									disabled={
										generationStatus === "completed" ||
										generationStatus === "failed"
									}
								>
									<Pause className="h-4 w-4" />
									Pause
								</Button>
							)}
							<Button
								variant="destructive"
								size="icon"
								onClick={handleCancel}
								disabled={
									generationStatus === "completed" ||
									generationStatus === "failed"
								}
							>
								<Square className="h-4 w-4" />
							</Button>
						</div>

						{/* Export buttons - shown when paused or completed */}
						{(isPaused ||
							generationStatus === "completed" ||
							generationStatus === "failed") &&
							completedSteps > 0 && (
								<div className="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										className="flex-1 gap-2"
										onClick={() => handleExport("pdf")}
										disabled={isExporting}
									>
										{isExporting ? "Exporting..." : "Export PDF"}
									</Button>
									<Button
										variant="outline"
										size="sm"
										className="flex-1 gap-2"
										onClick={() => handleExport("epub")}
										disabled={isExporting}
									>
										{isExporting ? "Exporting..." : "Export EPUB"}
									</Button>
								</div>
							)}
					</div>
				</div>

				{/* Steps List */}
				<div className="flex-1 overflow-y-auto p-4 bg-background/30 backdrop-blur-sm">
					<div className="space-y-2">
						{steps.map((step) => (
							<button
								type="button"
								key={step.id}
								className={cn(
									"w-full text-left rounded-xl transition-all cursor-pointer border border-transparent hover:bg-white/40 dark:hover:bg-white/5",
									step.status === "running" &&
										"bg-primary/5 border-primary/20 shadow-sm",
									selectedStepId === step.id && "ring-2 ring-primary ring-offset-2 ring-offset-transparent",
									step.status !== "running" && "bg-white/20 dark:bg-black/20"
								)}
								onClick={() => {
									setSelectedStepId(step.id);
									toggleStep(step.id);
								}}
							>
								<div className="flex items-center gap-3 p-3">
									{getStepIcon(step)}
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2">
											<span className={cn("font-medium text-sm truncate", step.status === "running" ? "text-primary" : "text-foreground")}>
												{getStepLabel(step.stepType)}
												{step.sequence > 1 && ` (${step.sequence})`}
											</span>
										</div>
										{step.wordCount && (
											<p className="text-xs text-muted-foreground">
												{step.wordCount.toLocaleString()} words
											</p>
										)}
									</div>
									{expandedSteps.has(step.id) ? (
										<ChevronDown className="h-4 w-4 text-muted-foreground" />
									) : (
										<ChevronRight className="h-4 w-4 text-muted-foreground" />
									)}
								</div>

								{expandedSteps.has(step.id) && (
									<div className="border-t border-primary/10 bg-primary/5 p-3 rounded-b-xl">
										<p className="text-xs text-muted-foreground mb-2">
											{step.agentOutput
												? `Content available (${step.wordCount || 0} words)`
												: step.status === "completed"
													? "Step completed"
													: step.status === "running"
														? "Currently generating..."
														: "Pending"}
										</p>
									</div>
								)}
							</button>
						))}
					</div>
				</div>
			</GlassCard>

			{/* Right: Agent Logs & Preview */}
			<GlassCard
				variant="liquid"
				padding="none"
				className="flex-1 flex flex-col overflow-hidden border-glass-border/50 shadow-xl"
			>
				<Tabs defaultValue="preview" className="flex-1 flex flex-col min-h-0">
					<div className="border-b border-border/10 px-6 bg-white/40 dark:bg-black/20 backdrop-blur-md">
						<TabsList className="my-2 bg-black/5 dark:bg-white/10">
							<TabsTrigger value="preview">Preview</TabsTrigger>
							<TabsTrigger value="logs">Agent Logs</TabsTrigger>
							<TabsTrigger value="notes">Notes</TabsTrigger>
						</TabsList>
					</div>

					<TabsContent value="preview" className="flex-1 overflow-hidden m-0 bg-background/30 backdrop-blur-sm">
						<div className="h-full overflow-y-auto p-6">
							{previewContent ? (
								<div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
									{previewContent}
								</div>
							) : (
								<div className="flex h-full items-center justify-center">
									<div className="text-center">
										<BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
										<p className="mt-2 text-sm text-muted-foreground">
											{generationStatus === "running"
												? "Content will appear here as it's generated..."
												: "No content generated yet."}
										</p>
									</div>
								</div>
							)}
						</div>
					</TabsContent>

					<TabsContent value="logs" className="flex-1 overflow-hidden m-0">
						<div className="h-full overflow-y-auto p-6 font-mono text-sm">
							<div className="space-y-2">
								{steps
									.filter(
										(s) => s.status === "completed" || s.status === "running",
									)
									.map((step) => (
										<div
											key={step.id}
											className={cn(
												"rounded-lg border p-3",
												step.status === "running"
													? "border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20"
													: "border-green-500/30 bg-green-50/50 dark:bg-green-950/20",
											)}
										>
											[{step.status === "running" ? "Running" : "Complete"}]{" "}
											{getStepLabel(step.stepType)}
											{step.wordCount
												? ` - ${step.wordCount.toLocaleString()} words`
												: ""}
										</div>
									))}
								{generationStatus === "running" && (
									<div className="flex items-center gap-2 text-muted-foreground">
										<LoadingSpinner size="sm" variant="muted" />
										<span>Generating content...</span>
									</div>
								)}
							</div>
						</div>
					</TabsContent>

					<TabsContent value="notes" className="flex-1 overflow-hidden m-0">
						<div className="h-full overflow-y-auto p-6">
							<Card>
								<CardHeader>
									<CardTitle className="text-base">Add Note</CardTitle>
								</CardHeader>
								<CardContent>
									<textarea
										className="w-full min-h-[100px] rounded-md border bg-transparent px-3 py-2 text-sm"
										placeholder="Add feedback for the AI to incorporate in future chapters..."
									/>
									<div className="mt-3 flex gap-2">
										<Button size="sm">Add Global Note</Button>
										<Button variant="outline" size="sm">
											Add to Current Chapter
										</Button>
									</div>
								</CardContent>
							</Card>
						</div>
					</TabsContent>
				</Tabs>
			</GlassCard>
		</div>
	);
}
