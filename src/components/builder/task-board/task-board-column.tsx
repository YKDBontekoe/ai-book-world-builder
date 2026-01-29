"use client";

import { AnimatePresence } from "framer-motion";
import { Bot, CheckCircle2, GitPullRequest, Inbox } from "lucide-react";
import type { JSX } from "react";
import type { GitHubIssue } from "@/app/actions/github";
import { EmptyState } from "@/components/molecules/empty-state";
import { CreateFeatureDialog } from "../create-feature-dialog";
import type { Column } from "../task-board-utils";
import { TaskCard, type TaskItem } from "../task-card";

interface TaskBoardColumnProps {
	column: Column;
	isCompact: boolean;
	defaultSource?: string;
	onSelect: (item: TaskItem) => void;
	onFix: (issue: GitHubIssue) => void;
}

export function TaskBoardColumn({
	column,
	isCompact,
	defaultSource,
	onSelect,
	onFix,
}: TaskBoardColumnProps): JSX.Element {
	const getEmptyStateContent = () => {
		switch (column.id) {
			case "backlog":
				return {
					icon: Inbox,
					title: "No backlog items",
					description: "You're all caught up!",
				};
			case "in_progress":
				return {
					icon: Bot,
					title: "No active sessions",
					description: "Ask Jules to start working.",
				};
			case "review":
				return {
					icon: GitPullRequest,
					title: "No PRs in review",
					description: "Code is shipping smoothly.",
				};
			case "done":
				return {
					icon: CheckCircle2,
					title: "No completed items",
					description: "Time to get to work!",
				};
			default:
				return {
					icon: Inbox,
					title: `No items in ${column.title}`,
					description: "This column is empty.",
				};
		}
	};

	const emptyState = getEmptyStateContent();

	return (
		<div className="w-[300px] flex-shrink-0 flex flex-col">
			<div className="flex items-center justify-between mb-4 px-1">
				<h3 className="font-semibold text-sm flex items-center gap-2 text-foreground/80">
					{column.title}
					<span className="bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-[10px] font-mono">
						{column.items.length}
					</span>
				</h3>
				{column.id === "backlog" && defaultSource && (
					<CreateFeatureDialog defaultSource={defaultSource} />
				)}
			</div>

			<div className="flex-1 overflow-y-auto pr-2 space-y-3 pb-10">
				<AnimatePresence mode="popLayout">
					{column.items.length === 0 ? (
						<EmptyState
							key="empty-state"
							icon={emptyState.icon}
							title={emptyState.title}
							description={emptyState.description}
							variant="dashed"
							className="h-40 min-h-40 p-6"
						/>
					) : (
						column.items.map((item) => (
							<TaskCard
								key={item.type === "session" ? item.data.id : item.data.number}
								item={item}
								onSelect={onSelect}
								onFix={item.type === "issue" ? onFix : undefined}
								compact={isCompact}
							/>
						))
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
