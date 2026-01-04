"use server";

import { eq } from "drizzle-orm";
import { createUserAction } from "@/lib/action-middleware";
import { db } from "@/lib/db/drizzle";
import { account } from "@/lib/db/schema";

// ============================================================================
// Actions
// ============================================================================

/**
 * Get connected OAuth accounts for the current user
 */
export const getConnectedAccounts = createUserAction({
	handler: async ({ user }) => {
		const accounts = await db
			.select({
				provider: account.provider,
			})
			.from(account)
			.where(eq(account.userId, user.id));

		return accounts;
	},
});
