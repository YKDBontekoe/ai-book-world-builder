"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import equal from "fast-deep-equal";
import { motion } from "framer-motion";
import { SparklesIcon } from "lucide-react";
import { memo, useState } from "react";
import { PreviewAttachment } from "@/components/chat/preview-attachment";
import { MessageContent } from "@/components/elements/message";
import { Response } from "@/components/elements/response";
import { MessageActions } from "@/components/messages/message-actions";
import { MessageEditor } from "@/components/messages/message-editor";
import { MessageReasoning } from "@/components/messages/message-reasoning";
import { MessageStreamingSources } from "@/components/messages/message-streaming-sources";
import { MessageUsage } from "@/components/messages/message-usage";
import { ToolRenderer } from "@/components/messages/tool-renderer";
import { springs } from "@/lib/animations";
import type { Vote } from "@/lib/db/schema";
import type { ChatMessage } from "@/lib/types";
import { cn, sanitizeText } from "@/lib/utils";

const PurePreviewMessage = ({
	chatId,
	message,
	vote,
	isLoading,
	isLast,
	setMessages,
	regenerate,
	isReadonly,
	requiresScrollPadding: _requiresScrollPadding,
}: {
	chatId: string;
	message: ChatMessage;
	vote: Vote | undefined;
	isLoading: boolean;
	isLast?: boolean;
	setMessages: UseChatHelpers<ChatMessage>["setMessages"];
	regenerate: UseChatHelpers<ChatMessage>["regenerate"];
	isReadonly: boolean;
	requiresScrollPadding: boolean;
}) => {
	const [mode, setMode] = useState<"view" | "edit">("view");

	const attachmentsFromMessage =
		message.parts?.filter((part) => part.type === "file") ?? [];

	return (
		<div
			className="group/message w-full"
			data-role={message.role}
			data-testid={`message-${message.role}`}
		>
			<div
				className={cn("flex w-full items-start gap-3", {
					"justify-end": message.role === "user" && mode !== "edit",
					"justify-start": message.role === "assistant",
				})}
			>
				{message.role === "assistant" && (
					<div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md ring-1 ring-white/20">
						<SparklesIcon size={14} />
					</div>
				)}

				<div
					className={cn("flex flex-col", {
						"gap-2 md:gap-4": message.parts?.some(
							(p) => p.type === "text" && p.text?.trim(),
						),
						"w-full":
							(message.role === "assistant" &&
								message.parts?.some(
									(p) => p.type === "text" && p.text?.trim(),
								)) ||
							mode === "edit",
						"max-w-[calc(100%-2.5rem)] sm:max-w-[min(fit-content,80%)]":
							message.role === "user" && mode !== "edit",
					})}
				>
					{attachmentsFromMessage.length > 0 && (
						<div
							className="flex flex-row justify-end gap-2"
							data-testid={"message-attachments"}
						>
							{attachmentsFromMessage.map((attachment) => (
								<PreviewAttachment
									attachment={{
										name: attachment.filename ?? "file",
										contentType: attachment.mediaType,
										url: attachment.url,
									}}
									key={attachment.url}
								/>
							))}
						</div>
					)}

					{(!message.parts || message.parts.length === 0) &&
						message.content && (
							<div key={`message-${message.id}-content`}>
								<MessageContent
									className={cn("shadow-sm", {
										"w-fit break-words rounded-3xl px-6 py-4 text-base leading-relaxed text-right text-white":
											message.role === "user",
										"bg-transparent px-0 py-0 text-left shadow-none":
											message.role === "assistant",
									})}
									data-testid="message-content"
									style={
										message.role === "user"
											? {
													backgroundImage:
														"linear-gradient(to top left, hsl(212 95% 48%), hsl(220 90% 58%))",
													boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)",
												}
											: undefined
									}
								>
									<Response>{sanitizeText(message.content)}</Response>
								</MessageContent>
							</div>
						)}

					{message.parts?.map((part, index) => {
						const { type } = part;
						const key = `message-${message.id}-part-${index}`;

						if (type === "reasoning" && part.text?.trim().length > 0) {
							return (
								<MessageReasoning
									isLoading={isLoading}
									key={key}
									reasoning={part.text}
								/>
							);
						}

						if (type === "text") {
							if (mode === "view") {
								return (
									<div key={key}>
										<MessageContent
											className={cn("shadow-sm", {
												"w-fit break-words rounded-3xl px-6 py-4 text-base leading-relaxed text-right text-white":
													message.role === "user",
												"bg-transparent px-0 py-0 text-left shadow-none":
													message.role === "assistant",
											})}
											data-testid="message-content"
											style={
												message.role === "user"
													? {
															backgroundImage:
																"linear-gradient(to top left, hsl(212 95% 48%), hsl(220 90% 58%))",
															boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)",
														}
													: undefined
											}
										>
											<Response>{sanitizeText(part.text)}</Response>
										</MessageContent>
									</div>
								);
							}

							if (mode === "edit") {
								return (
									<div
										className="flex w-full flex-row items-start gap-3"
										key={key}
									>
										<div className="size-8" />
										<div className="min-w-0 flex-1">
											<MessageEditor
												key={message.id}
												message={message}
												regenerate={regenerate}
												setMessages={setMessages}
												setMode={setMode}
											/>
										</div>
									</div>
								);
							}
						}

						if (type.startsWith("tool-")) {
							const toolCallId = (part as any).toolCallId;
							return (
								<ToolRenderer
									key={toolCallId || key}
									part={part}
									isReadonly={isReadonly}
								/>
							);
						}

						return null;
					})}

					{message.role === "assistant" &&
						isLoading &&
						message.parts?.length > 0 &&
						message.parts.at(-1)?.type === "text" && (
							<span className="inline-block w-2.5 h-4 ml-1 align-middle animate-pulse bg-zinc-900 dark:bg-zinc-100 rounded-[2px]" />
						)}

					{/* Display source citations for assistant messages */}
					{message.role === "assistant" && isLoading && (
						<MessageStreamingSources />
					)}

					{message.role === "assistant" &&
						isLoading &&
						(message.parts?.length === 0 ||
							(message.parts?.length === 1 &&
								message.parts[0].type === "text" &&
								message.parts[0].text.length === 0)) && (
							<div className="flex items-center gap-1 p-0 text-muted-foreground text-sm">
								<span className="animate-pulse">Thinking...</span>
							</div>
						)}

					<div className="flex items-center gap-2 mt-1 empty:hidden">
						{!isReadonly && (
							<MessageActions
								chatId={chatId}
								isLoading={isLoading}
								isLast={isLast}
								key={`action-${message.id}`}
								message={message}
								regenerate={regenerate}
								setMode={setMode}
								vote={vote}
							/>
						)}
						<MessageUsage usage={message.usage} />
					</div>
				</div>
			</div>
		</div>
	);
};

export const PreviewMessage = memo(
	PurePreviewMessage,
	(prevProps, nextProps) => {
		if (prevProps.isLoading !== nextProps.isLoading) {
			return false;
		}
		if (prevProps.message.id !== nextProps.message.id) {
			return false;
		}
		if (prevProps.requiresScrollPadding !== nextProps.requiresScrollPadding) {
			return false;
		}
		if (!equal(prevProps.message.parts, nextProps.message.parts)) {
			return false;
		}
		if (!equal(prevProps.vote, nextProps.vote)) {
			return false;
		}

		return true;
	},
);

export const ThinkingMessage = () => {
	return (
		<motion.div
			className="group/message w-full"
			initial={{ opacity: 0, y: 10, scale: 0.98 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			transition={springs.liquid}
			data-role="assistant"
			data-testid="message-assistant-loading"
		>
			<div className="flex items-start justify-start gap-3">
				<div className="-mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-sm ring-1 ring-white/20">
					<div className="animate-pulse">
						<SparklesIcon size={14} />
					</div>
				</div>

				<div className="flex w-full flex-col gap-2 md:gap-4">
					<div className="flex items-center gap-2 rounded-xl bg-muted/40 px-3 py-2 text-muted-foreground text-sm backdrop-blur-sm w-fit">
						<div className="flex gap-1">
							<motion.span
								animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
								transition={{ duration: 1, repeat: Infinity, delay: 0 }}
								className="size-1.5 rounded-full bg-foreground/50"
							/>
							<motion.span
								animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
								transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
								className="size-1.5 rounded-full bg-foreground/50"
							/>
							<motion.span
								animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
								transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
								className="size-1.5 rounded-full bg-foreground/50"
							/>
						</div>
						<span className="font-medium">Thinking</span>
					</div>
				</div>
			</div>
		</motion.div>
	);
};
