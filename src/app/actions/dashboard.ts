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
	from: z.string().datetime().optional(),
	to: z.string().datetime().optional(),
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
		const dateRange = {
			from: input.from ? new Date(input.from) : undefined,
			to: input.to ? new Date(input.to) : undefined,
		};

		if (input.projectId) {
			const project = await getProjectByIdWithAccess({
				id: input.projectId,
				userId: user.id,
			});

			if (!project) {
				throw NotFoundError.forResource("Project", input.projectId);
			}

			const stats = await getProjectStats(input.projectId, dateRange);

			// Security: Redact sensitive billing/usage info for non-owners (public viewers)
			if (project.userId !== user.id) {
				stats.tokenStats = {
					totalCost: 0,
					totalInputTokens: 0,
					totalOutputTokens: 0,
					byModel: {},
					byFeature: {
						chat: { cost: 0, inputTokens: 0, outputTokens: 0 },
						generation: { cost: 0, inputTokens: 0, outputTokens: 0 },
					},
				};
				stats.usageHistory = stats.usageHistory.map((h) => ({
					...h,
					cost: 0,
					tokens: 0,
				}));
			}

			return { stats };
		}

		// Global Scope
		const stats = await getGlobalStats(user.id, dateRange);
		return { stats };
	},
});
