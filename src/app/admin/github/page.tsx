import type { JSX } from "react";
import { getJulesSessionsAction } from "@/app/actions/jules";
import { TaskBoard } from "@/components/admin/builder/task-board";
import { GlobalActivityFeed } from "@/components/admin/jules/global-activity-feed";

/**
 * Admin page for managing Software Builder tasks (GitHub & Jules).
 * @returns The GitHubAdminPage component.
 */
export default async function GitHubAdminPage(): Promise<JSX.Element> {
	// Initial fetch for server-side rendering of the feed
	const sessionsRes = await getJulesSessionsAction({ pageSize: 10 });
	const activeSessions =
		sessionsRes.success && sessionsRes.data
			? sessionsRes.data.sessions.filter(
					(s) => s.state !== "COMPLETED" && s.state !== "FAILED",
				)
			: [];

	return (
		<div className="space-y-6 h-full flex flex-col relative pb-10">
			<div className="flex-shrink-0">
				<h1 className="text-3xl font-bold tracking-tight">Software Builder</h1>
				<p className="text-muted-foreground mt-2">
					Manage your development lifecycle with Jules. Issues → Planning → PRs.
				</p>
			</div>

			<div className="flex-1 min-h-0">
				<TaskBoard />
			</div>

			<GlobalActivityFeed activeSessions={activeSessions} />
		</div>
	);
}
