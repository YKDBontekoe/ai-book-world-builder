"use client";
import type { UseChatHelpers } from "@ai-sdk/react";
import equal from "fast-deep-equal";
import { motion } from "framer-motion";
import { SparklesIcon } from "lucide-react";
import { memo, useState } from "react";
import { useDataStream } from "@/components/chat/data-stream-provider";
import { GenericTool } from "@/components/chat/generic-tool";
import { PreviewAttachment } from "@/components/chat/preview-attachment";
import { EntityProposal } from "@/components/chat/widgets/entity-proposal";
import { EntityWidget } from "@/components/chat/widgets/entity-widget";
import { GenerationWidget } from "@/components/chat/widgets/generation-widget";
import { SceneWidget } from "@/components/chat/widgets/scene-widget";
import { DocumentToolResult } from "@/components/document";
import { DocumentPreview } from "@/components/document-preview";
import { MessageContent } from "@/components/elements/message";
import { Response } from "@/components/elements/response";
import {
	Tool,
	ToolContent,
	ToolHeader,
	ToolInput,
	ToolOutput,
} from "@/components/elements/tool";
import { MessageActions } from "@/components/messages/message-actions";
import { MessageEditor } from "@/components/messages/message-editor";
import { MessageReasoning } from "@/components/messages/message-reasoning";
import { MessageSources } from "@/components/messages/message-sources";
import { MessageUsage } from "@/components/messages/message-usage";
import { Weather } from "@/components/weather";
import type { Vote } from "@/lib/db/schema";
import type { ChatMessage, SourceCitation } from "@/lib/types";
import { cn, sanitizeText } from "@/lib/utils";

const PurePreviewMessage = ({
	chatId,
	message,
	vote,
	isLoading,
	setMessages,
	regenerate,
	isReadonly,
	requiresScrollPadding: _requiresScrollPadding,
}: {
	chatId: string;
	message: ChatMessage;
	vote: Vote | undefined;
	isLoading: boolean;
	setMessages: UseChatHelpers<ChatMessage>["setMessages"];
	regenerate: UseChatHelpers<ChatMessage>["regenerate"];
	isReadonly: boolean;
	requiresScrollPadding: boolean;
}) => {
	const [mode, setMode] = useState<"view" | "edit">("view");

	const attachmentsFromMessage =
		message.parts?.filter((part) => part.type === "file") ?? [];

	const { dataStream } = useDataStream();

	// Extract sources from data stream
	const sources = dataStream
		.filter((item) => item.type === "data-sources")
		.flatMap((item) => item.data as SourceCitation[]);

	return (
		<motion.div
			className="group/message w-full"
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, ease: "easeOut" }}
			data-role={message.role}
			data-testid={`message-${message.role}`}
		>
			<div
				className={cn("flex w-full items-start gap-2 md:gap-3", {
					"justify-end": message.role === "user" && mode !== "edit",
					"justify-start": message.role === "assistant",
				})}
			>
				{message.role === "assistant" && (
					<div className="-mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-sm ring-1 ring-white/20">
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
											className={cn({
												"w-fit break-words rounded-2xl px-3 py-2 text-right text-white":
													message.role === "user",
												"bg-transparent px-0 py-0 text-left":
													message.role === "assistant",
											})}
											data-testid="message-content"
											style={
												message.role === "user"
													? { backgroundColor: "#006cff" }
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

						if (type === "tool-getWeather") {
							const { toolCallId, state } = part;

							return (
								<Tool defaultOpen={true} key={toolCallId}>
									<ToolHeader state={state} type="tool-getWeather" />
									<ToolContent>
										{state === "input-available" && (
											<ToolInput input={part.input} />
										)}
										{state === "output-available" && (
											<ToolOutput
												errorText={undefined}
												output={<Weather weatherAtLocation={part.output} />}
											/>
										)}
									</ToolContent>
								</Tool>
							);
						}

						if (type === "tool-createDocument") {
							const { toolCallId } = part;

							if (part.output && "error" in part.output) {
								return (
									<div
										className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-500 dark:bg-red-950/50"
										key={toolCallId}
									>
										Error creating document: {String(part.output.error)}
									</div>
								);
							}

							return (
								<DocumentPreview
									isReadonly={isReadonly}
									key={toolCallId}
									result={part.output}
								/>
							);
						}

						if (type === "tool-updateDocument") {
							const { toolCallId } = part;

							if (part.output && "error" in part.output) {
								return (
									<div
										className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-500 dark:bg-red-950/50"
										key={toolCallId}
									>
										Error updating document: {String(part.output.error)}
									</div>
								);
							}

							return (
								<div className="relative" key={toolCallId}>
									<DocumentPreview
										args={{ ...part.output, isUpdate: true }}
										isReadonly={isReadonly}
										result={part.output}
									/>
								</div>
							);
						}

						if (type === "tool-requestSuggestions") {
							const { toolCallId, state } = part;

							return (
								<Tool defaultOpen={true} key={toolCallId}>
									<ToolHeader state={state} type="tool-requestSuggestions" />
									<ToolContent>
										{state === "input-available" && (
											<ToolInput input={part.input} />
										)}
										{state === "output-available" && (
											<ToolOutput
												errorText={undefined}
												output={
													"error" in part.output ? (
														<div className="rounded border p-2 text-red-500">
															Error: {String(part.output.error)}
														</div>
													) : (
														<DocumentToolResult
															isReadonly={isReadonly}
															result={part.output}
															type="request-suggestions"
														/>
													)
												}
											/>
										)}
									</ToolContent>
								</Tool>
							);
						}

						if (type === "tool-createEntity" || type === "tool-updateEntity") {
							const { toolCallId } = part;
							const output = part.output as any;

							if (output?.error) {
								return (
									<div
										className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-500 text-sm dark:border-red-900 dark:bg-red-950/50"
										key={toolCallId}
									>
										Error: {output.error}
									</div>
								);
							}

							if (!output?.entity) return null;

							return (
								<div className="relative" key={toolCallId}>
									<EntityWidget
										entity={output.entity}
										projectId={output?.entity?.projectId}
									/>
								</div>
							);
						}

						if (type === "tool-proposeManageEntities") {
							const { toolCallId } = part;
							const output = part.output as any;

							if (!output?.proposal) return null;

							return (
								<div className="relative" key={toolCallId}>
									<EntityProposal
										projectId={output.proposal.projectId}
										operations={output.proposal.operations}
									/>
								</div>
							);
						}

						if (type === "tool-createScene" || type === "tool-updateScene") {
							const { toolCallId } = part;
							const output = part.output as any;

							if (output?.error) {
								return (
									<div
										className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-500 text-sm dark:border-red-900 dark:bg-red-950/50"
										key={toolCallId}
									>
										Error: {output.error}
									</div>
								);
							}

							if (!output?.scene) return null;

							return (
								<div className="relative" key={toolCallId}>
									<SceneWidget
										scene={output.scene}
										projectId={output?.scene?.projectId}
									/>
								</div>
							);
						}

						if (
							type === "tool-orchestrateBook" ||
							type === "tool-draftScene" ||
							type === "tool-runDiagnostics" ||
							type === "tool-assessReadiness" ||
							type === "tool-updateSceneCards"
						) {
							const { toolCallId, state, input, output } = part;
							const toolName = type.replace("tool-", "");

							return (
								<div className="relative" key={toolCallId}>
									<GenerationWidget
										toolName={toolName}
										state={state}
										input={input}
										output={output}
									/>
								</div>
							);
						}

						if (type === "tool-createRelation") {
							const { toolCallId } = part;
							const output = part.output as any;

							if (output && "error" in output) {
								return (
									<div
										className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-500 dark:bg-red-950/50"
										key={toolCallId}
									>
										Error creating relation: {String(output.error)}
									</div>
								);
							}

							return (
								<div
									className="mb-2 rounded-lg border bg-muted/20 p-3 text-sm"
									key={toolCallId}
								>
									{output?.message}
								</div>
							);
						}

						if (type.startsWith("tool-")) {
							// Catch-all for any other tools including generic ones
							const toolName = type.replace("tool-", "");
							const toolPart = part as any;
							const { toolCallId, state, input, output } = toolPart;

							return (
								<GenericTool
									key={toolCallId}
									toolCallId={toolCallId}
									toolName={toolName}
									state={state}
									input={input}
									output={output}
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
					{message.role === "assistant" && sources.length > 0 && (
						<MessageSources sources={sources} />
					)}

					{message.role === "assistant" &&
						isLoading &&
						(message.parts?.length === 0 ||
							(message.parts?.length === 1 &&
								message.parts[0].type === "text" &&
								message.parts[0].text.length === 0)) && (
							<div className="flex items-center gap-1 p-0 text-muted-foreground text-sm">
								<span className="animate-pulse">Thinking</span>
								<span className="inline-flex">
									<span className="animate-bounce [animation-delay:0ms]">
										.
									</span>
									<span className="animate-bounce [animation-delay:150ms]">
										.
									</span>
									<span className="animate-bounce [animation-delay:300ms]">
										.
									</span>
								</span>
							</div>
						)}

					<div className="flex items-center gap-2 mt-1 empty:hidden">
						{!isReadonly && (
							<MessageActions
								chatId={chatId}
								isLoading={isLoading}
								key={`action-${message.id}`}
								message={message}
								setMode={setMode}
								vote={vote}
							/>
						)}
						<MessageUsage usage={message.usage} />
					</div>
				</div>
			</div>
		</motion.div>
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
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, ease: "easeOut" }}
			data-role="assistant"
			data-testid="message-assistant-loading"
		>
			<div className="flex items-start justify-start gap-3">
				<div className="-mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-zinc-500 to-zinc-600 text-white shadow-sm ring-1 ring-white/20">
					<div className="animate-pulse">
						<SparklesIcon size={14} />
					</div>
				</div>

				<div className="flex w-full flex-col gap-2 md:gap-4">
					<div className="flex items-center gap-1 p-0 text-muted-foreground text-sm">
						<span className="animate-pulse">Thinking</span>
						<span className="inline-flex">
							<span className="animate-bounce [animation-delay:0ms]">.</span>
							<span className="animate-bounce [animation-delay:150ms]">.</span>
							<span className="animate-bounce [animation-delay:300ms]">.</span>
						</span>
					</div>
				</div>
			</div>
		</motion.div>
	);
};
