"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createJulesSessionAction } from "@/app/actions/jules";
import { Button } from "@/components/atoms/button";
import { Checkbox } from "@/components/atoms/checkbox";
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

export function CreateSessionDialog({
	defaultSource,
}: {
	defaultSource?: string;
}) {
	const [open, setOpen] = useState(false);
	const [prompt, setPrompt] = useState("");
	const [title, setTitle] = useState("");
	const [requireApproval, setRequireApproval] = useState(true);
	const queryClient = useQueryClient();

	const { mutate, isPending } = useMutation({
		mutationFn: async () => {
			if (!defaultSource) throw new Error("No source repository configured");
			const result = await createJulesSessionAction({
				prompt,
				title: title || undefined,
				sourceName: defaultSource,
				requirePlanApproval: requireApproval,
			});
			if (!result.success) throw new Error(result.error);
			return result;
		},
		onSuccess: () => {
			setOpen(false);
			setPrompt("");
			setTitle("");
			setRequireApproval(true);
			toast.success("Jules session started");
			queryClient.invalidateQueries({ queryKey: ["jules", "sessions"] });
		},
		onError: (err) => {
			toast.error(err.message || "Failed to start session");
		},
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className="gap-2">
					<Plus className="h-4 w-4" />
					New Session
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Start a Jules Session</DialogTitle>
					<DialogDescription>
						Give Jules a task to work on. It will create a plan and can open a
						PR automatically.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label>Title (Optional)</Label>
						<Input
							placeholder="e.g. Fix login bug"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<Label>Task Description</Label>
						<Textarea
							placeholder="Describe what you want Jules to do..."
							className="h-32"
							value={prompt}
							onChange={(e) => setPrompt(e.target.value)}
						/>
					</div>
					<div className="flex items-center space-x-2">
						<Checkbox
							id="approval"
							checked={requireApproval}
							onCheckedChange={(c) => setRequireApproval(!!c)}
						/>
						<Label
							htmlFor="approval"
							className="text-sm font-normal cursor-pointer"
						>
							Require plan approval before execution
						</Label>
					</div>
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => setOpen(false)}
						disabled={isPending}
					>
						Cancel
					</Button>
					<Button
						onClick={() => mutate()}
						disabled={isPending || !prompt.trim()}
						className="gap-2"
					>
						{isPending ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<Sparkles className="h-4 w-4" />
						)}
						Start Session
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
