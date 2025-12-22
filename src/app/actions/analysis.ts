"use server";

import { consistencyService } from "@/lib/services/analysis/consistency-service";
import { ensureProjectAccess } from "@/lib/actions-utils";
import { getIssuesForProject, resolveIssue } from "@/lib/db/queries/issues";

export async function analyzeProjectAction(projectId: string) {
    try {
        await ensureProjectAccess(projectId, true); // read-write check
        const issues = await consistencyService.analyzeProject(projectId);
        return { success: true, count: issues.length };
    } catch (error) {
        console.error("Analysis failed:", error);
        return { success: false, error: "Failed to analyze project" };
    }
}

export async function getProjectIssuesAction(projectId: string) {
    try {
        await ensureProjectAccess(projectId, false); // read-only check
        const issues = await getIssuesForProject(projectId);
        return { success: true, issues };
    } catch (error) {
        console.error("Failed to fetch issues:", error);
        return { success: false, error: "Failed to fetch issues" };
    }
}

export async function resolveIssueAction(projectId: string, issueId: string) {
    try {
        await ensureProjectAccess(projectId, true);
        await resolveIssue(issueId);
        return { success: true };
    } catch (error) {
        console.error("Failed to resolve issue:", error);
        return { success: false, error: "Failed to resolve issue" };
    }
}
