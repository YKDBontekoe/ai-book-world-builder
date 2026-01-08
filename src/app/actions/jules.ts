"use server";

import { z } from "zod";
import { createAdminAction } from "@/lib/action-middleware";
import { JulesClient } from "@/lib/jules-client";
import { generateSessionTitleAction } from "./jules-ai";

const jules = new JulesClient();

// ============================================================================
// Validation Schemas
// ============================================================================

const createSessionSchema = z.object({
	prompt: z.string().min(1, "Prompt is required"),
	title: z.string().optional(),
	sourceName: z.string().min(1, "Source is required"),
	requirePlanApproval: z.boolean().optional(),
	startingBranch: z.string().optional(),
});

const sendMessageSchema = z.object({
	sessionId: z.string().min(1, "Session ID is required"),
	prompt: z
		.string()
		.trim()
		.min(1, "Message cannot be empty")
		.max(10000, "Message too long"),
});

const paginationSchema = z.object({
	pageSize: z.number().int().positive().default(20),
	pageToken: z.string().optional(),
});

const sessionIdSchema = z.object({
	sessionId: z.string().min(1, "Session ID is required"),
});

// ============================================================================
// Actions
// ============================================================================

/**
 * List all Jules sessions with pagination
 */
export const getJulesSessionsAction = createAdminAction({
	input: paginationSchema,
	handler: async ({ input }) => {
		return await jules.listSessions(input.pageSize, input.pageToken);
	},
});

/**
 * Get details of a specific Jules session
 */
export const getJulesSessionDetailsAction = createAdminAction({
	input: sessionIdSchema,
	handler: async ({ input }) => {
		const [session, activitiesResult] = await Promise.all([
			jules.getSession(input.sessionId),
			jules.listActivities(input.sessionId),
		]);
		return {
			session,
			activities: activitiesResult.activities,
		};
	},
});

/**
 * Create a new Jules session
 */
export const createJulesSessionAction = createAdminAction({
	input: createSessionSchema,
	handler: async ({ input }) => {
		let title = input.title;
		if (!title || title.trim() === "") {
			title = await generateSessionTitleAction(input.prompt);
		}

		// Auto-detect the default branch if not provided
		let startingBranch = input.startingBranch;
		if (!startingBranch) {
			const source = await jules.getSource(input.sourceName);
			startingBranch =
				source.githubRepo?.defaultBranch?.displayName ||
				(source.githubRepo ? "main" : undefined);
		}

		return await jules.createSession({
			prompt: input.prompt,
			title: title,
			sourceName: input.sourceName,
			startingBranch,
			automationMode: "AUTO_CREATE_PR",
			requirePlanApproval: input.requirePlanApproval,
		});
	},
});

/**
 * Send a message to a Jules session
 */
export const sendJulesMessageAction = createAdminAction({
	input: sendMessageSchema,
	handler: async ({ input }) => {
		await jules.sendMessage(input.sessionId, input.prompt);
	},
});

/**
 * Approve the plan for a Jules session
 */
export const approveJulesPlanAction = createAdminAction({
	input: sessionIdSchema,
	handler: async ({ input }) => {
		await jules.approvePlan(input.sessionId);
	},
});

/**
 * List all available Jules sources
 */
export const listJulesSourcesAction = createAdminAction({
	handler: async () => {
		const result = await jules.listSources();
		return result.sources;
	},
});
