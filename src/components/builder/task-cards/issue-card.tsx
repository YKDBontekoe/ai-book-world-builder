"use client";

import { AlertCircle, Bot } from "lucide-react";
import type { JSX } from "react";
import type { GitHubIssue } from "@/app/actions/github";
import { Button } from "@/components/atoms/button";
import { cn } from "@/lib/utils";

interface IssueCardProps {
	issue: GitHubIssue;
	compact?: boolean;
	onFix?: (issue: GitHubIssue) => void;
}

export function IssueCard({
	issue,
	compact,
	onFix,
}: IssueCardProps): JSX.Element {
	return (
		<>
			<div className="flex items-start justify-between gap-2">
				<div className="flex items-center gap-2 text-orange-500">
					<AlertCircle className="h-4 w-4" />
					<span className="text-xs font-mono">#{issue.number}</span>
				</div>
				<span className="text-[10px] text-muted-foreground">Issue</span>
			</div>
			<h4
				className={cn(
					"font-medium text-sm mt-1",
					compact ? "line-clamp-1" : "line-clamp-2",
				)}
			>
				{issue.title}
			</h4>
			{!compact && (
				<div className="flex items-center justify-between mt-3">
					<div className="flex items-center gap-1.5">
						{issue.user?.avatar_url && (
							// biome-ignore lint/performance/noImgElement: External asset
							<img
								src={issue.user.avatar_url}
								alt={issue.user.login}
								className="w-4 h-4 rounded-full"
							/>
						)}
						<span className="text-xs text-muted-foreground">
							{issue.user?.login}
						</span>
					</div>
					{onFix && (
						<Button
							variant="ghost"
							size="sm"
							onClick={(e) => {
								e.stopPropagation();
								onFix(issue);
							}}
							className="h-6 px-2 text-[10px] bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary gap-1"
						>
							<Bot className="h-3 w-3" />
							Fix
						</Button>
					)}
				</div>
			)}
		</>
	);
}
