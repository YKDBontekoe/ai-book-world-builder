"use server";

import { z } from "zod";
import { createAdminAction } from "@/lib/action-middleware";
import { getIssueDetails } from "./github";
import { createJulesSessionAction, listJulesSourcesAction } from "./jules";

// ============================================================================
// Schemas
// ============================================================================

const startFixSchema = z.object({
	issueNumber: z.number(),
});

// ============================================================================
// Actions
// ============================================================================

/**
 * Starts a Jules session to fix a specific GitHub issue.
 * Fetches the issue details and seeds the session with a context-rich prompt.
 */
export const startFixSessionAction = createAdminAction({
	input: startFixSchema,
	handler: async ({ input: { issueNumber } }) => {
		// 1. Fetch Issue Details
		const issueResult = await getIssueDetails({ input: issueNumber });
		if (!issueResult.success) {
			throw new Error(
				`Failed to fetch issue #${issueNumber}: ${issueResult.error}`,
			);
		}
		const issue = issueResult.data;

		// 2. Construct Prompt
		const prompt = `
I need you to fix the following GitHub Issue.

**Issue #${issue.number}: ${issue.title}**
created by @${issue.user?.login}

**Description:**
${issue.body || "No description provided."}

**Goal:**
Please analyze this issue, plan a solution, and create a Pull Request to fix it.
`;

		// 3. Get Source
		const sourcesResult = await listJulesSourcesAction();
		if (!sourcesResult.success || !sourcesResult.data.length) {
			throw new Error("No Jules sources available to start a session.");
		}
		const defaultSource = sourcesResult.data[0].name;

		// 4. Create Session
		return await createJulesSessionAction({
			input: {
				prompt,
				title: `Fix #${issue.number}: ${issue.title}`,
				sourceName: defaultSource,
				requirePlanApproval: true,
			},
		});
	},
});
