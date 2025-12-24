"use server";

import { auth } from "@/app/(auth)/auth";
import type { FeedbackType } from "@/lib/db/schema/feedback";
import { createFeedback } from "@/lib/services/feedback-service";

export async function submitFeedbackAction(data: {
	type: FeedbackType;
	content: string;
	meta?: any;
}) {
	const session = await auth();
	const userId = session?.user?.id;

	try {
		await createFeedback({
			userId,
			type: data.type,
			content: data.content,
			meta: data.meta,
		});
		return { success: true };
	} catch (error) {
		console.error("Failed to submit feedback", error);
		return { success: false, error: "Failed to submit feedback" };
	}
}
