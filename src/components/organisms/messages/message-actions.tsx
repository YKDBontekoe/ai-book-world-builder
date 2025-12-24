"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import equal from "fast-deep-equal";
import {
	CopyIcon,
	PencilIcon,
	RefreshCcw,
	ThumbsDownIcon,
	ThumbsUpIcon,
} from "lucide-react";
import { memo } from "react";
import { toast } from "sonner";
import { useCopyToClipboard } from "usehooks-ts";
import { Action, Actions } from "@/components/molecules/actions";
import { api } from "@/lib/api-client";
import type { Vote } from "@/lib/db/schema";
import { QUERY_KEYS } from "@/lib/query-options";
import type { ChatMessage } from "@/lib/types";

export function PureMessageActions({
	chatId,
	message,
	vote,
	isLoading,
	isLast,
	setMode,
	regenerate,
}: {
	chatId: string;
	message: ChatMessage;
	vote: Vote | undefined;
	isLoading: boolean;
	isLast?: boolean;
	setMode?: (mode: "view" | "edit") => void;
	regenerate: UseChatHelpers<ChatMessage>["regenerate"];
}) {
	const queryClient = useQueryClient();
	const [_, copyToClipboard] = useCopyToClipboard();

	const { mutate: submitVote } = useMutation({
		mutationFn: async (type: "up" | "down") => {
			return api.patch("/api/vote", {
				chatId,
				messageId: message.id,
				type,
			});
		},
		onMutate: async (type) => {
			await queryClient.cancelQueries({ queryKey: QUERY_KEYS.votes(chatId) });

			const previousVotes = queryClient.getQueryData<Vote[]>(
				QUERY_KEYS.votes(chatId),
			);

			queryClient.setQueryData<Vote[]>(
				QUERY_KEYS.votes(chatId),
				(currentVotes) => {
					if (!currentVotes) {
						return [];
					}

					const votesWithoutCurrent = currentVotes.filter(
						(currentVote) => currentVote.messageId !== message.id,
					);

					return [
						...votesWithoutCurrent,
						{
							chatId,
							messageId: message.id,
							isUpvoted: type === "up",
						},
					];
				},
			);

			return { previousVotes };
		},
		onSuccess: (_, type) => {
			toast.success(
				type === "up" ? "Upvoted Response!" : "Downvoted Response!",
			);
		},
		onError: (_, __, context) => {
			if (context?.previousVotes) {
				queryClient.setQueryData(
					QUERY_KEYS.votes(chatId),
					context.previousVotes,
				);
			}
			toast.error("Failed to vote.");
		},
	});

	if (isLoading) {
		return null;
	}

	const textFromParts = message.parts
		?.filter((part) => part.type === "text")
		.map((part) => part.text)
		.join("\n")
		.trim();

	const handleCopy = async () => {
		if (!textFromParts) {
			toast.error("There's no text to copy!");
			return;
		}

		await copyToClipboard(textFromParts);
		toast.success("Copied to clipboard!");
	};

	// User messages
	if (message.role === "user") {
		return (
			<Actions className="-mr-0.5 justify-end">
				<div className="relative">
					{setMode && (
						<Action
							className="-left-10 absolute top-0 opacity-0 transition-opacity focus-visible:opacity-100 group-hover/message:opacity-100"
							data-testid="message-edit-button"
							onClick={() => setMode("edit")}
							tooltip="Edit"
						>
							<PencilIcon size={14} />
						</Action>
					)}

					<Action onClick={handleCopy} tooltip="Copy">
						<CopyIcon size={14} />
					</Action>

					{/* Retry mechanism for the last user message if needed */}
					{isLast && (
						<Action
							onClick={() => {
								regenerate();
								toast.success("Retrying...");
							}}
							tooltip="Retry"
						>
							<RefreshCcw size={14} />
						</Action>
					)}
				</div>
			</Actions>
		);
	}

	// Assistant messages
	return (
		<Actions className="-ml-0.5">
			<Action onClick={handleCopy} tooltip="Copy">
				<CopyIcon size={14} />
			</Action>

			{/* Regenerate for last assistant message */}
			{isLast && (
				<Action
					onClick={() => {
						regenerate();
						toast.success("Regenerating response...");
					}}
					tooltip="Regenerate"
				>
					<RefreshCcw size={14} />
				</Action>
			)}

			<Action
				data-testid="message-upvote"
				disabled={vote?.isUpvoted}
				onClick={() => submitVote("up")}
				tooltip="Upvote Response"
			>
				<ThumbsUpIcon size={14} />
			</Action>

			<Action
				data-testid="message-downvote"
				disabled={vote && !vote.isUpvoted}
				onClick={() => submitVote("down")}
				tooltip="Downvote Response"
			>
				<ThumbsDownIcon size={14} />
			</Action>
		</Actions>
	);
}

export const MessageActions = memo(
	PureMessageActions,
	(prevProps, nextProps) => {
		if (!equal(prevProps.vote, nextProps.vote)) {
			return false;
		}
		if (prevProps.isLoading !== nextProps.isLoading) {
			return false;
		}
		if (prevProps.isLast !== nextProps.isLast) {
			return false;
		}

		return true;
	},
);
