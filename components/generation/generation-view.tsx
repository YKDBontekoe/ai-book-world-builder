"use client";

import { useState } from "react";
import { toast } from "sonner";
import { startGeneration } from "@/app/(chat)/projects/[id]/generate/actions";
import { GenerationDashboard } from "@/components/generation/generation-dashboard";
import { GenerationSettingsForm } from "@/components/generation/generation-settings-form";
import type { Project, GenerationSettings } from "@/lib/db/schema";
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
		<div className="grid h-full grid-cols-1 lg:grid-cols-12 gap-0 bg-muted/10">
			{/* Left Panel: Configuration */}
			<div className="col-span-1 lg:col-span-4 border-r bg-background h-full flex flex-col">
				<div className="p-6 border-b">
					<h1 className="flex items-center gap-2 text-xl font-bold">
						<Sparkles className="h-5 w-5 text-primary" />
						New Generation
					</h1>
					<p className="text-sm text-muted-foreground mt-1">
						Configure your book generation settings.
					</p>
				</div>
				<div className="flex-1 overflow-hidden">
					<GenerationSettingsForm
						onSubmit={handleStart}
						isStarting={isStarting}
					/>
				</div>
			</div>

			{/* Right Panel: Placeholder / Info */}
			<div className="hidden lg:flex col-span-8 items-center justify-center p-12 text-center text-muted-foreground bg-muted/5">
				<div className="max-w-md space-y-4">
					<div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
						<Sparkles className="w-8 h-8 text-primary" />
					</div>
					<h2 className="text-2xl font-semibold text-foreground">
						Ready to Write
					</h2>
					<p>
						Configure your story parameters on the left. The AI will analyze
						your project's entities, outlines, and lore to generate a coherent
						narrative.
					</p>
					<div className="grid grid-cols-2 gap-4 mt-8 text-sm">
						<div className="p-4 rounded-lg border bg-background">
							<span className="font-semibold block mb-1">Context Aware</span>
							Uses your project's full encyclopedia
						</div>
						<div className="p-4 rounded-lg border bg-background">
							<span className="font-semibold block mb-1">Iterative</span>
							Drafts, reviews, and revises chapters
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
