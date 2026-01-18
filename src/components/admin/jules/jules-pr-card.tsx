"use client";

import { ExternalLink, GitMerge, GitPullRequest } from "lucide-react";
import type { JSX } from "react";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { GlassCard } from "@/components/molecules/glass-card";
import type { GitHubPullRequestSummary } from "@/lib/github-types";

export interface JulesPullRequestCardProps {
	pullRequest: GitHubPullRequestSummary;
	repoFullName: string;
	baseBranch: string;
	headBranch: string;
	canMerge: boolean;
	isMerging: boolean;
	onMerge: () => void;
	onAskFollowUp: () => void;
}

export function JulesPullRequestCard({
	pullRequest,
	repoFullName,
	baseBranch,
	headBranch,
	canMerge,
	isMerging,
	onMerge,
	onAskFollowUp,
}: JulesPullRequestCardProps): JSX.Element {
	return (
		<GlassCard className="p-4 bg-green-500/10 border-green-500/20 space-y-4">
			<div className="flex flex-col gap-2">
				<div className="flex items-center justify-between gap-4">
					<div className="flex items-center gap-2">
						<GitPullRequest className="h-4 w-4 text-green-600" />
						<span className="text-sm font-semibold text-green-700">
							Pull Request #{pullRequest.number}
						</span>
					</div>
					<Badge variant="outline" className="capitalize">
						{pullRequest.status.state}
					</Badge>
				</div>
				<p className="text-sm font-medium">{pullRequest.title}</p>
				<p className="text-xs text-muted-foreground">
					{repoFullName} • {baseBranch} → {headBranch}
				</p>
				<div className="flex flex-wrap gap-2 text-xs">
					<Badge variant="secondary">
						{pullRequest.status.mergeable === null
							? "Mergeability pending"
							: pullRequest.status.mergeable
								? "Mergeable"
								: "Not mergeable"}
					</Badge>
					<Badge variant={pullRequest.status.hasConflicts ? "destructive" : "secondary"}>
						{pullRequest.status.hasConflicts ? "Conflicts" : "No conflicts"}
					</Badge>
				</div>
			</div>

			{pullRequest.status.checks.length > 0 ? (
				<div className="space-y-2">
					<p className="text-xs font-semibold text-muted-foreground">
						Status Checks
					</p>
					<ul className="space-y-1 text-xs">
						{pullRequest.status.checks.map((check) => (
							<li
								key={check.name}
								className="flex items-center justify-between gap-2"
							>
								<span>{check.name}</span>
								<span className="text-muted-foreground">
									{check.conclusion ?? check.status}
								</span>
							</li>
						))}
					</ul>
				</div>
			) : (
				<p className="text-xs text-muted-foreground">No status checks reported.</p>
			)}

			<div className="flex flex-wrap gap-2">
				<Button size="sm" variant="ghost" asChild>
					<a href={pullRequest.url} target="_blank" rel="noopener noreferrer">
						Open PR
						<ExternalLink className="ml-2 h-3 w-3" />
					</a>
				</Button>
				<Button size="sm" variant="ghost" asChild>
					<a
						href={`${pullRequest.url}/checks`}
						target="_blank"
						rel="noopener noreferrer"
					>
						View checks
					</a>
				</Button>
				<Button size="sm" variant="outline" onClick={onAskFollowUp}>
					Ask Jules
				</Button>
				{canMerge && (
					<Button size="sm" onClick={onMerge} disabled={isMerging}>
						<GitMerge className="mr-2 h-3 w-3" />
						{isMerging ? "Merging..." : "Merge"}
					</Button>
				)}
			</div>
		</GlassCard>
	);
}
