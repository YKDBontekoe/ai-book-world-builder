import { cva, type VariantProps } from "class-variance-authority";
import type React from "react";
import type { ReactNode } from "react";
import type { Attachment } from "@/lib/types";
import { cn } from "@/lib/utils";
import { MessageContent } from "@/components/elements/message";
import { PreviewAttachment } from "@/components/chat/preview-attachment";

const messageBubbleVariants = cva(
	"w-fit break-words rounded-[20px] px-5 py-2.5 text-base leading-relaxed text-left shadow-sm",
	{
		variants: {
			role: {
				user: "rounded-br-sm text-white",
				assistant: "rounded-bl-sm bg-muted text-foreground",
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
						"linear-gradient(to top left, hsl(212 95% 48%), hsl(220 90% 58%))",
					boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)",
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

export function MessageAttachments({ attachments }: MessageAttachmentsProps) {
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
						contentType: attachment.mediaType ?? attachment.contentType ?? "application/octet-stream",
						url: attachment.url,
					}}
					key={attachment.url}
				/>
			))}
		</div>
	);
}
