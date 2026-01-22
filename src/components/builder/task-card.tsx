"use client";

import { AlertCircle, Bot, GitPullRequest } from "lucide-react";
import type { JSX } from "react";
import type { GitHubIssue, GitHubPR } from "@/app/actions/github";
import { GlassCard } from "@/components/molecules/glass-card";
import type { JulesSession } from "@/lib/jules-client";

export type TaskItem =
	| { type: "issue"; data: GitHubIssue }
	| { type: "pr"; data: GitHubPR }
	| { type: "session"; data: JulesSession };

import { cn } from "@/lib/utils";

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
					<>
						<div className="flex items-start justify-between gap-2">
							<div className="flex items-center gap-2 text-orange-500">
								<AlertCircle className="h-4 w-4" />
								<span className="text-xs font-mono">#{item.data.number}</span>
							</div>
							<span className="text-[10px] text-muted-foreground">Issue</span>
						</div>
						<h4
							className={cn(
								"font-medium text-sm mt-1",
								compact ? "line-clamp-1" : "line-clamp-2",
							)}
						>
							{item.data.title}
						</h4>
						{!compact && (
							<div className="flex items-center justify-between mt-3">
								<div className="flex items-center gap-1.5">
									{item.data.user?.avatar_url && (
										// biome-ignore lint/performance/noImgElement: External asset
										<img
											src={item.data.user.avatar_url}
											alt={item.data.user.login}
											className="w-4 h-4 rounded-full"
										/>
									)}
									<span className="text-xs text-muted-foreground">
										{item.data.user?.login}
									</span>
								</div>
								{onFix && (
									<button
										type="button"
										onClick={(e) => {
											e.stopPropagation();
											onFix(item.data);
										}}
										className="flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-2 py-1 rounded hover:bg-primary/20 transition-colors"
									>
										<Bot className="h-3 w-3" />
										Fix
									</button>
								)}
							</div>
						)}
					</>
				);

			case "session":
				return (
					<>
						<div className="flex items-start justify-between gap-2">
							<div className="flex items-center gap-2 text-violet-500">
								<Bot className="h-4 w-4" />
								<span className="text-xs font-mono truncate max-w-[80px]">
									{item.data.id.split("/").pop()}
								</span>
							</div>
							<span className="text-[10px] text-muted-foreground">
								{item.data.state.replace("STATE_", "").replace("_", " ")}
							</span>
						</div>
						<h4
							className={cn(
								"font-medium text-sm mt-1",
								compact ? "line-clamp-1" : "line-clamp-2",
							)}
						>
							{item.data.title || item.data.prompt}
						</h4>
						{!compact && (
							<div className="mt-3 text-xs text-muted-foreground">
								Active Session
							</div>
						)}
					</>
				);

			case "pr":
				return (
					<>
						<div className="flex items-start justify-between gap-2">
							<div className="flex items-center gap-2 text-blue-500">
								<GitPullRequest className="h-4 w-4" />
								<span className="text-xs font-mono">#{item.data.number}</span>
							</div>
							<span className="text-[10px] text-muted-foreground">PR</span>
						</div>
						<h4
							className={cn(
								"font-medium text-sm mt-1",
								compact ? "line-clamp-1" : "line-clamp-2",
							)}
						>
							{item.data.title}
						</h4>
						{!compact && (
							<div className="flex items-center justify-between mt-3">
								<div className="flex items-center gap-1.5">
									{item.data.user?.avatar_url && (
										// biome-ignore lint/performance/noImgElement: External asset
										<img
											src={item.data.user.avatar_url}
											alt={item.data.user.login}
											className="w-4 h-4 rounded-full"
										/>
									)}
									<span className="text-xs text-muted-foreground">
										{item.data.user?.login}
									</span>
								</div>
								<div className="text-[10px] px-1.5 py-0.5 rounded bg-muted">
									{item.data.base.ref} ← {item.data.head.ref}
								</div>
							</div>
						)}
					</>
				);
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
