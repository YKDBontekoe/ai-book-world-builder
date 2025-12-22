"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { PaperclipIcon } from "lucide-react";
import { memo } from "react";
import { Button } from "@/components/atoms/button";
import type { ChatModelId } from "@/lib/ai/models";

import type { ChatMessage } from "@/lib/types";

function PureAttachmentsButton({
	fileInputRef,
	status,
	selectedModelId,
}: {
	fileInputRef: React.MutableRefObject<HTMLInputElement | null>;
	status: UseChatHelpers<ChatMessage>["status"];
	selectedModelId: ChatModelId;
}) {
	// Assume all OpenRouter models support images for now, or at least don't block upload UI
	// Doing async check here is hard without a hook.
    // Ideally we pass `supportsImages` as a prop.
	const supportsImages = true;
	const isDisabled = status !== "ready" || !supportsImages;

	return (
		<Button
			aria-label="Attach files"
			className="aspect-square h-8 rounded-lg p-1 transition-colors hover:bg-accent"
			data-testid="attachments-button"
			disabled={isDisabled}
			onClick={(event) => {
				event.preventDefault();
				fileInputRef.current?.click();
			}}
			variant="ghost"
		>
			<PaperclipIcon size={14} />
		</Button>
	);
}

export const AttachmentsButton = memo(PureAttachmentsButton);
