"use client";

import { MessageSquarePlus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/button";
import { FeedbackDialog } from "./feedback-dialog";

export function FeedbackButton() {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button
				variant="ghost"
				size="icon"
				onClick={() => setOpen(true)}
				title="Send Feedback"
			>
				<MessageSquarePlus className="h-5 w-5" />
				<span className="sr-only">Send Feedback</span>
			</Button>
			<FeedbackDialog open={open} onOpenChange={setOpen} />
		</>
	);
}
