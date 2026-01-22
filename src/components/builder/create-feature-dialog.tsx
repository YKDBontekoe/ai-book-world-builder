"use client";

import { useMutation } from "@tanstack/react-query";
import {
	Brain,
	CheckCircle,
	Hammer,
	Layout,
	Loader2,
	Sparkles,
} from "lucide-react";
import type { JSX } from "react";
import { useState } from "react";
import { toast } from "sonner";
import { executeFeaturePlanAction } from "@/app/actions/github";
import { planFeatureAction } from "@/app/actions/jules-ai";
import { Button } from "@/components/atoms/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/atoms/dialog";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { ScrollArea } from "@/components/atoms/scroll-area";
import { Textarea } from "@/components/atoms/textarea";

type FeaturePlan = {
	parentIssue: {
		title: string;
		body: string;
		labels: string[];
	};
	childIssues: Array<{
		title: string;
		body: string;
		labels: string[];
	}>;
};

export interface CreateFeatureDialogProps {
	defaultSource?: string;
	initialTitle?: string;
	initialDescription?: string;
	onOpenChange?: (open: boolean) => void;
	trigger?: React.ReactNode;
}

export function CreateFeatureDialog({
	// biome-ignore lint/correctness/noUnusedFunctionParameters: kept for compatibility
	defaultSource,
	initialTitle = "",
	initialDescription = "",
	onOpenChange,
	trigger,
}: CreateFeatureDialogProps): JSX.Element {
	const [open, setOpen] = useState(false);
	const [step, setStep] = useState<"input" | "review" | "success">("input");
	const [title, setTitle] = useState(initialTitle);
	const [description, setDescription] = useState(initialDescription);
	const [plan, setPlan] = useState<FeaturePlan | null>(null);
	const [createdIds, setCreatedIds] = useState<{
		parentNumber: number;
		createdIssues: number[];
	} | null>(null);

	const handleOpenChange = (newOpen: boolean) => {
		setOpen(newOpen);
		onOpenChange?.(newOpen);
		if (!newOpen) {
			// Reset state after a delay to allow animation
			setTimeout(() => {
				setStep("input");
				setPlan(null);
				setCreatedIds(null);
				if (!initialTitle) setTitle("");
				if (!initialDescription) setDescription("");
			}, 300);
		}
	};

	// --- Actions ---

	const { mutate: generatePlan, isPending: isGenerating } = useMutation({
		mutationFn: async () => {
			const res = await planFeatureAction({ title, description });
			if (!res.success) throw new Error(res.error);
			return res.data;
		},
		onSuccess: (data) => {
			setPlan(data);
			setStep("review");
		},
		onError: (err) => {
			toast.error(err.message);
		},
	});

	const { mutate: executePlan, isPending: isExecuting } = useMutation({
		mutationFn: async () => {
			if (!plan) throw new Error("No plan to execute");
			const res = await executeFeaturePlanAction(plan);
			if (!res.success) throw new Error(res.error);
			return res.data;
		},
		onSuccess: (data) => {
			setCreatedIds(data);
			setStep("success");
			toast.success(`Feature created! Issue #${data.parentNumber}`);
		},
		onError: (err) => {
			toast.error(err.message);
		},
	});

	// --- Renders ---

	const renderInputStep = () => (
		<div className="space-y-4 py-4">
			<div className="space-y-2">
				<Label>Feature Name</Label>
				<Input
					placeholder="e.g. User Authentication System"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					autoFocus
				/>
			</div>
			<div className="space-y-2">
				<Label>Description / Requirements</Label>
				<Textarea
					placeholder="Describe the feature in detail..."
					className="h-32"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
				/>
				<p className="text-xs text-muted-foreground">
					Jules will use this context to generate a detailed implementation
					plan.
				</p>
			</div>
		</div>
	);

	const renderReviewStep = () => {
		if (!plan) return null;
		return (
			<ScrollArea className="h-[400px] pr-4">
				<div className="space-y-6">
					<div className="border rounded-lg p-4 bg-muted/30">
						<div className="flex items-center gap-2 mb-2">
							<Layout className="w-4 h-4 text-primary" />
							<h3 className="font-semibold text-sm">Parent Issue (Epic)</h3>
						</div>
						<div className="font-medium text-lg">{plan.parentIssue.title}</div>
						<div className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
							{plan.parentIssue.body}
						</div>
					</div>

					<div className="space-y-3">
						<h3 className="font-semibold text-sm flex items-center gap-2">
							<CheckCircle className="w-4 h-4 text-muted-foreground" />
							Implementation Tasks ({plan.childIssues.length})
						</h3>
						{plan.childIssues.map((issue, i) => (
							<div
								// biome-ignore lint/suspicious/noArrayIndexKey: no stable id for draft plan items
								key={i}
								className="border rounded-lg p-3 text-sm hover:bg-muted/50 transition-colors"
							>
								<div className="font-medium">{issue.title}</div>
								<div className="text-xs text-muted-foreground mt-1 line-clamp-2">
									{issue.body}
								</div>
							</div>
						))}
					</div>
				</div>
			</ScrollArea>
		);
	};

	const renderSuccessStep = () => (
		<div className="py-8 text-center space-y-4">
			<div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
				<CheckCircle className="w-8 h-8" />
			</div>
			<h3 className="text-xl font-semibold">Feature Planned Successfully!</h3>
			<p className="text-muted-foreground">
				Created Issue #{createdIds?.parentNumber} and{" "}
				{createdIds && createdIds.createdIssues.length - 1} sub-tasks.
			</p>
		</div>
	);

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				{trigger || (
					<Button variant="outline" className="gap-2 h-7 text-xs">
						<Hammer className="h-3 w-3" />
						Plan Feature
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>
						{step === "input" && "Plan a New Feature"}
						{step === "review" && "Review AI Plan"}
						{step === "success" && "Success"}
					</DialogTitle>
					<DialogDescription>
						{step === "input" &&
							"Describe your feature. Jules will architect the solution."}
						{step === "review" &&
							"Review the proposed breakdown before creating issues."}
						{step === "success" && "Your feature roadmap has been created."}
					</DialogDescription>
				</DialogHeader>

				{step === "input" && renderInputStep()}
				{step === "review" && renderReviewStep()}
				{step === "success" && renderSuccessStep()}

				<DialogFooter>
					{step === "input" && (
						<>
							<Button variant="ghost" onClick={() => setOpen(false)}>
								Cancel
							</Button>
							<Button
								onClick={() => generatePlan()}
								disabled={!title.trim() || isGenerating}
								className="gap-2"
							>
								{isGenerating ? (
									<Loader2 className="w-4 h-4 animate-spin" />
								) : (
									<Brain className="w-4 h-4" />
								)}
								Generate Plan
							</Button>
						</>
					)}

					{step === "review" && (
						<>
							<Button variant="ghost" onClick={() => setStep("input")}>
								Back
							</Button>
							<Button
								onClick={() => executePlan()}
								disabled={isExecuting}
								className="gap-2"
							>
								{isExecuting ? (
									<Loader2 className="w-4 h-4 animate-spin" />
								) : (
									<Sparkles className="w-4 h-4" />
								)}
								Create Issues
							</Button>
						</>
					)}

					{step === "success" && (
						<Button onClick={() => setOpen(false)}>Done</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
