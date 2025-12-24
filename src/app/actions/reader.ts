"use server";

import { ensureProjectAccess } from "@/lib/actions-utils";
import { saveReadingProgressQuery } from "@/lib/db/queries/reader";

export async function saveReadingProgress(
	projectId: string,
	chapterId: string,
	progress: number,
) {
	try {
		const { user } = await ensureProjectAccess(projectId, false);

		// Safety check: ensure userId is present (ensureProjectAccess throws if not, but TS might need help)
		if (!user.id) throw new Error("User ID missing");

		await saveReadingProgressQuery({
			projectId,
			userId: user.id,
			chapterId,
			progress,
		});

		return { success: true };
	} catch (error) {
		console.error("Failed to save reading progress:", error);
		return { success: false, error: "Failed to save progress" };
	}
}
