"use client";

import { memo } from "react";
import { MessageReasoning } from "@/components/organisms/messages/message-reasoning";

interface ReasoningPartProps {
	isLoading: boolean;
	reasoning: string;
}

export const ReasoningPart = memo(function ReasoningPart({
	isLoading,
	reasoning,
}: ReasoningPartProps) {
	if (!reasoning.trim()) return null;

	return <MessageReasoning isLoading={isLoading} reasoning={reasoning} />;
});
