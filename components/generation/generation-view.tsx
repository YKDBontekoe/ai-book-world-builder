"use client";

import { useState } from "react";
import { toast } from "sonner";
import { startGeneration } from "../../app/(chat)/projects/[id]/generate/actions";
import { GenerationDashboard } from "./generation-dashboard";
import { GenerationSettingsForm } from "./generation-settings-form";
import { GlassCard } from "../ui/glass-card";
import type { Project, GenerationSettings } from "../../lib/db/schema";
import { Sparkles } from "lucide-react";

interface GenerationViewProps {
	project: Project;
	existingGenerationId?: string | null;
}

export function GenerationView({
	project,
	existingGenerationId,
}: GenerationViewProps) {
	const [generationId, setGenerationId] = useState<string | null>(
		existingGenerationId || null,
	);
	const [isStarting, setIsStarting] = useState(false);

	const handleStart = async (values: any) => {
		setIsStarting(true);
		try {
			const settings: Partial<GenerationSettings> = {
				genre: values.genre,
				writingStylePreset: values.tone,
				totalChapters: values.totalChapters,
				pagesPerChapter: values.pagesPerChapter,
			};

			const result = await startGeneration(
				project.id,
				settings,
				values.suggestions,
			);

			if (result.success && result.generationId) {
				setGenerationId(result.generationId);
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

	if (generationId) {
		return (
			<GenerationDashboard projectId={project.id} generationId={generationId} />
		);
	}

	return (
		<div className="relative flex flex-col lg:flex-row h-full gap-6 p-4 lg:p-8 bg-muted/5 overflow-hidden">
			{/* Ambient Background */}
			<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />

			{/* Left Panel: Configuration */}
			<GlassCard
				variant="liquid"
				padding="none"
				className="w-full lg:w-[400px] xl:w-[450px] flex-shrink-0 flex flex-col h-full overflow-hidden border-glass-border/50 shadow-xl"
			>
				<div className="p-6 border-b border-border/10 bg-white/40 dark:bg-black/20 backdrop-blur-md">
					<h1 className="flex items-center gap-3 text-xl font-bold tracking-tight">
						<div className="p-2 rounded-lg bg-primary/10 text-primary">
							<Sparkles className="h-5 w-5" />
						</div>
						New Generation
					</h1>
					<p className="text-sm text-muted-foreground mt-2 leading-relaxed">
						Configure your book generation settings to start a new draft.
					</p>
				</div>
				<div className="flex-1 overflow-hidden bg-background/30 backdrop-blur-sm">
					<GenerationSettingsForm
						onSubmit={handleStart}
						isStarting={isStarting}
					/>
				</div>
			</GlassCard>

			{/* Right Panel: Placeholder / Info */}
			<div className="hidden lg:flex flex-1 items-center justify-center p-12 text-center text-muted-foreground">
				<GlassCard
					variant="ghost"
					className="max-w-2xl w-full p-12 backdrop-blur-[2px]"
				>
					<div className="mx-auto w-20 h-20 rounded-[2rem] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-8 shadow-inner">
						<Sparkles className="w-10 h-10 text-primary" />
					</div>
					<h2 className="text-3xl font-bold text-foreground mb-4 tracking-tight">
						Ready to Write
					</h2>
					<p className="text-lg leading-relaxed max-w-lg mx-auto mb-10 text-muted-foreground/80">
						Configure your story parameters on the left. The AI will analyze
						your project's entities, outlines, and lore to generate a coherent
						narrative.
					</p>
					<div className="grid grid-cols-2 gap-6 text-left">
						<GlassCard
							variant="liquid"
							className="group hover:-translate-y-1 transition-transform"
						>
							<span className="font-bold text-foreground block mb-2 text-lg">
								Context Aware
							</span>
							<span className="text-sm leading-relaxed">
								Uses your project's full encyclopedia to ensure consistency.
							</span>
						</GlassCard>
						<GlassCard
							variant="liquid"
							className="group hover:-translate-y-1 transition-transform"
						>
							<span className="font-bold text-foreground block mb-2 text-lg">
								Iterative
							</span>
							<span className="text-sm leading-relaxed">
								Drafts, reviews, and revises chapters automatically.
							</span>
						</GlassCard>
					</div>
				</GlassCard>
			</div>
		</div>
	);
}
