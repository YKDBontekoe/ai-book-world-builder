import { cva, type VariantProps } from "class-variance-authority";
import equal from "fast-deep-equal";
import type React from "react";
import { memo, type ReactNode } from "react";
import { MessageContent } from "@/components/molecules/message";
import { PreviewAttachment } from "@/components/organisms/chat/preview-attachment";
import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";

const messageBubbleVariants = cva(
	"w-fit break-words rounded-[20px] px-5 py-2.5 text-base leading-relaxed text-left shadow-sm",
	{
		variants: {
			role: {
				user: "rounded-br-sm text-primary-foreground",
				assistant: "rounded-bl-sm glass-panel text-foreground",
			},
		},
		defaultVariants: {
			role: "assistant",
		},
	},
);

type MessageBubbleVariantProps = VariantProps<typeof messageBubbleVariants>;

interface MessageBubbleProps
	extends React.HTMLAttributes<HTMLDivElement>,
		Omit<MessageBubbleVariantProps, "role"> {
	children: ReactNode;
	role: "user" | "assistant" | "system" | "data";
}

export function MessageBubble({
	children,
	className,
	role,
	...props
}: MessageBubbleProps) {
	// Map 'data' or 'system' roles to 'assistant' style if needed,
	// or handle them explicitly. For now, we only have styles for user/assistant.
	const variantRole = role === "user" ? "user" : "assistant";

	const userStyles =
		role === "user"
			? {
					backgroundImage:
						"linear-gradient(to top left, var(--primary), var(--color-sidebar-primary))",
					boxShadow: "0 4px 12px rgba(124, 58, 237, 0.25)", // Violet shadow
				}
			: undefined;

	return (
		<MessageContent
			className={cn(messageBubbleVariants({ role: variantRole }), className)}
			style={{ ...userStyles, ...props.style }}
			data-testid="message-content"
			{...props}
		>
			{children}
		</MessageContent>
	);
}

interface MessageAttachmentsProps {
	parts: ChatMessage["parts"];
}

// Optimization: Memoize MessageAttachments to prevent unnecessary re-renders
// during streaming when message.parts updates but attachments are stable.
// We extract file parts and compare them deeply, ignoring text/tool updates.
export const MessageAttachments = memo(
	function MessageAttachments({ parts }: MessageAttachmentsProps) {
		const attachments =
			parts
				?.filter((part) => part.type === "file")
				.map((a) => ({
					url: a.url,
					filename: a.filename,
					mediaType: a.mediaType,
				})) ?? [];

		if (attachments.length === 0) return null;

		return (
			<div
				className="flex flex-row justify-end gap-2"
				data-testid="message-attachments"
			>
				{attachments.map((attachment) => (
					<PreviewAttachment
						attachment={{
							name: attachment.filename ?? "file",
							contentType: attachment.mediaType ?? "application/octet-stream",
							url: attachment.url,
						}}
						key={attachment.url}
					/>
				))}
			</div>
		);
	},
	(prev, next) => {
		// If reference is same, definitely equal
		if (prev.parts === next.parts) return true;

		// Filter to only file parts
		const prevFiles = prev.parts?.filter((p) => p.type === "file") ?? [];
		const nextFiles = next.parts?.filter((p) => p.type === "file") ?? [];

		// Compare length first for speed
		if (prevFiles.length !== nextFiles.length) return false;

		// Deep compare only the file parts
		return equal(prevFiles, nextFiles);
	},
);
