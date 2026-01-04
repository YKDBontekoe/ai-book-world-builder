"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, RefreshCw, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getComments, postComment } from "@/app/actions/github";
import { Button } from "@/components/atoms/button";
import { Textarea } from "@/components/atoms/textarea";
import { GlassCard } from "@/components/molecules/glass-card";

interface CommentSectionProps {
	issueNumber: number;
}

export function CommentSection({ issueNumber }: CommentSectionProps) {
	const queryClient = useQueryClient();
	const [newComment, setNewComment] = useState("");

	const {
		data: result,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["github", "comments", issueNumber],
		queryFn: () => getComments(issueNumber),
	});

	const mutation = useMutation({
		mutationFn: async (body: string) => {
			const res = await postComment({ number: issueNumber, body });
			if (!res.success) throw new Error(res.error);
			return res.data;
		},
		onSuccess: () => {
			toast.success("Comment posted");
			setNewComment("");
			queryClient.invalidateQueries({
				queryKey: ["github", "comments", issueNumber],
			});
		},
		onError: (err) => {
			toast.error(err.message);
		},
	});

	if (isLoading)
		return <div className="p-4 text-center">Loading comments...</div>;

	// Explicit type narrowing for Result<T> to satisfy TypeScript
	if (error || !result || !result.success) {
		const errorMessage =
			error?.message ||
			(result && !result.success ? result.error : "Unknown error");
		return (
			<div className="p-4 text-red-500">
				Failed to load comments: {errorMessage}
			</div>
		);
	}

	const comments = result.data || [];

	return (
		<div className="space-y-4">
			<h3 className="text-lg font-semibold flex items-center gap-2">
				<MessageSquare className="h-4 w-4" />
				Comments ({comments.length})
			</h3>

			<div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
				{comments.length === 0 ? (
					<p className="text-muted-foreground text-sm italic">
						No comments yet.
					</p>
				) : (
					comments.map((comment) => (
						<GlassCard
							key={comment.id}
							className="p-4 text-sm"
							variant="liquid"
						>
							<div className="flex items-center gap-2 mb-2">
								{comment.user?.avatar_url && (
									// biome-ignore lint/a11y/useAltText: Avatar is decorative if name is present
									// biome-ignore lint/performance/noImgElement: External image source
									<img
										src={comment.user.avatar_url}
										className="w-6 h-6 rounded-full"
									/>
								)}
								<span className="font-medium text-foreground">
									{comment.user?.login}
								</span>
								<span className="text-muted-foreground text-xs">
									{formatDistanceToNow(new Date(comment.created_at), {
										addSuffix: true,
									})}
								</span>
							</div>
							<div className="prose dark:prose-invert max-w-none text-sm whitespace-pre-wrap">
								{comment.body}
							</div>
						</GlassCard>
					))
				)}
			</div>

			<div className="flex flex-col gap-2">
				<Textarea
					placeholder="Leave a comment..."
					value={newComment}
					onChange={(e) => setNewComment(e.target.value)}
					className="min-h-[80px]"
				/>
				<div className="flex justify-end">
					<Button
						size="sm"
						onClick={() => mutation.mutate(newComment)}
						disabled={!newComment.trim() || mutation.isPending}
					>
						{mutation.isPending ? (
							<RefreshCw className="h-4 w-4 animate-spin mr-2" />
						) : (
							<Send className="h-4 w-4 mr-2" />
						)}
						Comment
					</Button>
				</div>
			</div>
		</div>
	);
}
