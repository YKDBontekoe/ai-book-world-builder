"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, Rocket } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { startFullBookGeneration } from "@/app/actions/ai-operations";
import { Button } from "@/components/atoms/button";
import { Card } from "@/components/atoms/card";
import { StepIndicator } from "./components/step-indicator";
import { useGenerationWizard } from "./hooks/use-generation-wizard";
import { AdvancedStep } from "./steps/advanced-step";
import { ContextStep } from "./steps/context-step";
import { ReviewStep } from "./steps/review-step";
import { StructureStep } from "./steps/structure-step";
import { StyleStep } from "./steps/style-step";
import { toGenerationSettings } from "./types";

interface GenerationWizardProps {
	projectId: string;
	onComplete?: (generationId: string) => void;
	onCancel?: () => void;
}

export function GenerationWizard({
	projectId,
	onComplete,
	onCancel,
}: GenerationWizardProps) {
	const wizard = useGenerationWizard(projectId);
	const router = useRouter();

	const handleLaunch = async () => {
		wizard.setIsSubmitting(true);

		try {
			const settings = toGenerationSettings(wizard.state);
			const result = await startFullBookGeneration(projectId, settings);

			if (result.success && result.generationId) {
				toast.success("Generation started!", {
					description: "Your book is being written...",
				});

				if (onComplete) {
					onComplete(result.generationId);
				} else {
					// Navigate to generation dashboard
					router.push(
						`/writer/${projectId}?generation=${result.generationId}`,
					);
				}
			} else {
				toast.error("Failed to start generation", {
					description: result.error,
				});
			}
		} catch (error) {
			toast.error("An error occurred", {
				description: error instanceof Error ? error.message : "Unknown error",
			});
		} finally {
			wizard.setIsSubmitting(false);
		}
	};

	const renderStep = () => {
		switch (wizard.state.step) {
			case "context":
				return <ContextStep wizard={wizard} />;
			case "style":
				return <StyleStep wizard={wizard} />;
			case "structure":
				return <StructureStep wizard={wizard} />;
			case "advanced":
				return <AdvancedStep wizard={wizard} />;
			case "review":
				return <ReviewStep wizard={wizard} />;
			default:
				return null;
		}
	};

	return (
		<div className="flex flex-col h-full max-w-3xl mx-auto px-4 py-6">
			{/* Header */}
			<div className="text-center mb-6">
				<h2 className="text-2xl font-bold tracking-tight">
					Generate Your Book
				</h2>
				<p className="text-muted-foreground mt-1">
					Configure your settings and launch the AI writing pipeline
				</p>
			</div>

			{/* Step Indicator */}
			<StepIndicator wizard={wizard} />

			{/* Step Content */}
			<Card className="flex-1 overflow-hidden p-6">
				<AnimatePresence mode="wait">
					<motion.div
						key={wizard.state.step}
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -20 }}
						transition={{ duration: 0.2 }}
						className="h-full overflow-y-auto"
					>
						{renderStep()}
					</motion.div>
				</AnimatePresence>
			</Card>

			{/* Navigation */}
			<div className="flex items-center justify-between mt-6">
				<div>
					{wizard.isFirstStep ? (
						onCancel && (
							<Button variant="ghost" onClick={onCancel}>
								Cancel
							</Button>
						)
					) : (
						<Button variant="outline" onClick={wizard.prevStep}>
							<ArrowLeft className="w-4 h-4 mr-2" />
							Back
						</Button>
					)}
				</div>

				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					Step {wizard.currentStepIndex + 1} of {wizard.totalSteps}
				</div>

				<div>
					{wizard.isLastStep ? (
						<Button
							onClick={handleLaunch}
							disabled={wizard.isSubmitting}
							className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
						>
							{wizard.isSubmitting ? (
								<>
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									Starting...
								</>
							) : (
								<>
									<Rocket className="w-4 h-4 mr-2" />
									Launch Generation
								</>
							)}
						</Button>
					) : (
						<Button onClick={wizard.nextStep}>
							Next
							<ArrowRight className="w-4 h-4 ml-2" />
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
