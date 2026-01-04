"use client";

import equal from "fast-deep-equal";
import { memo } from "react";
import { ToolRenderer } from "@/components/organisms/messages/tool-renderer";

interface ToolPartProps {
	part: any; // Using any to match existing flexibility, or precise type from ai SDK
	isReadonly: boolean;
}

function PureToolPart({ part, isReadonly }: ToolPartProps) {
	return <ToolRenderer part={part} isReadonly={isReadonly} />;
}

export const ToolPart = memo(PureToolPart, (prev, next) => {
	if (prev.isReadonly !== next.isReadonly) return false;

	// Optimization: If part reference is stable, skip deep comparison
	if (prev.part === next.part) return true;

	// Fallback to deep equality for tool parts (args, type, toolCallId)
	return equal(prev.part, next.part);
});
