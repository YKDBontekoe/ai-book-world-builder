"use server";

import { JulesClient } from "@/lib/jules-client";

const jules = new JulesClient();

export async function getJulesSessionsAction(
	pageSize = 20,
	pageToken?: string,
) {
	try {
		const result = await jules.listSessions(pageSize, pageToken);
		return { success: true, data: result };
	} catch (error) {
		console.error("Failed to list Jules sessions:", error);
		return { success: false, error: "Failed to fetch sessions" };
	}
}

export async function getJulesSessionDetailsAction(sessionId: string) {
	try {
		const [session, activitiesResult] = await Promise.all([
			jules.getSession(sessionId),
			jules.listActivities(sessionId),
		]);
		return {
			success: true,
			data: {
				session,
				activities: activitiesResult.activities
			}
		};
	} catch (error) {
		console.error("Failed to get Jules session details:", error);
		return { success: false, error: "Failed to fetch session details" };
	}
}

export async function createJulesSessionAction(params: {
	prompt: string;
	title?: string;
	sourceName: string;
	requirePlanApproval?: boolean;
}) {
	try {
		const session = await jules.createSession({
			prompt: params.prompt,
			title: params.title,
			sourceName: params.sourceName,
			automationMode: "AUTO_CREATE_PR",
			requirePlanApproval: params.requirePlanApproval,
		});
		return { success: true, data: session };
	} catch (error) {
		console.error("Failed to create Jules session:", error);
		return { success: false, error: "Failed to create session" };
	}
}

export async function sendJulesMessageAction(
	sessionId: string,
	prompt: string,
) {
	try {
		await jules.sendMessage(sessionId, prompt);
		return { success: true };
	} catch (error) {
		console.error("Failed to send message to Jules:", error);
		return { success: false, error: "Failed to send message" };
	}
}

export async function approveJulesPlanAction(sessionId: string) {
	try {
		await jules.approvePlan(sessionId);
		return { success: true };
	} catch (error) {
		console.error("Failed to approve Jules plan:", error);
		return { success: false, error: "Failed to approve plan" };
	}
}

export async function listJulesSourcesAction() {
	try {
		const result = await jules.listSources();
		return { success: true, data: result.sources };
	} catch (error) {
		console.error("Failed to list Jules sources:", error);
		return { success: false, error: "Failed to list sources" };
	}
}
