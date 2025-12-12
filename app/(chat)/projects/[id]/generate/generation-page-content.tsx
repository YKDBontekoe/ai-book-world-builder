"use client";

import {
	ArrowLeft,
	ArrowRight,
	BookOpen,
	Check,
	Loader2,
	Play,
	Settings,
	Sparkles,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { ContextSelectionPanel } from "@/components/generation/context-selection-panel";
import { GenerationConfigPanel } from "@/components/generation/generation-config-panel";
import { GenerationDashboard } from "@/components/generation/generation-dashboard";
import { GenerationReviewPanel } from "@/components/generation/generation-review-panel";
import { Button } from "@/components/ui/button";
import type {
	ContextSelection,
	GenerationSettings,
	Project,
} from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import { startGeneration } from "./actions";

type GenerationPhase = "config" | "generating" | "complete";
type WizardStep = "context" | "settings" | "review";

const WIZARD_STEPS: {
	id: WizardStep;
	label: string;
	description: string;
	icon: React.ReactNode;
}[] = [
	{
		id: "context",
		label: "Select Context",
		description: "Choose your story elements",
		icon: <BookOpen className="h-5 w-5" />,
	},
	{
		id: "settings",
		label: "Configure",
		description: "Set up AI models & options",
		icon: <Settings className="h-5 w-5" />,
	},
	{
		id: "review",
		label: "Review & Start",
		description: "Verify and begin generation",
		icon: <Sparkles className="h-5 w-5" />,
	},
];

const DEFAULT_SETTINGS: Partial<GenerationSettings> = {
	totalChapters: 10,
	pagesPerChapter: 10,
	revisionRounds: 2,
	writingStylePreset: "custom",
	writerModelId: "anthropic-claude-sonnet-4-5",
	reviewerModelId: "openai-gpt-4o-mini",
	includePrologue: false,
	includeEpilogue: false,
	generateBackCoverBlurb: true,
	generateFrontCover: false,
	generateCharacterSheets: false,
	generateChapterSummaries: true,
	generateTableOfContents: true,
	runConsistencyCheck: false,
};

const QUICK_PRESETS = [
	{
		id: "quick",
		name: "Quick Draft",
		icon: <Zap className="h-4 w-4" />,
		settings: { totalChapters: 5, pagesPerChapter: 6, revisionRounds: 1 },
	},
	{
		id: "standard",
		name: "Standard",
		icon: <BookOpen className="h-4 w-4" />,
		settings: { totalChapters: 15, pagesPerChapter: 10, revisionRounds: 2 },
	},
	{
		id: "literary",
		name: "Literary",
		icon: <Sparkles className="h-4 w-4" />,
		settings: { totalChapters: 20, pagesPerChapter: 12, revisionRounds: 3 },
	},
];

export function GenerationPageContent({ project }: { project: Project }) {
	const [phase, setPhase] = useState<GenerationPhase>("config");
	const [currentStep, setCurrentStep] = useState<WizardStep>("context");
	const [generationId, setGenerationId] = useState<string | null>(null);
	const [isStarting, setIsStarting] = useState(false);

	const [settings, setSettings] =
		useState<Partial<GenerationSettings>>(DEFAULT_SETTINGS);
	const [contextSelection, setContextSelection] = useState<ContextSelection>({
		entities: [],
		outlines: [],
		scenes: [],
		drafts: [],
		sourceMaterials: [],
	});

	const handleSettingsChange = useCallback(
		(newSettings: Partial<GenerationSettings>) => {
			setSettings((prev) => ({ ...prev, ...newSettings }));
		},
		[],
	);

	const handleContextChange = useCallback((selection: ContextSelection) => {
		setContextSelection(selection);
	}, []);

	const handleQuickPreset = (preset: (typeof QUICK_PRESETS)[0]) => {
		setSettings((prev) => ({ ...prev, ...preset.settings }));
		toast.success(`Applied "${preset.name}" preset`);
	};

	const handleStartGeneration = async () => {
		setIsStarting(true);
		try {
			const result = await startGeneration(project.id, {
				...settings,
				contextSelection,
			} as GenerationSettings);

			if (result.success && result.generationId) {
				setGenerationId(result.generationId);
				setPhase("generating");
				toast.success("Generation started!");
			} else {
				toast.error(result.error || "Failed to start generation");
			}
		} catch (error) {
			console.error("Failed to start generation:", error);
			toast.error("Failed to start generation");
		} finally {
			setIsStarting(false);
		}
	};

	const currentStepIndex = WIZARD_STEPS.findIndex((s) => s.id === currentStep);

	const goToStep = (step: WizardStep) => setCurrentStep(step);
	const goNext = () => {
		const nextIndex = currentStepIndex + 1;
		if (nextIndex < WIZARD_STEPS.length) {
			setCurrentStep(WIZARD_STEPS[nextIndex].id);
		}
	};
	const goBack = () => {
		const prevIndex = currentStepIndex - 1;
		if (prevIndex >= 0) {
			setCurrentStep(WIZARD_STEPS[prevIndex].id);
		}
	};

	const contextStats = {
		entities: contextSelection.entities.filter((e) => e.included).length,
		total: contextSelection.entities.length,
	};

	if (phase !== "config") {
		return (
			<div className="flex h-dvh flex-col bg-background">
				<header className="flex items-center justify-between border-b bg-background/80 px-6 py-4 backdrop-blur-xl">
					<div className="flex items-center gap-4">
						<Button variant="ghost" size="icon" asChild>
							<Link href="/">
								<ArrowLeft className="h-5 w-5" />
							</Link>
						</Button>
						<div>
							<h1 className="flex items-center gap-2 text-xl font-bold">
								<Sparkles className="h-5 w-5 text-primary" />
								Book Generation
							</h1>
							<p className="text-sm text-muted-foreground">{project.name}</p>
						</div>
					</div>
				</header>
				<main className="flex-1 overflow-hidden">
					<GenerationDashboard
						projectId={project.id}
						generationId={generationId}
						onComplete={() => setPhase("complete")}
					/>
				</main>
			</div>
		);
	}

	return (
		<div className="flex h-dvh flex-col bg-background">
			{/* Glassmorphic Header */}
			<header className="relative z-10 border-b border-border/50 bg-background/60 px-6 py-4 backdrop-blur-xl">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Button variant="ghost" size="icon" className="rounded-xl" asChild>
							<Link href="/">
								<ArrowLeft className="h-5 w-5" />
							</Link>
						</Button>
						<div>
							<h1 className="flex items-center gap-2 text-xl font-bold">
								<Sparkles className="h-5 w-5 text-primary" />
								Book Generation
							</h1>
							<p className="text-sm text-muted-foreground">{project.name}</p>
						</div>
					</div>

					{/* Quick Presets - Glassmorphic */}
					<div className="hidden items-center gap-2 md:flex">
						{QUICK_PRESETS.map((preset) => (
							<Button
								key={preset.id}
								variant="outline"
								size="sm"
								className="gap-2 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm hover:bg-background/80"
								onClick={() => handleQuickPreset(preset)}
							>
								{preset.icon}
								{preset.name}
							</Button>
						))}
					</div>
				</div>
			</header>

			{/* Step Indicator - Glassmorphic */}
			<div className="border-b border-border/50 bg-muted/30 px-6 py-4 backdrop-blur-sm">
				<div className="mx-auto flex max-w-3xl items-center justify-between">
					{WIZARD_STEPS.map((step, index) => {
						const isActive = step.id === currentStep;
						const isCompleted = index < currentStepIndex;
						const isLast = index === WIZARD_STEPS.length - 1;

						return (
							<div key={step.id} className="flex flex-1 items-center">
								<button
									type="button"
									onClick={() => goToStep(step.id)}
									className={cn(
										"group flex flex-col items-center gap-2 transition-all",
										(isActive || isCompleted) && "cursor-pointer",
									)}
								>
									{/* Step Circle */}
									<div
										className={cn(
											"flex h-12 w-12 items-center justify-center rounded-2xl border-2 transition-all",
											isActive
												? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25"
												: isCompleted
													? "border-primary/50 bg-primary/10 text-primary"
													: "border-border bg-background/50 text-muted-foreground backdrop-blur-sm",
										)}
									>
										{isCompleted ? <Check className="h-5 w-5" /> : step.icon}
									</div>
									{/* Step Label */}
									<div className="text-center">
										<p
											className={cn(
												"text-sm font-medium",
												isActive
													? "text-foreground"
													: isCompleted
														? "text-primary"
														: "text-muted-foreground",
											)}
										>
											{step.label}
										</p>
										<p className="hidden text-xs text-muted-foreground sm:block">
											{step.description}
										</p>
									</div>
								</button>
								{/* Connector Line */}
								{!isLast && (
									<div
										className={cn(
											"mx-4 h-0.5 flex-1 rounded-full transition-colors",
											isCompleted ? "bg-primary/50" : "bg-border",
										)}
									/>
								)}
							</div>
						);
					})}
				</div>
			</div>

			{/* Main Content Area */}
			<main className="flex-1 overflow-hidden">
				<div className="h-full overflow-y-auto">
					<div className="mx-auto max-w-4xl p-6">
						{currentStep === "context" && (
							<ContextSelectionPanel
								projectId={project.id}
								value={contextSelection}
								onChange={handleContextChange}
							/>
						)}

						{currentStep === "settings" && (
							<GenerationConfigPanel
								projectId={project.id}
								settings={settings}
								onSettingsChange={handleSettingsChange}
							/>
						)}

						{currentStep === "review" && (
							<GenerationReviewPanel
								project={project}
								settings={settings}
								contextSelection={contextSelection}
								onStartGeneration={handleStartGeneration}
								isStarting={isStarting}
							/>
						)}
					</div>
				</div>
			</main>

			{/* Footer Navigation - Glassmorphic */}
			<footer className="border-t border-border/50 bg-background/60 px-6 py-4 backdrop-blur-xl">
				<div className="mx-auto flex max-w-4xl items-center justify-between">
					<Button
						variant="outline"
						onClick={goBack}
						disabled={currentStepIndex === 0}
						className="gap-2 rounded-xl border-border/50 bg-background/50"
					>
						<ArrowLeft className="h-4 w-4" />
						Back
					</Button>

					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						{currentStep === "context" && contextStats.total > 0 && (
							<span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
								{contextStats.entities}/{contextStats.total} items selected
							</span>
						)}
					</div>

					{currentStep !== "review" ? (
						<Button
							onClick={goNext}
							className="gap-2 rounded-xl shadow-lg shadow-primary/20"
						>
							Next
							<ArrowRight className="h-4 w-4" />
						</Button>
					) : (
						<Button
							size="lg"
							className="gap-2 rounded-xl shadow-lg shadow-primary/20"
							onClick={handleStartGeneration}
							disabled={isStarting}
						>
							{isStarting ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin" />
									Starting...
								</>
							) : (
								<>
									<Play className="h-4 w-4" />
									Start Generation
								</>
							)}
						</Button>
					)}
				</div>
			</footer>
		</div>
	);
}
