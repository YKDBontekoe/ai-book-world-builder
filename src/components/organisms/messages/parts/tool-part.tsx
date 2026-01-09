"use client";

import equal from "fast-deep-equal";
import { memo } from "react";
import { ToolRenderer } from "@/components/organisms/messages/tool-renderer";

interface ToolPartProps {
	part: any; // Using any to match existing flexibility, or precise type from ai SDK
	isReadonly: boolean;
}

export const ToolPart = memo(
	function ToolPart({ part, isReadonly }: ToolPartProps) {
		return <ToolRenderer part={part} isReadonly={isReadonly} />;
	},
	(prev, next) => {
		return prev.isReadonly === next.isReadonly && equal(prev.part, next.part);
	},
);
