"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
	AlertCircle,
	CheckCircle2,
	ExternalLink,
	GitMerge,
	GitPullRequest,
	GitPullRequestClosed,
	XCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
	closeIssueOrPR,
	type GitHubIssue,
	type GitHubPR,
	getIssueDetails,
	getPullRequestDetails,
	mergePullRequest,
} from "@/app/actions/github";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { GlassCard } from "@/components/molecules/glass-card";
import { CommentSection } from "./comment-section";

interface ItemDetailProps {
	number: number;
	type: "pr" | "issue";
	onBack: () => void;
}

export function ItemDetail({ number, type, onBack }: ItemDetailProps) {
	const queryClient = useQueryClient();

	const {
		data: result,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["github", type, number],
		queryFn: () =>
			type === "pr" ? getPullRequestDetails(number) : getIssueDetails(number),
	});

	const mergeMutation = useMutation({
		mutationFn: async () => {
			const res = await mergePullRequest(number);
			if (!res.success) throw new Error(res.error);
			return res.data;
		},
		onSuccess: () => {
			toast.success("Pull request merged successfully");
			queryClient.invalidateQueries({ queryKey: ["github"] });
		},
		onError: (err) => toast.error(err.message),
	});

	const closeMutation = useMutation({
		mutationFn: async () => {
			const res = await closeIssueOrPR(number);
			if (!res.success) throw new Error(res.error);
			return res.data;
		},
		onSuccess: () => {
			toast.success(`${type === "pr" ? "Pull request" : "Issue"} closed`);
			queryClient.invalidateQueries({ queryKey: ["github"] });
		},
		onError: (err) => toast.error(err.message),
	});

	if (isLoading)
		return <div className="p-8 text-center">Loading details...</div>;
	if (error || !result?.success) {
		return (
			<div className="p-8 text-center text-red-500">
				Failed to load details: {error?.message || result?.error}
			</div>
		);
	}

	const item = result.data as GitHubPR | GitHubIssue; // Intersection handling in UI
	const isPR = type === "pr";

	// Type guards/checks
	const prItem = isPR ? (item as GitHubPR) : null;
	const isMerged = prItem?.merged_at;
	const isClosed = item.state === "closed";

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<Button variant="ghost" onClick={onBack} size="sm">
					← Back to List
				</Button>
				<div className="flex gap-2">
					<Button variant="outline" size="sm" asChild>
						<a href={item.html_url} target="_blank" rel="noopener noreferrer">
							<ExternalLink className="h-4 w-4 mr-2" />
							View on GitHub
						</a>
					</Button>
					{isPR && !isClosed && !isMerged && (
						<Button
							variant="default" // Changed from success (not in standard atoms usually)
							size="sm"
							onClick={() => mergeMutation.mutate()}
							disabled={mergeMutation.isPending}
							className="bg-green-600 hover:bg-green-700"
						>
							<GitMerge className="h-4 w-4 mr-2" />
							Merge PR
						</Button>
					)}
					{!isClosed && !isMerged && (
						<Button
							variant="destructive"
							size="sm"
							onClick={() => closeMutation.mutate()}
							disabled={closeMutation.isPending}
						>
							<XCircle className="h-4 w-4 mr-2" />
							Close {type === "pr" ? "PR" : "Issue"}
						</Button>
					)}
				</div>
			</div>

			<GlassCard className="p-6" variant="liquid">
				<div className="flex flex-col gap-4">
					<div className="flex items-start gap-4">
						<div className="pt-1">
							{isPR ? (
								isMerged ? (
									<GitMerge className="h-6 w-6 text-purple-500" />
								) : isClosed ? (
									<GitPullRequestClosed className="h-6 w-6 text-red-500" />
								) : (
									<GitPullRequest className="h-6 w-6 text-green-500" />
								)
							) : isClosed ? (
								<CheckCircle2 className="h-6 w-6 text-purple-500" />
							) : (
								<AlertCircle className="h-6 w-6 text-green-500" />
							)}
						</div>
						<div className="flex-1 space-y-1">
							<h1 className="text-2xl font-bold leading-tight">
								{item.title}{" "}
								<span className="text-muted-foreground font-light">
									#{item.number}
								</span>
							</h1>
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<Badge
									variant={item.state === "open" ? "default" : "secondary"}
								>
									{isMerged ? "Merged" : item.state}
								</Badge>
								<span>
									Opened{" "}
									{formatDistanceToNow(new Date(item.created_at), {
										addSuffix: true,
									})}{" "}
									by {item.user?.login}
								</span>
							</div>
						</div>
					</div>

					<div className="border-t border-border/50 pt-4 mt-2">
						{item.body ? (
							<div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
								{item.body}
							</div>
						) : (
							<p className="text-muted-foreground italic">
								No description provided.
							</p>
						)}
					</div>
				</div>
			</GlassCard>

			<CommentSection issueNumber={number} />
		</div>
	);
}
