import "server-only";

import { db } from "@/lib/db/drizzle";
import { consistencyIssue, type ConsistencyIssue } from "@/lib/db/schema/issues";
import { eq, desc, and } from "drizzle-orm";
import { safeQuery } from "@/lib/db/safe-query";

export async function getIssuesForProject(projectId: string) {
  return safeQuery(
    () =>
      db
        .select()
        .from(consistencyIssue)
        .where(eq(consistencyIssue.projectId, projectId))
        .orderBy(desc(consistencyIssue.createdAt)),
    "getIssuesForProject"
  );
}

export async function getOpenIssuesForProject(projectId: string) {
  return safeQuery(
    () =>
      db
        .select()
        .from(consistencyIssue)
        .where(
          and(
            eq(consistencyIssue.projectId, projectId),
            eq(consistencyIssue.status, "open")
          )
        )
        .orderBy(desc(consistencyIssue.severity), desc(consistencyIssue.createdAt)),
    "getOpenIssuesForProject"
  );
}

export async function createIssues(issues: Partial<ConsistencyIssue>[]) {
  if (issues.length === 0) return [];

  return safeQuery(
    () => db.insert(consistencyIssue).values(issues as any).returning(),
    "createIssues"
  );
}

export async function resolveIssue(projectId: string, issueId: string) {
  return safeQuery(
    () =>
      db
        .update(consistencyIssue)
        .set({ status: "resolved", updatedAt: new Date() })
        .where(
          and(
            eq(consistencyIssue.id, issueId),
            eq(consistencyIssue.projectId, projectId)
          )
        )
        .returning(),
    "resolveIssue"
  );
}

export async function clearIssuesForProject(projectId: string) {
    return safeQuery(
        () => db.delete(consistencyIssue).where(eq(consistencyIssue.projectId, projectId)),
        "clearIssuesForProject"
    );
}
