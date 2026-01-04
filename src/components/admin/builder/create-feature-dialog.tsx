"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Hammer, Loader2, Sparkles } from "lucide-react";
import type { JSX } from "react";
import { useState } from "react";
import { toast } from "sonner";
import { createJulesSessionAction } from "@/app/actions/jules";
import { enhanceJulesPromptAction } from "@/app/actions/jules-ai";
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
import { Textarea } from "@/components/atoms/textarea";

export interface CreateFeatureDialogProps {
	defaultSource?: string;
}

/**
 * Dialog component for starting a "Feature Planning" session.
 * Tailored for high-level architectural tasks.
 */
export function CreateFeatureDialog({
	defaultSource,
}: CreateFeatureDialogProps): JSX.Element {
	const [open, setOpen] = useState(false);
	const [description, setDescription] = useState("");
	const [title, setTitle] = useState("");
	const queryClient = useQueryClient();

	const { mutate: enhancePrompt, isPending: isEnhancing } = useMutation({
		mutationFn: async (draft: string) => {
			const result = await enhanceJulesPromptAction({ draft });
			if (!result.success) throw new Error(result.error);
			return result.data;
		},
		onSuccess: (data) => {
			setDescription(data);
			toast.success("Prompt enhanced");
		},
		onError: (err) => {
			toast.error(err.message || "Failed to enhance prompt");
		},
	});

	const { mutate, isPending } = useMutation({
		mutationFn: async () => {
			if (!defaultSource) throw new Error("No source repository configured");

			// Construct a specialized "Architect" prompt
			const fullPrompt = `
I want to build a new feature: "${title}"

**Description:**
${description}

**Your Goal:**
1. Act as a Software Architect.
2. Create a detailed implementation plan.
3. Break this feature down into small, logical steps.
4. Once the plan is approved, proceed to implement the first step (creating a PR).
`;

			const result = await createJulesSessionAction({
				prompt: fullPrompt,
				title: title,
				sourceName: defaultSource,
				requirePlanApproval: true,
			});
			if (!result.success) throw new Error(result.error);
			return result;
		},
		onSuccess: () => {
			setOpen(false);
			setDescription("");
			setTitle("");
			toast.success("Feature planning started");
			queryClient.invalidateQueries({ queryKey: ["jules", "sessions"] });
		},
		onError: (err) => {
			toast.error(err.message || "Failed to start session");
		},
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" className="gap-2 h-7 text-xs">
					<Hammer className="h-3 w-3" />
					Plan Feature
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Plan a New Feature</DialogTitle>
					<DialogDescription>
						Describe the feature you want to build. Jules will act as an
						architect to plan and implement it.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label>Feature Name</Label>
						<Input
							placeholder="e.g. User Authentication System"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<div className="flex justify-between items-center">
							<Label>Requirements & User Story</Label>
							<Button
								variant="ghost"
								size="sm"
								className="h-6 text-xs text-primary gap-1"
								onClick={() => enhancePrompt(description)}
								disabled={isEnhancing || description.length < 5}
								type="button"
							>
								{isEnhancing ? (
									<Loader2 className="h-3 w-3 animate-spin" />
								) : (
									<Sparkles className="h-3 w-3" />
								)}
								Enhance
							</Button>
						</div>
						<Textarea
							placeholder="As a user, I want to..."
							className="h-40"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
						/>
					</div>
				</div>

				<DialogFooter>
					<Button
						variant="ghost"
						onClick={() => setOpen(false)}
						disabled={isPending}
					>
						Cancel
					</Button>
					<Button
						onClick={() => mutate()}
						disabled={isPending || !title.trim() || !description.trim()}
						className="gap-2"
					>
						{isPending ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<Sparkles className="h-4 w-4" />
						)}
						Start Planning
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
