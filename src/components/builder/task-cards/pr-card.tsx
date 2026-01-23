"use client";

import { GitPullRequest } from "lucide-react";
import type { JSX } from "react";
import type { GitHubPR } from "@/app/actions/github";
import { cn } from "@/lib/utils";

interface PRCardProps {
	pr: GitHubPR;
	compact?: boolean;
}

export function PRCard({ pr, compact }: PRCardProps): JSX.Element {
	return (
		<>
			<div className="flex items-start justify-between gap-2">
				<div className="flex items-center gap-2 text-blue-500">
					<GitPullRequest className="h-4 w-4" />
					<span className="text-xs font-mono">#{pr.number}</span>
				</div>
				<span className="text-[10px] text-muted-foreground">PR</span>
			</div>
			<h4
				className={cn(
					"font-medium text-sm mt-1",
					compact ? "line-clamp-1" : "line-clamp-2",
				)}
			>
				{pr.title}
			</h4>
			{!compact && (
				<div className="flex items-center justify-between mt-3">
					<div className="flex items-center gap-1.5">
						{pr.user?.avatar_url && (
							// biome-ignore lint/performance/noImgElement: External asset
							<img
								src={pr.user.avatar_url}
								alt={pr.user.login}
								className="w-4 h-4 rounded-full"
							/>
						)}
						<span className="text-xs text-muted-foreground">
							{pr.user?.login}
						</span>
					</div>
					<div className="text-[10px] px-1.5 py-0.5 rounded bg-muted">
						{pr.base.ref} ← {pr.head.ref}
					</div>
				</div>
			)}
		</>
	);
}
