"use client";

import {
	type InfiniteData,
	useInfiniteQuery,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { isToday, isYesterday, subMonths, subWeeks } from "date-fns";
import { motion } from "framer-motion";
import { Loader2Icon, MessageSquare, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/atoms/alert-dialog";
import { Button } from "@/components/atoms/button";
import { ScrollArea } from "@/components/atoms/scroll-area";
import { api } from "@/lib/api-client";
import type { Chat } from "@/lib/db/schema";
import { QUERY_KEYS } from "@/lib/query-options";
import { cn } from "@/lib/utils";

export type ChatHistory = {
	chats: Chat[];
	hasMore: boolean;
};

const PAGE_SIZE = 20;

const groupChatsByDate = (chats: Chat[]) => {
	const now = new Date();
	const oneWeekAgo = subWeeks(now, 1);
	const oneMonthAgo = subMonths(now, 1);

	return chats.reduce(
		(groups, chat) => {
			const chatDate = new Date(chat.createdAt);

			if (isToday(chatDate)) {
				groups.today.push(chat);
			} else if (isYesterday(chatDate)) {
				groups.yesterday.push(chat);
			} else if (chatDate > oneWeekAgo) {
				groups.lastWeek.push(chat);
			} else if (chatDate > oneMonthAgo) {
				groups.lastMonth.push(chat);
			} else {
				groups.older.push(chat);
			}

			return groups;
		},
		{
			today: [] as Chat[],
			yesterday: [] as Chat[],
			lastWeek: [] as Chat[],
			lastMonth: [] as Chat[],
			older: [] as Chat[],
		},
	);
};

interface ChatHistoryListProps {
	projectId: string;
	onSelectChat: (chatId: string) => void;
	currentChatId: string;
}

export function ChatHistoryList({
	projectId,
	onSelectChat,
	currentChatId,
}: ChatHistoryListProps) {
	const queryClient = useQueryClient();
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
		useInfiniteQuery({
			queryKey: QUERY_KEYS.chatHistory(), // We might want to key this by projectId if we want to separate caches, but the API handles it.
			// Ideally: [...QUERY_KEYS.chatHistory(), projectId]
			queryFn: async ({ pageParam }) => {
				const params: Record<string, string | number> = {
					limit: PAGE_SIZE,
					projectId,
				};
				if (pageParam) {
					params.ending_before = pageParam as string;
				}
				return api.get<ChatHistory>("/api/history", { params });
			},
			initialPageParam: null as string | null,
			getNextPageParam: (lastPage) => {
				if (!lastPage.hasMore) return undefined;
				const lastChat = lastPage.chats.at(-1);
				return lastChat ? lastChat.id : undefined;
			},
		});

	const { mutate: deleteChat } = useMutation({
		mutationFn: async (chatId: string) => {
			return api.delete(`/api/chat`, { params: { id: chatId } });
		},
		onMutate: async (chatId) => {
			await queryClient.cancelQueries({ queryKey: QUERY_KEYS.chatHistory() });

			const previousHistory = queryClient.getQueryData<
				InfiniteData<ChatHistory>
			>(QUERY_KEYS.chatHistory());

			queryClient.setQueryData<InfiniteData<ChatHistory>>(
				QUERY_KEYS.chatHistory(),
				(old) => {
					if (!old) return old;
					return {
						...old,
						pages: old.pages.map((page) => ({
							...page,
							chats: page.chats.filter((chat) => chat.id !== chatId),
						})),
					};
				},
			);

			return { previousHistory };
		},
		onSuccess: () => {
			toast.success("Chat deleted successfully");
		},
		onError: (error, _, context) => {
			toast.error("Failed to delete chat");
			if (context?.previousHistory) {
				queryClient.setQueryData(
					QUERY_KEYS.chatHistory(),
					context.previousHistory,
				);
			}
		},
	});

	const handleDelete = () => {
		if (!deleteId) return;
		deleteChat(deleteId);
		setShowDeleteDialog(false);
		if (deleteId === currentChatId) {
			// Ideally trigger a reset of the chat view if the deleted chat was active
			// But we don't have a direct callback for that here aside from onSelectChat which might expect a valid ID.
			// For now, let's just leave it, or maybe onSelectChat(null) if supported.
		}
	};

	if (isLoading) {
		return (
			<div className="flex flex-col gap-2 p-4">
				{[...Array(5)].map((_, i) => (
					<div
							// biome-ignore lint/suspicious/noArrayIndexKey: Skeleton loader
						key={i}
						className="h-10 w-full animate-pulse rounded-md bg-muted/50"
					/>
				))}
			</div>
		);
	}

	const hasEmptyChatHistory = data?.pages[0]?.chats.length === 0;

	if (hasEmptyChatHistory) {
		return (
			<div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
				<p className="text-sm">No chat history for this project.</p>
			</div>
		);
	}

	const chatsFromHistory = data?.pages.flatMap((page) => page.chats) || [];
	const groupedChats = groupChatsByDate(chatsFromHistory);

	return (
		<div className="flex h-full flex-col">
			<ScrollArea className="flex-1">
				<div className="flex flex-col gap-6 p-4">
					{Object.entries(groupedChats).map(([group, chats]) => {
						if (chats.length === 0) return null;

						let label = "";
						switch (group) {
							case "today":
								label = "Today";
								break;
							case "yesterday":
								label = "Yesterday";
								break;
							case "lastWeek":
								label = "Last 7 Days";
								break;
							case "lastMonth":
								label = "Last 30 Days";
								break;
							case "older":
								label = "Older";
								break;
						}

						return (
							<div key={group} className="flex flex-col gap-2">
								<h3 className="text-xs font-medium text-muted-foreground px-2">
									{label}
								</h3>
								{chats.map((chat) => (
									<div
										key={chat.id}
										role="button"
										tabIndex={0}
										onKeyDown={(e) => {
											if (e.key === "Enter" || e.key === " ") {
												onSelectChat(chat.id);
											}
										}}
										className={cn(
											"group relative flex cursor-pointer items-center justify-between rounded-lg px-2 py-2 text-sm transition-colors hover:bg-muted/50",
											chat.id === currentChatId && "bg-muted font-medium",
										)}
										onClick={() => onSelectChat(chat.id)}
									>
										<div className="flex items-center gap-2 overflow-hidden">
											<span className="truncate">{chat.title}</span>
										</div>
										<Button
											variant="ghost"
											size="icon"
											className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
											onClick={(e) => {
												e.stopPropagation();
												setDeleteId(chat.id);
												setShowDeleteDialog(true);
											}}
										>
											<Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
										</Button>
									</div>
								))}
							</div>
						);
					})}

					<motion.div
						onViewportEnter={() => {
							if (!isFetchingNextPage && hasNextPage) {
								fetchNextPage();
							}
						}}
					/>

					{isFetchingNextPage && (
						<div className="flex justify-center py-2">
							<Loader2Icon className="h-4 w-4 animate-spin text-muted-foreground" />
						</div>
					)}
				</div>
			</ScrollArea>

			<AlertDialog onOpenChange={setShowDeleteDialog} open={showDeleteDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete chat?</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently delete this chat history.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
