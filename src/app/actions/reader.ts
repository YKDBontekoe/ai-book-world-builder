"use server";

import { z } from "zod";
import { createUserAction } from "@/lib/action-middleware";
import { saveReadingProgressQuery } from "@/lib/db/queries/reader";
import { projectRepository } from "@/lib/db/repositories";
import { NotFoundError } from "@/lib/errors";

// ============================================================================
// Validation Schemas
// ============================================================================

const saveProgressSchema = z.object({
	projectId: z.string().uuid("Invalid project ID"),
	chapterId: z.string().uuid("Invalid chapter ID"),
	progress: z.number().min(0).max(100),
});

// ============================================================================
// Actions
// ============================================================================

/**
 * Save reading progress for a project
 */
export const saveReadingProgress = createUserAction({
	input: saveProgressSchema,
	handler: async ({ user, input }) => {
		// Verify project access
		const project = await projectRepository.findByIdWithAccess(
			input.projectId,
			user.id,
		);

		if (!project) {
			throw NotFoundError.forResource("Project", input.projectId);
		}

		await saveReadingProgressQuery({
			projectId: input.projectId,
			userId: user.id,
			chapterId: input.chapterId,
			progress: input.progress,
		});

		return { success: true };
	},
});
