"use server";

import { auth } from "@/app/(auth)/auth";
import { getGlobalStats, getProjectStats } from "@/lib/dashboard-queries";
import { getProjectByIdWithAccess } from "@/lib/db/queries";

export async function getDashboardStatsAction(projectId?: string) {
	const session = await auth();
	if (!session?.user?.id) return { error: "Unauthorized" };

	try {
		if (projectId) {
			const project = await getProjectByIdWithAccess({
				id: projectId,
				userId: session.user.id,
			});

			if (!project) {
				return { error: "Project not found or access denied" };
			}

			const stats = await getProjectStats(projectId);
			return { stats };
		} else {
			// Global Scope
			const stats = await getGlobalStats(session.user.id);
			return { stats };
		}
	} catch (error) {
		console.error("Dashboard stats error:", error);
		return { error: "Failed to fetch stats" };
	}
}
