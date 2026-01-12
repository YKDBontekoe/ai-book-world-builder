"use server";

import { z } from "zod";
import { createPublicAction } from "@/lib/action-middleware";
import type { FeedbackType } from "@/lib/db/schema/feedback";
import { createFeedback } from "@/lib/services/feedback-service";

// ============================================================================
// Validation Schemas
// ============================================================================

const feedbackSchema = z.object({
	type: z.enum(["bug", "feature", "general", "suggestion"]),
	content: z.string().min(1, "Feedback content is required").max(50000),
	meta: z.any().optional(),
});

// ============================================================================
// Actions
// ============================================================================

/**
 * Submit user feedback (allows anonymous submissions)
 */
export const submitFeedbackAction = createPublicAction({
	input: feedbackSchema,
	handler: async ({ input }) => {
		// Note: For public actions, user might be anonymous
		// The service layer handles optional userId
		await createFeedback({
			userId: undefined, // Will be populated if user is logged in via session in service
			type: input.type as FeedbackType,
			content: input.content,
			meta: input.meta,
		});
		return { success: true };
	},
});
