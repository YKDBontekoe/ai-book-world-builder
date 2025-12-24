"use client";

import { MessageReasoning } from "@/components/organisms/messages/message-reasoning";

interface ReasoningPartProps {
	isLoading: boolean;
	reasoning: string;
}

export function ReasoningPart({ isLoading, reasoning }: ReasoningPartProps) {
	if (!reasoning.trim()) return null;

	return <MessageReasoning isLoading={isLoading} reasoning={reasoning} />;
}
