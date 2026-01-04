import type { JSX } from "react";
import { TaskBoard } from "@/components/admin/builder/task-board";

/**
 * Admin page for managing Software Builder tasks (GitHub & Jules).
 * @returns The GitHubAdminPage component.
 */
export default function GitHubAdminPage(): JSX.Element {
	return (
		<div className="space-y-6 h-full flex flex-col">
			<div className="flex-shrink-0">
				<h1 className="text-3xl font-bold tracking-tight">Software Builder</h1>
				<p className="text-muted-foreground mt-2">
					Manage your development lifecycle with Jules. Issues → Planning → PRs.
				</p>
			</div>

			<div className="flex-1 min-h-0">
				<TaskBoard />
			</div>
		</div>
	);
}
