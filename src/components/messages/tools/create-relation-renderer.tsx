"use client";

import type { ToolMessagePart, ToolRendererProps } from "./types";

export const CreateRelationRenderer = ({ part }: ToolRendererProps) => {
	const toolPart = part as unknown as ToolMessagePart;
	const { toolCallId } = toolPart;
	const output = toolPart.output;

	if (output && "error" in output) {
		return (
			<div
				className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-500 dark:bg-red-950/50"
				key={toolCallId}
			>
				Error creating relation: {String(output.error)}
			</div>
		);
	}

	return (
		<div
			className="mb-2 rounded-lg border bg-muted/20 p-3 text-sm"
			key={toolCallId}
		>
			{output?.message}
		</div>
	);
};
