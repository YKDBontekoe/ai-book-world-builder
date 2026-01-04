"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { submitFeedbackAction } from "@/app/actions/feedback";
import { Button } from "@/components/atoms/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/atoms/dialog";
import { Textarea } from "@/components/atoms/textarea";
import { toast } from "@/components/atoms/toast";

interface FeedbackDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
	const [content, setContent] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async () => {
		if (!content.trim()) return;
		setIsSubmitting(true);
		const result = await submitFeedbackAction({
			type: "general",
			content,
			meta: { url: window.location.href },
		});
		setIsSubmitting(false);

		if (result.success) {
			toast({ type: "success", description: "Feedback submitted! Thank you." });
			setContent("");
			onOpenChange(false);
		} else {
			toast({ type: "error", description: "Failed to submit feedback." });
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Send Feedback</DialogTitle>
					<DialogDescription>
						Help us improve by sharing your thoughts or reporting issues.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<Textarea
						placeholder="Tell us what you think..."
						value={content}
						onChange={(e) => setContent(e.target.value)}
						className="min-h-[100px]"
					/>
				</div>
				<DialogFooter>
					<Button variant="ghost" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={isSubmitting || !content.trim()}
					>
						{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Submit
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
