"use client";

import { memo } from "react";
import { MessageReasoning } from "@/components/organisms/messages/message-reasoning";

interface ReasoningPartProps {
	isLoading: boolean;
	reasoning: string;
}

function PureReasoningPart({
	isLoading,
	reasoning,
}: ReasoningPartProps): React.ReactElement | null {
	if (!reasoning.trim()) return null;

	return <MessageReasoning isLoading={isLoading} reasoning={reasoning} />;
}

/**
 * A memoized component that renders the reasoning part of a message.
 *
 * @param props - The properties object.
 * @param props.isLoading - Whether the reasoning is currently being generated.
 * @param props.reasoning - The reasoning text content.
 * @returns The rendered reasoning component or null if content is empty.
 */
export const ReasoningPart = memo(PureReasoningPart);
