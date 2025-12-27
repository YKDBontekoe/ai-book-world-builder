"use client";

import { useCallback, useState } from "react";
import {
	DEFAULT_WIZARD_STATE,
	type GenerationWizardState,
	type WizardStep,
} from "../types";

const STEP_ORDER: WizardStep[] = [
	"context",
	"style",
	"structure",
	"advanced",
	"review",
];

/**
 * Hook for managing generation wizard state.
 */
export function useGenerationWizard(projectId: string) {
	const [state, setState] = useState<GenerationWizardState>(DEFAULT_WIZARD_STATE);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const currentStepIndex = STEP_ORDER.indexOf(state.step);
	const isFirstStep = currentStepIndex === 0;
	const isLastStep = currentStepIndex === STEP_ORDER.length - 1;

	const goToStep = useCallback((step: WizardStep) => {
		setState((prev) => ({ ...prev, step }));
	}, []);

	const nextStep = useCallback(() => {
		if (!isLastStep) {
			const nextIndex = currentStepIndex + 1;
			setState((prev) => ({ ...prev, step: STEP_ORDER[nextIndex] }));
		}
	}, [currentStepIndex, isLastStep]);

	const prevStep = useCallback(() => {
		if (!isFirstStep) {
			const prevIndex = currentStepIndex - 1;
			setState((prev) => ({ ...prev, step: STEP_ORDER[prevIndex] }));
		}
	}, [currentStepIndex, isFirstStep]);

	const updateContext = useCallback(
		(updates: Partial<GenerationWizardState["context"]>) => {
			setState((prev) => ({
				...prev,
				context: { ...prev.context, ...updates },
			}));
		},
		[],
	);

	const updateStyle = useCallback(
		(updates: Partial<GenerationWizardState["style"]>) => {
			setState((prev) => ({
				...prev,
				style: { ...prev.style, ...updates },
			}));
		},
		[],
	);

	const updateStructure = useCallback(
		(updates: Partial<GenerationWizardState["structure"]>) => {
			setState((prev) => ({
				...prev,
				structure: { ...prev.structure, ...updates },
			}));
		},
		[],
	);

	const updateAdvanced = useCallback(
		(updates: Partial<GenerationWizardState["advanced"]>) => {
			setState((prev) => ({
				...prev,
				advanced: { ...prev.advanced, ...updates },
			}));
		},
		[],
	);

	const updateMetadata = useCallback(
		(
			updates: Partial<
				Pick<
					GenerationWizardState,
					"bookTitle" | "bookSubtitle" | "authorName" | "genre"
				>
			>,
		) => {
			setState((prev) => ({ ...prev, ...updates }));
		},
		[],
	);

	const reset = useCallback(() => {
		setState(DEFAULT_WIZARD_STATE);
		setIsSubmitting(false);
	}, []);

	return {
		state,
		currentStepIndex,
		totalSteps: STEP_ORDER.length,
		isFirstStep,
		isLastStep,
		isSubmitting,
		setIsSubmitting,
		goToStep,
		nextStep,
		prevStep,
		updateContext,
		updateStyle,
		updateStructure,
		updateAdvanced,
		updateMetadata,
		reset,
		projectId,
	};
}

export type UseGenerationWizardReturn = ReturnType<typeof useGenerationWizard>;
