"use server";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import { withProjectWriteAccess } from "@/lib/actions-utils";
import {
	type BookPlan,
	type StoryStyle,
	storyService,
} from "@/lib/services/story-service";

export type { BookPlan, StoryStyle };

// Rate limiter configuration (10 requests per 10 minutes)
// We utilize a dedicated Upstash Redis client for rate limiting to ensure compatibility
// with @upstash/ratelimit, while the application logic continues to use the existing
// node-redis client (imported as 'redis' elsewhere).
// This requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env vars to be set,
// or it will fallback to using REDIS_URL if it's an Upstash connection string,
// but for standard Redis compatibility, we rely on the specific Upstash client.

let ratelimit: Ratelimit | null = null;

const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (redisUrl && redisToken) {
	try {
		const redis = new Redis({
			url: redisUrl,
			token: redisToken,
		});

		ratelimit = new Ratelimit({
			redis: redis,
			limiter: Ratelimit.slidingWindow(10, "10 m"),
			analytics: true,
			prefix: "ratelimit:ai-generation",
		});
	} catch (error) {
		console.warn("Failed to initialize Upstash rate limiter:", error);
	}
} else if (process.env.REDIS_URL && process.env.REDIS_URL.includes("upstash")) {
	// Fallback: If we only have REDIS_URL and it looks like Upstash, try auto-config
	try {
		const redis = Redis.fromEnv();
		ratelimit = new Ratelimit({
			redis: redis,
			limiter: Ratelimit.slidingWindow(10, "10 m"),
			analytics: true,
			prefix: "ratelimit:ai-generation",
		});
	} catch (error) {
		console.warn("Failed to initialize Upstash rate limiter from env:", error);
	}
}

// Validation Schemas
const generatePlanSchema = z.object({
	prompt: z.string().min(10, "Prompt must be at least 10 characters"),
	style: z
		.object({
			genre: z.string().optional(),
			pov: z.string().optional(),
			tone: z.string().optional(),
		})
		.optional(),
	modelId: z.string().optional(),
});

const planChapterSchema = z.object({
	chapterId: z.string().uuid("Invalid Chapter ID"),
});

const generateSceneSchema = z.object({
	sceneId: z.string().uuid("Invalid Scene ID"),
});

// Return Types
export type GenerateBookPlanResult =
	| { success: true; plan: BookPlan }
	| { success: false; error: string };

export type CreateBookFromPlanResult =
	| { success: true }
	| { success: false; error: string };

export type PlanChapterScenesResult =
	| { success: true; sceneIds: string[] }
	| { success: false; error: string };

export type GenerateSceneTextResult =
	| { success: true }
	| { success: false; error: string };

export async function generateBookPlan(
	prompt: string,
	style?: StoryStyle,
	modelId?: string,
): Promise<GenerateBookPlanResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" };
		}

		// Input Validation
		const validation = generatePlanSchema.safeParse({ prompt, style, modelId });
		if (!validation.success) {
			return { success: false, error: validation.error.message };
		}

		// Rate Limiting
		if (ratelimit) {
			try {
				const { success } = await ratelimit.limit(session.user.id);
				if (!success) {
					return {
						success: false,
						error: "Rate limit exceeded. Please try again later.",
					};
				}
			} catch (e) {
				console.warn("Rate limit check failed, allowing request", e);
			}
		}

		const result = await storyService.generateBookPlan(prompt, style, modelId);
		if (result.error || !result.plan) {
			return {
				success: false,
				error: result.error || "Failed to generate plan",
			};
		}
		return { success: true, plan: result.plan };
	} catch (error) {
		console.error("Failed to generate book plan", error);
		return { success: false, error: "Failed to generate plan" };
	}
}

export async function createBookFromPlan(
	projectId: string,
	plan: BookPlan,
	style?: StoryStyle,
): Promise<CreateBookFromPlanResult> {
	return withProjectWriteAccess(projectId, async () => {
		try {
			// Basic schema validation for plan could be added here if BookPlan schema is available at runtime
			await storyService.createBookFromPlan(projectId, plan, style);
			return { success: true };
		} catch (error) {
			console.error("Failed to create book from plan", error);
			// Check if error is already a friendly message or throw generic
			if (error instanceof Error) {
				return { success: false, error: error.message };
			}
			return { success: false, error: "Failed to apply plan" };
		}
	}) as Promise<CreateBookFromPlanResult>; // Cast needed because withProjectWriteAccess might return any
}

export async function planChapterScenes(
	chapterId: string,
): Promise<PlanChapterScenesResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" };
		}

		const validation = planChapterSchema.safeParse({ chapterId });
		if (!validation.success) {
			return { success: false, error: validation.error.message };
		}

		// Rate Limiting
		if (ratelimit) {
			try {
				const { success } = await ratelimit.limit(
					`chapter-plan:${session.user.id}`,
				);
				if (!success) {
					return {
						success: false,
						error: "Rate limit exceeded. Please try again later.",
					};
				}
			} catch (e) {
				console.warn("Rate limit check failed, allowing request", e);
			}
		}

		const sceneIds = await storyService.planChapterScenes(chapterId);
		return { success: true, sceneIds };
	} catch (error) {
		console.error("Failed to plan chapter scenes", error);
		const msg = error instanceof Error ? error.message : "Planning failed";
		return { success: false, error: msg };
	}
}

export async function generateSceneText(
	sceneId: string,
): Promise<GenerateSceneTextResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" };
		}

		const validation = generateSceneSchema.safeParse({ sceneId });
		if (!validation.success) {
			return { success: false, error: validation.error.message };
		}

		// Rate Limiting
		if (ratelimit) {
			try {
				const { success } = await ratelimit.limit(
					`scene-gen:${session.user.id}`,
				);
				if (!success) {
					return {
						success: false,
						error: "Rate limit exceeded. Please try again later.",
					};
				}
			} catch (e) {
				console.warn("Rate limit check failed, allowing request", e);
			}
		}

		// Service layer handles ensureProjectAccess via verifySceneAccess inside `generateSceneText`
		await storyService.generateSceneText(sceneId);
		return { success: true };
	} catch (error) {
		console.error("Failed to generate scene text", error);
		const errorMessage =
			error instanceof Error
				? error.message
				: "Failed to generate scene content";
		return { success: false, error: errorMessage };
	}
}
