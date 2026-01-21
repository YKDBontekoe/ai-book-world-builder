"use client";

import { AnimatePresence } from "framer-motion";
import type React from "react";
import { useStoryWizard } from "@/features/writer/components/hooks/use-story-wizard";
import { WizardGeneratingStep } from "@/features/writer/components/story-wizard/WizardGeneratingStep";
import { WizardInputStep } from "@/features/writer/components/story-wizard/WizardInputStep";
import { WizardReviewStep } from "@/features/writer/components/story-wizard/WizardReviewStep";
import { STORY_TEMPLATES, type StoryTemplate } from "@/lib/story-templates";

interface StoryWizardProps {
	projectId: string;
	onComplete: () => void;
	templates?: StoryTemplate[];
}

export function StoryWizard({
	projectId,
	onComplete,
	templates = STORY_TEMPLATES,
}: StoryWizardProps): React.JSX.Element {
	const {
		step,
		setStep,
		prompt,
		setPrompt,
		style,
		setStyle,
		plan,
		handleGeneratePlan,
		handleCreateStory,
		applyTemplate,
		updatePlan,
		updateChapter,
		deleteChapter,
		addChapter,
	} = useStoryWizard(projectId, onComplete);

	return (
		<div className="flex flex-col items-center justify-start md:justify-center min-h-full w-full max-w-4xl mx-auto p-4 md:p-6 pb-32">
			<AnimatePresence mode="wait">
				{step === "input" && (
					<WizardInputStep
						templates={templates}
						prompt={prompt}
						style={style}
						onPromptChange={setPrompt}
						onStyleChange={setStyle}
						onApplyTemplate={applyTemplate}
						onGenerate={handleGeneratePlan}
					/>
				)}

				{step === "generating" && <WizardGeneratingStep />}

				{step === "creating" && (
					<WizardGeneratingStep message="Building your story structure..." />
				)}

				{step === "review" && plan && (
					<WizardReviewStep
						plan={plan}
						onUpdatePlan={updatePlan}
						onUpdateChapter={updateChapter}
						onDeleteChapter={deleteChapter}
						onAddChapter={addChapter}
						onRestart={() => setStep("input")}
						onCreateStory={handleCreateStory}
					/>
				)}
			</AnimatePresence>
		</div>
	);
}
