"use client";

import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";
import type { JSX } from "react";
import { ScrollArea } from "@/components/atoms/scroll-area";
import type { JulesActivity, JulesPlanStep } from "@/lib/jules-client";

interface PlanProgressProps {
	activities: JulesActivity[];
}

/**
 * Visualizes the progress of a Jules plan, showing steps and their statuses.
 *
 * @param activities - The list of activities from the Jules session containing plan updates.
 * @returns The PlanProgress component or null if no plan is found.
 */
export function PlanProgress({
	activities,
}: PlanProgressProps): JSX.Element | null {
	// Find the latest plan
	const planActivity = [...activities]
		.reverse()
		.find((a) => a.planGenerated?.plan);

	const plan = planActivity?.planGenerated?.plan;

	if (!plan) {
		return (
			<div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
				<Loader2 className="h-8 w-8 mb-4 animate-spin opacity-20" />
				<p>Waiting for plan generation...</p>
			</div>
		);
	}

	return (
		<ScrollArea className="h-full">
			<div className="p-4 space-y-6">
				<div>
					<h3 className="font-semibold text-lg mb-1">Session Plan</h3>
					<p className="text-xs text-muted-foreground">
						Plan ID: {plan.id.split("-").pop()} • {plan.steps.length} Steps
					</p>
				</div>

				<div className="relative border-l-2 border-muted ml-3 space-y-8 pb-4">
					{plan.steps.map((step, index) => (
						<PlanStepItem key={step.id || index} step={step} />
					))}
				</div>
			</div>
		</ScrollArea>
	);
}

function PlanStepItem({ step }: { step: JulesPlanStep }) {
	let Icon = Circle;
	let colorClass = "border-muted";
	let iconClass = "text-muted-foreground";

	switch (step.state) {
		case "COMPLETED":
			Icon = CheckCircle2;
			colorClass = "border-green-500/50 bg-green-500/5";
			iconClass = "text-green-500 fill-background";
			break;
		case "IN_PROGRESS":
			Icon = Loader2;
			colorClass =
				"border-blue-500/50 bg-blue-500/5 shadow-sm ring-1 ring-blue-500/20";
			iconClass = "text-blue-500 animate-spin";
			break;
		case "FAILED":
			Icon = XCircle;
			colorClass = "border-red-500/50 bg-red-500/5";
			iconClass = "text-red-500 fill-background";
			break;
		default:
			Icon = Circle;
			iconClass = "text-muted-foreground fill-background";
			break;
	}

	return (
		<div className="relative pl-8">
			{/* Connector dot */}
			<span
				className={`absolute -left-[9px] top-0 flex items-center justify-center rounded-full bg-background ${iconClass}`}
			>
				<Icon className="h-5 w-5" />
			</span>

			<div className={`rounded-lg border p-3 ${colorClass} transition-colors`}>
				<div className="flex items-center justify-between mb-1">
					<h4
						className={`font-medium text-sm ${step.state === "COMPLETED" ? "text-muted-foreground" : ""}`}
					>
						{step.title}
					</h4>
					{step.state && step.state !== "STATE_UNSPECIFIED" && (
						<span className="text-[10px] font-mono uppercase text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
							{step.state.replace(/_/g, " ")}
						</span>
					)}
				</div>
				<p className="text-xs text-muted-foreground leading-relaxed">
					{step.description}
				</p>
			</div>
		</div>
	);
}
