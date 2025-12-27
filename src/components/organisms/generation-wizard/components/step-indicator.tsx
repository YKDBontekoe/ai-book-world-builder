"use client";

import { BookOpen, FileText, Palette, Settings, Sparkles } from "lucide-react";
import type { UseGenerationWizardReturn } from "../hooks/use-generation-wizard";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
	wizard: UseGenerationWizardReturn;
}

const STEPS = [
	{ id: "context", label: "Context", icon: FileText },
	{ id: "style", label: "Style", icon: Palette },
	{ id: "structure", label: "Structure", icon: BookOpen },
	{ id: "advanced", label: "Advanced", icon: Settings },
	{ id: "review", label: "Launch", icon: Sparkles },
] as const;

export function StepIndicator({ wizard }: StepIndicatorProps) {
	const { currentStepIndex } = wizard;

	return (
		<div className="flex items-center justify-center gap-2 mb-8">
			{STEPS.map((step, index) => {
				const Icon = step.icon;
				const isActive = index === currentStepIndex;
				const isCompleted = index < currentStepIndex;

				return (
					<div key={step.id} className="flex items-center">
						<button
							type="button"
							onClick={() => wizard.goToStep(step.id)}
							disabled={index > currentStepIndex}
							className={cn(
								"flex items-center gap-2 px-3 py-2 rounded-lg transition-all",
								isActive && "bg-primary text-primary-foreground",
								isCompleted &&
									"bg-primary/10 text-primary hover:bg-primary/20",
								!isActive &&
									!isCompleted &&
									"text-muted-foreground cursor-not-allowed",
							)}
						>
							<Icon className="w-4 h-4" />
							<span className="text-sm font-medium hidden sm:inline">
								{step.label}
							</span>
						</button>
						{index < STEPS.length - 1 && (
							<div
								className={cn(
									"w-8 h-0.5 mx-1",
									index < currentStepIndex
										? "bg-primary"
										: "bg-border",
								)}
							/>
						)}
					</div>
				);
			})}
		</div>
	);
}
