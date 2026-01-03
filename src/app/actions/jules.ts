"use server";

import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import {
	type JulesActivity,
	JulesClient,
	type JulesSession,
	type JulesSource,
} from "@/lib/jules-client";
import type { Result } from "@/lib/result";

const jules = new JulesClient();

// Helper to check admin
async function requireAdmin() {
	const session = await auth();
	if (!session?.user || session.user.role !== "admin") {
		throw new Error("Unauthorized: Admin access required");
	}
}

// Validation schemas
const createSessionSchema = z.object({
	prompt: z.string().min(1, "Prompt is required"),
	title: z.string().optional(),
	sourceName: z.string().min(1, "Source is required"),
	requirePlanApproval: z.boolean().optional(),
});

const sendMessageSchema = z.object({
	sessionId: z.string().min(1, "Session ID is required"),
	prompt: z
		.string()
		.trim()
		.min(1, "Message cannot be empty")
		.max(10000, "Message too long"),
});

// --- Actions ---

export async function getJulesSessionsAction(
	pageSize = 20,
	pageToken?: string,
): Promise<Result<{ sessions: JulesSession[]; nextPageToken?: string }>> {
	try {
		await requireAdmin();
		const result = await jules.listSessions(pageSize, pageToken);
		return { success: true, data: result };
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error("Failed to list Jules sessions:", error);
		return { success: false, error: `Failed to fetch sessions: ${message}` };
	}
}

export async function getJulesSessionDetailsAction(
	sessionId: string,
): Promise<Result<{ session: JulesSession; activities: JulesActivity[] }>> {
	try {
		await requireAdmin();
		const [session, activitiesResult] = await Promise.all([
			jules.getSession(sessionId),
			jules.listActivities(sessionId),
		]);
		return {
			success: true,
			data: {
				session,
				activities: activitiesResult.activities,
			},
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error("Failed to get Jules session details:", error);
		return {
			success: false,
			error: `Failed to fetch session details: ${message}`,
		};
	}
}

export async function createJulesSessionAction(params: {
	prompt: string;
	title?: string;
	sourceName: string;
	requirePlanApproval?: boolean;
}): Promise<Result<JulesSession>> {
	try {
		await requireAdmin();

		const validation = createSessionSchema.safeParse(params);
		if (!validation.success) {
			return { success: false, error: validation.error.errors[0].message };
		}
		const validated = validation.data;

		const session = await jules.createSession({
			prompt: validated.prompt,
			title: validated.title,
			sourceName: validated.sourceName,
			automationMode: "AUTO_CREATE_PR",
			requirePlanApproval: validated.requirePlanApproval,
		});
		return { success: true, data: session };
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error("Failed to create Jules session:", error);
		return { success: false, error: `Failed to create session: ${message}` };
	}
}

export async function sendJulesMessageAction(
	sessionId: string,
	prompt: string,
): Promise<Result<void>> {
	try {
		await requireAdmin();

		const validation = sendMessageSchema.safeParse({ sessionId, prompt });
		if (!validation.success) {
			return { success: false, error: validation.error.errors[0].message };
		}
		const validated = validation.data;

		await jules.sendMessage(validated.sessionId, validated.prompt);
		return { success: true, data: undefined };
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error("Failed to send message to Jules:", error);
		return { success: false, error: `Failed to send message: ${message}` };
	}
}

export async function approveJulesPlanAction(
	sessionId: string,
): Promise<Result<void>> {
	try {
		await requireAdmin();
		await jules.approvePlan(sessionId);
		return { success: true, data: undefined };
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error("Failed to approve Jules plan:", error);
		return { success: false, error: `Failed to approve plan: ${message}` };
	}
}

export async function listJulesSourcesAction(): Promise<Result<JulesSource[]>> {
	try {
		await requireAdmin();
		const result = await jules.listSources();
		return { success: true, data: result.sources };
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error("Failed to list Jules sources:", error);
		return { success: false, error: `Failed to list sources: ${message}` };
	}
}
