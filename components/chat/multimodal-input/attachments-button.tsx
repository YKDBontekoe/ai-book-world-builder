"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { PaperclipIcon } from "lucide-react";
import { memo } from "react";
import { Button } from "@/components/ui/button";
import type { ChatModelId } from "@/lib/ai/models";
import { getChatModelById } from "@/lib/ai/models";

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
	const selectedModel = getChatModelById(selectedModelId);
	const supportsImages = selectedModel?.supportsImages ?? false;
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
