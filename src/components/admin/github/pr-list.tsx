"use client";

import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
	GitMerge,
	GitPullRequest,
	GitPullRequestClosed,
	MessageSquare,
} from "lucide-react";
import { getPullRequests } from "@/app/actions/github";
import { Badge } from "@/components/atoms/badge";
import { GlassCard } from "@/components/molecules/glass-card";

interface PRListProps {
	onSelect: (id: number) => void;
	state?: "open" | "closed" | "all";
}

export function PRList({ onSelect, state = "open" }: PRListProps) {
	const {
		data: result,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["github", "prs", state],
		queryFn: () => getPullRequests(state),
	});

	if (isLoading)
		return (
			<div className="space-y-4">
				{[1, 2, 3].map((i) => (
					<GlassCard key={i} className="h-24 animate-pulse" />
				))}
			</div>
		);

	if (error || !result || !result.success) {
		const errorMessage =
			error?.message ||
			(result && !result.success ? result.error : "Unknown error");
		return (
			<div className="p-4 text-red-500 bg-red-500/10 rounded-lg">
				Error loading pull requests: {errorMessage}
			</div>
		);
	}

	const prs = result.data || [];

	if (prs.length === 0) {
		return (
			<div className="text-center p-8 text-muted-foreground">
				No pull requests found.
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{prs.map((pr) => {
				const isMerged = !!pr.merged_at;
				const isClosed = pr.state === "closed" && !isMerged;

				return (
					<GlassCard
						key={pr.number}
						variant="liquid"
						className="group cursor-pointer transition-all hover:border-primary/50"
						onClick={() => onSelect(pr.number)}
					>
						<div className="flex items-start gap-4 p-4">
							<div className="pt-1">
								{isMerged ? (
									<GitMerge className="h-5 w-5 text-purple-500" />
								) : isClosed ? (
									<GitPullRequestClosed className="h-5 w-5 text-red-500" />
								) : (
									<GitPullRequest className="h-5 w-5 text-green-500" />
								)}
							</div>
							<div className="flex-1 min-w-0">
								<div className="flex items-center justify-between gap-4 mb-1">
									<h3 className="font-semibold truncate text-base group-hover:text-primary transition-colors">
										{pr.title}
									</h3>
									<span className="text-muted-foreground text-xs whitespace-nowrap">
										#{pr.number}
									</span>
								</div>
								<div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
									<span className="flex items-center gap-1">
										<span className="font-medium text-foreground">
											{pr.user?.login}
										</span>
										opened {formatDistanceToNow(new Date(pr.created_at))} ago
									</span>
									<span className="flex items-center gap-1">
										<MessageSquare className="h-3 w-3" />
										{/* Note: comments count might be issue comments only,
                                            but github api usually includes review comments in a different field
                                            Using basic comments count for now */}
										{pr.comments}
									</span>
									<Badge variant="outline" className="text-xs h-5">
										{pr.base.ref} ← {pr.head.ref}
									</Badge>
								</div>
							</div>
						</div>
					</GlassCard>
				);
			})}
		</div>
	);
}
