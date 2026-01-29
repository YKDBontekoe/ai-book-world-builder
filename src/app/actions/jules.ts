"use server";

import { z } from "zod";
import { createAdminAction } from "@/lib/action-middleware";
import {
	getCached,
	invalidateCache,
	invalidateCachePattern,
} from "@/lib/cache";
import type { JulesSource } from "@/lib/jules-client";
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
	automationMode: z.enum(["manual", "auto"]).optional(),
	repository: z
		.object({
			id: z.number().int().positive(),
			name: z.string().min(1),
			fullName: z.string().min(1),
			owner: z.string().min(1),
			defaultBranch: z.string().min(1),
			private: z.boolean(),
			permissions: z
				.object({
					admin: z.boolean(),
					push: z.boolean(),
					pull: z.boolean(),
				})
				.optional(),
		})
		.optional(),
});

const createAdminSessionSchema = createSessionSchema.extend({
	startingBranch: z.string().min(1, "Base branch is required"),
	automationMode: z.enum(["manual", "auto"]),
	repository: z.object({
		id: z.number().int().positive(),
		name: z.string().min(1),
		fullName: z.string().min(1),
		owner: z.string().min(1),
		defaultBranch: z.string().min(1),
		private: z.boolean(),
		permissions: z
			.object({
				admin: z.boolean(),
				push: z.boolean(),
				pull: z.boolean(),
			})
			.optional(),
	}),
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
		return getCached(
			`jules:sessions:${input.pageSize}:${input.pageToken ?? "start"}`,
			async () => {
				return await jules.listSessions(input.pageSize, input.pageToken);
			},
			5,
		);
	},
});

/**
 * Get details of a specific Jules session
 */
export const getJulesSessionDetailsAction = createAdminAction({
	input: sessionIdSchema,
	handler: async ({ input }) => {
		return getCached(
			`jules:session:${input.sessionId}`,
			async () => {
				const [session, activitiesResult] = await Promise.all([
					jules.getSession(input.sessionId),
					jules.listActivities(input.sessionId),
				]);
				return {
					session,
					activities: activitiesResult.activities,
				};
			},
			5,
		);
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
			try {
				// Use cached sources if possible, though getSource might not be listSources.
				// But here we need specific source.
				// We can rely on listSources cache if we implement a find helper, but jules client has getSource.
				const source = await jules.getSource(input.sourceName);
				startingBranch =
					source.githubRepo?.defaultBranch?.displayName ||
					(source.githubRepo ? "main" : undefined);
			} catch (error) {
				const message =
					error instanceof Error ? error.message : "Unknown error";
				throw new Error(
					`Failed to detect default branch for source '${input.sourceName}': ${message}`,
				);
			}
		}

		const automationMode = input.automationMode ?? "manual";
		const requirePlanApproval =
			input.requirePlanApproval ?? automationMode === "manual";

		const session = await jules.createSession({
			prompt: input.prompt,
			title: title,
			sourceName: input.sourceName,
			startingBranch,
			automationMode: automationMode === "auto" ? "AUTO_CREATE_PR" : undefined,
			requirePlanApproval,
		});

		if (input.repository) {
			const { saveJulesSessionMetadata } = await import(
				"@/lib/jules-session-metadata"
			);
			await saveJulesSessionMetadata({
				sessionId: session.id,
				repository: input.repository,
				baseBranch: startingBranch ?? input.repository.defaultBranch,
				automationMode,
			});
		}

		await invalidateCachePattern("jules:sessions:*");

		return session;
	},
});

/**
 * Create a new Jules session with explicit repository/branch context.
 */
export const createJulesAdminSessionAction = createAdminAction({
	input: createAdminSessionSchema,
	handler: async ({ input }) => {
		let title = input.title;
		if (!title || title.trim() === "") {
			title = await generateSessionTitleAction(input.prompt);
		}

		const requirePlanApproval = input.automationMode === "manual";

		const session = await jules.createSession({
			prompt: input.prompt,
			title: title,
			sourceName: input.sourceName,
			startingBranch: input.startingBranch,
			automationMode:
				input.automationMode === "auto" ? "AUTO_CREATE_PR" : undefined,
			requirePlanApproval,
		});

		const { saveJulesSessionMetadata } = await import(
			"@/lib/jules-session-metadata"
		);
		await saveJulesSessionMetadata({
			sessionId: session.id,
			repository: input.repository,
			baseBranch: input.startingBranch,
			automationMode: input.automationMode,
		});

		await invalidateCachePattern("jules:sessions:*");

		return session;
	},
});

/**
 * Send a message to a Jules session
 */
export const sendJulesMessageAction = createAdminAction({
	input: sendMessageSchema,
	handler: async ({ input }) => {
		await jules.sendMessage(input.sessionId, input.prompt);
		await invalidateCache(`jules:session:${input.sessionId}`);
		// Session list might show last message or status, so invalidate it too
		await invalidateCachePattern("jules:sessions:*");
	},
});

/**
 * Approve the plan for a Jules session
 */
export const approveJulesPlanAction = createAdminAction({
	input: sessionIdSchema,
	handler: async ({ input }) => {
		await jules.approvePlan(input.sessionId);
		await invalidateCache(`jules:session:${input.sessionId}`);
		await invalidateCachePattern("jules:sessions:*");
	},
});

const planFeedbackSchema = z.object({
	sessionId: z.string().min(1, "Session ID is required"),
	decision: z.enum(["reject", "request_changes"]),
	notes: z.string().optional(),
});

/**
 * Send plan feedback to Jules when rejecting or requesting changes.
 */
export const sendJulesPlanFeedbackAction = createAdminAction({
	input: planFeedbackSchema,
	handler: async ({ input }) => {
		const prefix =
			input.decision === "reject"
				? "PLAN_DECISION: REJECT"
				: "PLAN_DECISION: REQUEST_CHANGES";
		const message = input.notes?.trim()
			? `${prefix}\n${input.notes.trim()}`
			: prefix;
		await jules.sendMessage(input.sessionId, message);
		await invalidateCache(`jules:session:${input.sessionId}`);
		await invalidateCachePattern("jules:sessions:*");
	},
});

/**
 * Fetch stored metadata for a Jules session.
 */
export const getJulesSessionMetadataAction = createAdminAction({
	input: sessionIdSchema,
	handler: async ({ input }) => {
		const { getJulesSessionMetadata } = await import(
			"@/lib/jules-session-metadata"
		);
		// Metadata is stored in DB, not Redis cached usually?
		// We can cache it if it's heavy, but DB is fast.
		// Let's leave it as is for now unless requested.
		return await getJulesSessionMetadata(input.sessionId);
	},
});

/**
 * List all available Jules sources
 */
export const listJulesSourcesAction = createAdminAction({
	handler: async () => {
		return getCached(
			"jules:sources",
			async () => {
				const sources: JulesSource[] = [];
				let pageToken: string | undefined;
				let pagesFetched = 0;
				const MAX_PAGES = 20;

				do {
					if (pagesFetched >= MAX_PAGES) {
						console.warn(
							`listJulesSourcesAction: Hit max pages limit (${MAX_PAGES}). Stopping pagination.`,
						);
						break;
					}
					const result = await jules.listSources(50, pageToken);
					sources.push(...result.sources);
					pageToken = result.nextPageToken;
					pagesFetched++;
				} while (pageToken);
				return sources;
			},
			3600,
		); // Cache for 1 hour
	},
});
