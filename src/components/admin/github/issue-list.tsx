"use client";

import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { AlertCircle, CheckCircle2, MessageSquare } from "lucide-react";
import { getIssues } from "@/app/actions/github";
import { GlassCard } from "@/components/molecules/glass-card";

interface IssueListProps {
	onSelect: (id: number) => void;
	state?: "open" | "closed" | "all";
}

export function IssueList({ onSelect, state = "open" }: IssueListProps) {
	const {
		data: issues,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["github", "issues", state],
		queryFn: async () => {
			const res = await getIssues(state);
			if (!res.success) throw new Error(res.error);
			return res.data;
		},
	});

	if (isLoading)
		return (
			<div className="space-y-4">
				{[1, 2, 3].map((i) => (
					<GlassCard key={i} className="h-24 animate-pulse" />
				))}
			</div>
		);

	if (error) {
		return (
			<div className="p-4 text-red-500 bg-red-500/10 rounded-lg">
				Error loading issues: {error.message}
			</div>
		);
	}

	if (!issues || issues.length === 0) {
		return (
			<div className="text-center p-8 text-muted-foreground">
				No issues found.
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{issues.map((issue) => {
				const isClosed = issue.state === "closed";

				return (
					<GlassCard
						key={issue.number}
						variant="liquid"
						className="group cursor-pointer transition-all hover:border-primary/50"
						onClick={() => onSelect(issue.number)}
					>
						<div className="flex items-start gap-4 p-4">
							<div className="pt-1">
								{isClosed ? (
									<CheckCircle2 className="h-5 w-5 text-purple-500" />
								) : (
									<AlertCircle className="h-5 w-5 text-green-500" />
								)}
							</div>
							<div className="flex-1 min-w-0">
								<div className="flex items-center justify-between gap-4 mb-1">
									<h3 className="font-semibold truncate text-base group-hover:text-primary transition-colors">
										{issue.title}
									</h3>
									<span className="text-muted-foreground text-xs whitespace-nowrap">
										#{issue.number}
									</span>
								</div>
								<div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
									<span className="flex items-center gap-1">
										<span className="font-medium text-foreground">
											{issue.user?.login}
										</span>
										opened {formatDistanceToNow(new Date(issue.created_at))} ago
									</span>
									<span className="flex items-center gap-1">
										<MessageSquare className="h-3 w-3" />
										{issue.comments}
									</span>
								</div>
							</div>
						</div>
					</GlassCard>
				);
			})}
		</div>
	);
}
