"use client";

import { GenericTool } from "../../chat/generic-tool";
import type { ToolMessagePart, ToolRendererProps } from "./types";

export const GenericToolRenderer = ({ part }: ToolRendererProps) => {
	const toolPart = part as unknown as ToolMessagePart;
	const { type } = toolPart;
	const toolName = type.replace("tool-", "");
	const { toolCallId, state, input, output } = toolPart;

	return (
		<GenericTool
			key={toolCallId}
			toolCallId={toolCallId}
			toolName={toolName}
			state={state}
			input={input}
			output={output}
		/>
	);
};
