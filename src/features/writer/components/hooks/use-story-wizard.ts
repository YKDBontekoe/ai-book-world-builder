import { useState } from "react";
import { toast } from "sonner";
import {
	createBookFromPlan,
	generateBookPlan,
} from "@/app/actions/story-generation";
import type {
	BookPlan,
	StoryStyle,
} from "@/lib/services/schemas/story-schemas";
import type { StoryTemplate } from "@/lib/story-templates";

const DEFAULT_STYLE: StoryStyle = {
	genre: "General Fiction",
	pov: "Third Person Limited",
	tone: "Neutral",
};

export type WizardStep = "input" | "generating" | "review" | "creating";

export interface UseStoryWizardReturn {
	step: WizardStep;
	setStep: (step: WizardStep) => void;
	prompt: string;
	setPrompt: (prompt: string) => void;
	style: StoryStyle;
	setStyle: (style: StoryStyle) => void;
	plan: BookPlan | null;
	handleGeneratePlan: () => Promise<void>;
	handleCreateStory: () => Promise<void>;
	applyTemplate: (template: StoryTemplate) => void;
	updatePlan: (field: keyof BookPlan, value: string) => void;
	updateChapter: (
		index: number,
		field: "title" | "summary",
		value: string,
	) => void;
	deleteChapter: (index: number) => void;
	addChapter: () => void;
}

export function useStoryWizard(
	projectId: string,
	onComplete: () => void,
): UseStoryWizardReturn {
	const [step, setStep] = useState<WizardStep>("input");
	const [prompt, setPrompt] = useState("");
	const [style, setStyle] = useState<StoryStyle>(DEFAULT_STYLE);
	const [plan, setPlan] = useState<BookPlan | null>(null);

	const handleGeneratePlan = async () => {
		if (!prompt.trim()) return;

		setStep("generating");
		try {
			const result = await generateBookPlan(prompt, style);
			if (result.success && result.plan) {
				setPlan(result.plan);
				setStep("review");
			} else {
				toast.error("Failed to generate plan. Please try again.");
				setStep("input");
			}
		} catch (_error) {
			toast.error("Could not generate story plan. Please try again.");
			setStep("input");
		}
	};

	const handleCreateStory = async () => {
		if (!plan) return;

		setStep("creating");
		const toastId = toast.loading("Building your story structure...");

		try {
			const result = await createBookFromPlan(projectId, plan, style);
			if (result.success) {
				toast.success("Story structure created!", { id: toastId });
				// Trigger a reload or update
				onComplete();
			} else {
				toast.error("Failed to save story.", { id: toastId });
				setStep("review");
			}
		} catch (_error) {
			toast.error("An error occurred.", { id: toastId });
			setStep("review");
		}
	};

	const applyTemplate = (template: StoryTemplate) => {
		setPrompt(template.prompt);
		setStyle(template.style);
		toast.success(`Applied "${template.label}" template`);
	};

	const updatePlan = (field: keyof BookPlan, value: string) => {
		if (!plan) return;
		setPlan({ ...plan, [field]: value });
	};

	const updateChapter = (
		index: number,
		field: "title" | "summary",
		value: string,
	) => {
		if (!plan) return;
		const newChapters = [...plan.chapters];
		newChapters[index] = { ...newChapters[index], [field]: value };
		setPlan({ ...plan, chapters: newChapters });
	};

	const deleteChapter = (index: number) => {
		if (!plan) return;
		const newChapters = plan.chapters.filter((_, i) => i !== index);
		setPlan({ ...plan, chapters: newChapters });
	};

	const addChapter = () => {
		if (!plan) return;
		setPlan({
			...plan,
			chapters: [
				...plan.chapters,
				{ title: "New Chapter", summary: "Describe what happens..." },
			],
		});
	};

	return {
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
	};
}
