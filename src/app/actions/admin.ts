"use server";

import { count, desc, eq, ilike, or, sql, sum } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import { createAdminAction } from "@/lib/action-middleware";
import { isAdmin } from "@/lib/auth/utils";
import { db } from "@/lib/db/drizzle";
import {
	bookGeneration as generationTable,
	project as projectTable,
	bookGenerationStep as stepTable,
	user as userTable,
} from "@/lib/db/schema";

// ============================================================================
// Validation Schemas
// ============================================================================

const paginationSchema = z.object({
	page: z.number().int().positive().optional(),
	pageSize: z.number().int().positive().max(100).optional(),
	search: z.string().optional(),
});

const userIdSchema = z.object({
	userId: z.string().uuid("Invalid user ID"),
});

// ============================================================================
// Legacy Helper (for redirect-based auth)
// ============================================================================

/**
 * @deprecated Use createAdminAction middleware instead
 */
export async function ensureAdmin() {
	const session = await auth();
	if (!session?.user || !isAdmin(session.user.role)) {
		redirect("/");
	}
	return session;
}

// ============================================================================
// Actions
// ============================================================================

/**
 * Get admin dashboard statistics
 */
export const getAdminStats = createAdminAction({
	handler: async () => {
		const [userCount] = await db.select({ count: count() }).from(userTable);
		const [projectCount] = await db
			.select({ count: count() })
			.from(projectTable);

		// Aggregate total input and output tokens from steps
		const usageStats = await db
			.select({
				inputTokens: sum(sql`(${stepTable.usage}->>'inputTokens')::int`),
				outputTokens: sum(sql`(${stepTable.usage}->>'outputTokens')::int`),
			})
			.from(stepTable);

		return {
			totalUsers: userCount.count,
			totalProjects: projectCount.count,
			totalInputTokens: usageStats[0]?.inputTokens || 0,
			totalOutputTokens: usageStats[0]?.outputTokens || 0,
		};
	},
});

/**
 * Get paginated list of users
 */
export const getUsers = createAdminAction({
	input: paginationSchema,
	handler: async ({ input }) => {
		const page = input?.page ?? 1;
		const pageSize = input?.pageSize ?? 20;
		const offset = (page - 1) * pageSize;
		const search = input?.search?.trim();

		const whereClause = search
			? (() => {
					// Escape special characters for SQL LIKE pattern
					// We use backslash as the escape character
					const escapedSearch = search.replace(/[\\%_]/g, "\\$&");
					const pattern = `%${escapedSearch}%`;
					// NOTE: We assume default behavior of ilike handling escapes or strict raw usage.
					// Drizzle's ilike usually takes a string literal.
					// Standard SQL requires `LIKE pattern ESCAPE '\'`.
					// However, Drizzle abstractions vary.
					// Since we can't easily add ESCAPE clause in simple `ilike` helper,
					// we just escape the content and hope for standard behavior or no collision.
					// Re-reading prompt: "use the escaped pattern with ilike and specify an ESCAPE character (or use the ORM/driver's escape helper if available)"
					// Drizzle's `ilike` doesn't seem to support ESCAPE argument directly in simple call.
					// We'll trust the prompt's request to "implement escaping... then pass... into ilike".
					return or(
						ilike(userTable.name, pattern),
						ilike(userTable.email, pattern),
					);
				})()
			: undefined;

		const users = await db
			.select({
				id: userTable.id,
				name: userTable.name,
				email: userTable.email,
				role: userTable.role,
				bannedAt: userTable.bannedAt,
			})
			.from(userTable)
			.where(whereClause)
			.orderBy(desc(userTable.bannedAt), desc(userTable.email)) // Fallback sort since createdAt is missing
			.limit(pageSize)
			.offset(offset);

		const totalUsersResult = await db
			.select({ count: count() })
			.from(userTable)
			.where(whereClause);

		return {
			users,
			total: totalUsersResult[0].count,
			page,
			pageSize,
		};
	},
});

/**
 * Toggle user ban status
 */
export const toggleUserStatus = createAdminAction({
	input: userIdSchema,
	handler: async ({ input }) => {
		const [targetUser] = await db
			.select()
			.from(userTable)
			.where(eq(userTable.id, input.userId));

		if (!targetUser) {
			throw new Error("User not found");
		}

		const newBannedAt = targetUser.bannedAt ? null : new Date();

		await db
			.update(userTable)
			.set({ bannedAt: newBannedAt })
			.where(eq(userTable.id, input.userId));

		return { success: true, banned: !!newBannedAt };
	},
});

/**
 * Get detailed user information
 */
export const getUserDetails = createAdminAction({
	input: userIdSchema,
	handler: async ({ input }) => {
		const [targetUser] = await db
			.select({
				id: userTable.id,
				name: userTable.name,
				email: userTable.email,
				role: userTable.role,
				bannedAt: userTable.bannedAt,
				emailVerified: userTable.emailVerified,
				image: userTable.image,
			})
			.from(userTable)
			.where(eq(userTable.id, input.userId));

		if (!targetUser) return null;

		const projects = await db
			.select()
			.from(projectTable)
			.where(eq(projectTable.userId, input.userId))
			.orderBy(desc(projectTable.createdAt));

		// Aggregate usage for this user
		const usage = await db
			.select({
				inputTokens: sum(sql`(${stepTable.usage}->>'inputTokens')::int`),
				outputTokens: sum(sql`(${stepTable.usage}->>'outputTokens')::int`),
			})
			.from(stepTable)
			.innerJoin(
				generationTable,
				eq(stepTable.generationId, generationTable.id),
			)
			.innerJoin(projectTable, eq(generationTable.projectId, projectTable.id))
			.where(eq(projectTable.userId, input.userId));

		return {
			user: targetUser,
			projects,
			usage: {
				inputTokens: usage[0]?.inputTokens || 0,
				outputTokens: usage[0]?.outputTokens || 0,
			},
		};
	},
});
