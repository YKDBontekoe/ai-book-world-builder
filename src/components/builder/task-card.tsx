"use client";

import type { JSX } from "react";
import type { GitHubIssue, GitHubPR } from "@/app/actions/github";
import { GlassCard } from "@/components/molecules/glass-card";
import type { JulesSession } from "@/lib/jules-client";
import { cn } from "@/lib/utils";
import { IssueCard } from "./task-cards/issue-card";
import { PRCard } from "./task-cards/pr-card";
import { SessionCard } from "./task-cards/session-card";

export type TaskItem =
	| { type: "issue"; data: GitHubIssue }
	| { type: "pr"; data: GitHubPR }
	| { type: "session"; data: JulesSession };

interface TaskCardProps {
	item: TaskItem;
	onSelect: (item: TaskItem) => void;
	onFix?: (issue: GitHubIssue) => void;
	compact?: boolean;
}

export function TaskCard({
	item,
	onSelect,
	onFix,
	compact,
}: TaskCardProps): JSX.Element {
	const renderContent = () => {
		switch (item.type) {
			case "issue":
				return (
					<IssueCard
						issue={item.data}
						compact={compact}
						onFix={onFix}
					/>
				);
			case "session":
				return <SessionCard session={item.data} compact={compact} />;
			case "pr":
				return <PRCard pr={item.data} compact={compact} />;
		}
	};

	return (
		<GlassCard
			variant="liquid"
			className={cn(
				"cursor-pointer active:scale-95 transition-transform",
				compact ? "p-2" : "p-3",
			)}
			onClick={() => onSelect(item)}
		>
			{renderContent()}
		</GlassCard>
	);
}
