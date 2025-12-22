"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { StopCircleIcon } from "lucide-react";
import { memo } from "react";
import { Button } from "@/components/atoms/button";
import type { ChatMessage } from "@/lib/types";

function PureStopButton({
	stop,
	setMessages,
}: {
	stop: () => void;
	setMessages: UseChatHelpers<ChatMessage>["setMessages"];
}) {
	return (
		<Button
			aria-label="Stop generating"
			className="size-7 rounded-full bg-foreground p-1 text-background transition-colors duration-200 hover:bg-foreground/90 disabled:bg-muted disabled:text-muted-foreground"
			data-testid="stop-button"
			onClick={(event) => {
				event.preventDefault();
				stop();
				setMessages((messages) => messages);
			}}
		>
			<StopCircleIcon size={14} />
		</Button>
	);
}

export const StopButton = memo(PureStopButton);
