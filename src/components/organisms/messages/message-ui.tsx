import { cva, type VariantProps } from "class-variance-authority";
import equal from "fast-deep-equal";
import type React from "react";
import { memo, type ReactNode } from "react";
import { MessageContent } from "@/components/molecules/message";
import { PreviewAttachment } from "@/components/organisms/chat/preview-attachment";
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
	attachments: {
		url: string;
		filename?: string;
		mediaType?: string;
		contentType?: string; // Fallback
	}[];
}

// Optimization: Memoize MessageAttachments to prevent unnecessary re-renders
// during streaming when message.parts updates but attachments are stable.
// Using deep comparison because parent component regenerates the array on every render.
export const MessageAttachments = memo(
	function MessageAttachments({ attachments }: MessageAttachmentsProps) {
		if (!attachments || attachments.length === 0) return null;

		return (
			<div
				className="flex flex-row justify-end gap-2"
				data-testid="message-attachments"
			>
				{attachments.map((attachment) => (
					<PreviewAttachment
						attachment={{
							name: attachment.filename ?? "file",
							contentType:
								attachment.mediaType ??
								attachment.contentType ??
								"application/octet-stream",
							url: attachment.url,
						}}
						key={attachment.url}
					/>
				))}
			</div>
		);
	},
	(prev, next) => equal(prev.attachments, next.attachments),
);
