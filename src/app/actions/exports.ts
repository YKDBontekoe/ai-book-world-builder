"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db/drizzle";
import { bookExport } from "@/lib/db/schema";

export async function deleteBulkExports(exportIds: string[]) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" };
		}

		if (exportIds.length === 0) {
			return { success: true };
		}

		// Perform the deletion, ensuring the user owns the exports
		await db
			.delete(bookExport)
			.where(
				and(
					eq(bookExport.userId, session.user.id),
					inArray(bookExport.id, exportIds),
				),
			);

		revalidatePath("/exports");
		return { success: true };
	} catch (error) {
		console.error("Failed to delete bulk exports", error);
		return { success: false, error: "Failed to delete exports" };
	}
}
