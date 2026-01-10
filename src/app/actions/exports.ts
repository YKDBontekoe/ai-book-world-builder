"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createUserAction } from "@/lib/action-middleware";
import { db } from "@/lib/db";
import { bookExport } from "@/lib/db/schema";

// ============================================================================
// Validation Schemas
// ============================================================================

const bulkDeleteSchema = z.object({
	exportIds: z.array(z.string().uuid()),
});

// ============================================================================
// Actions
// ============================================================================

/**
 * Delete multiple exports owned by the current user
 */
export const deleteBulkExports = createUserAction({
	input: bulkDeleteSchema,
	handler: async ({ user, input }) => {
		if (input.exportIds.length === 0) {
			return { success: true };
		}

		// Perform the deletion, ensuring the user owns the exports
		await db
			.delete(bookExport)
			.where(
				and(
					eq(bookExport.userId, user.id),
					inArray(bookExport.id, input.exportIds),
				),
			);

		revalidatePath("/exports");
		return { success: true };
	},
});
