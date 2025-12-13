"use client";

import { ToolError } from "@/components/messages/tools/tool-error";
import type { ToolMessagePart, ToolRendererProps } from "@/components/messages/tools/types";

export const CreateRelationRenderer = ({ part }: ToolRendererProps) => {
	const toolPart = part as unknown as ToolMessagePart;
	const { toolCallId } = toolPart;
	const output = toolPart.output;

	if (output && "error" in output) {
		return (
			<ToolError
				error={output.error}
				toolCallId={toolCallId}
				prefix="Error creating relation"
			/>
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
