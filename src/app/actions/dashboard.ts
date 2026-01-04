"use server";

import { z } from "zod";
import { createUserAction } from "@/lib/action-middleware";
import { getGlobalStats, getProjectStats } from "@/lib/dashboard-queries";
import { getProjectByIdWithAccess } from "@/lib/db/queries";
import { NotFoundError } from "@/lib/errors";

// ============================================================================
// Validation Schemas
// ============================================================================

const dashboardStatsSchema = z.object({
	projectId: z.string().uuid().optional(),
});

// ============================================================================
// Actions
// ============================================================================

/**
 * Get dashboard statistics for a project or globally
 */
export const getDashboardStatsAction = createUserAction({
	input: dashboardStatsSchema,
	handler: async ({ user, input }) => {
		if (input.projectId) {
			const project = await getProjectByIdWithAccess({
				id: input.projectId,
				userId: user.id,
			});

			if (!project) {
				throw NotFoundError.forResource("Project", input.projectId);
			}

			const stats = await getProjectStats(input.projectId);
			return { stats };
		}

		// Global Scope
		const stats = await getGlobalStats(user.id);
		return { stats };
	},
});
