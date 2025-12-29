"use server";

import { count, desc, eq, sql, sum } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { isAdmin } from "@/lib/auth/utils";
import { db } from "@/lib/db/drizzle";
import {
	bookGeneration as generationTable,
	project as projectTable,
	bookGenerationStep as stepTable,
	user as userTable,
} from "@/lib/db/schema";

export async function ensureAdmin() {
	const session = await auth();
	if (!session?.user || !isAdmin(session.user.role)) {
		redirect("/");
	}
	return session;
}

export async function getAdminStats() {
	await ensureAdmin();

	const [userCount] = await db.select({ count: count() }).from(userTable);
	const [projectCount] = await db.select({ count: count() }).from(projectTable);

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
}

export async function getUsers(page = 1, pageSize = 20) {
	await ensureAdmin();
	const offset = (page - 1) * pageSize;

	const users = await db
		.select({
			id: userTable.id,
			name: userTable.name,
			email: userTable.email,
			role: userTable.role,
			bannedAt: userTable.bannedAt,
			// User table doesn't have createdAt, checking userPreferences if needed but skipping for now
		})
		.from(userTable)
		.limit(pageSize)
		.offset(offset);

	const totalUsersResult = await db.select({ count: count() }).from(userTable);

	return {
		users,
		total: totalUsersResult[0].count,
		page,
		pageSize,
	};
}

export async function toggleUserStatus(userId: string) {
	await ensureAdmin();

	const [targetUser] = await db
		.select()
		.from(userTable)
		.where(eq(userTable.id, userId));

	if (!targetUser) {
		throw new Error("User not found");
	}

	const newBannedAt = targetUser.bannedAt ? null : new Date();

	await db
		.update(userTable)
		.set({ bannedAt: newBannedAt })
		.where(eq(userTable.id, userId));

	return { success: true, banned: !!newBannedAt };
}

export async function getUserDetails(userId: string) {
	await ensureAdmin();

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
		.where(eq(userTable.id, userId));
	if (!targetUser) return null;

	const projects = await db
		.select()
		.from(projectTable)
		.where(eq(projectTable.userId, userId))
		.orderBy(desc(projectTable.createdAt)); // Fixed: updatedAt -> createdAt

	// Aggregate usage for this user
	// Join: Step -> Generation -> Project -> User
	const usage = await db
		.select({
			inputTokens: sum(sql`(${stepTable.usage}->>'inputTokens')::int`),
			outputTokens: sum(sql`(${stepTable.usage}->>'outputTokens')::int`),
		})
		.from(stepTable)
		.innerJoin(generationTable, eq(stepTable.generationId, generationTable.id))
		.innerJoin(projectTable, eq(generationTable.projectId, projectTable.id))
		.where(eq(projectTable.userId, userId));

	return {
		user: targetUser,
		projects,
		usage: {
			inputTokens: usage[0]?.inputTokens || 0,
			outputTokens: usage[0]?.outputTokens || 0,
		},
	};
}
