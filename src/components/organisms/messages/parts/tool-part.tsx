"use client";

import equal from "fast-deep-equal";
import { memo } from "react";
import { ToolRenderer } from "@/components/organisms/messages/tool-renderer";
import type { ToolInvocation } from "@/lib/types";

interface ToolPartProps {
	part: ToolInvocation;
	isReadonly: boolean;
}

function PureToolPart({
	part,
	isReadonly,
}: ToolPartProps): React.ReactElement | null {
	return <ToolRenderer part={part} isReadonly={isReadonly} />;
}

/**
 * A memoized component that renders a tool invocation.
 *
 * It uses `fast-deep-equal` to compare the `part` prop, preventing unnecessary re-renders
 * when the parent message object is recreated but the tool data remains structurally identical.
 *
 * @param props - The component properties.
 * @param props.part - The tool invocation data.
 * @param props.isReadonly - Whether the tool is in read-only mode.
 * @returns The rendered tool component.
 */
export const ToolPart = memo(PureToolPart, (prev, next) => {
	if (prev.isReadonly !== next.isReadonly) return false;

	// Optimization: If part reference is stable, skip deep comparison
	if (prev.part === next.part) return true;

	// Fallback to deep equality for tool parts (args, type, toolCallId)
	return equal(prev.part, next.part);
});
