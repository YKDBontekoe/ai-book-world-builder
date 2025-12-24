"use client";

import { GenerationWidget } from "@/components/organisms/chat/widgets/generation-widget";
import type {
	ToolMessagePart,
	ToolRendererProps,
} from "@/components/organisms/messages/tools/types";

export const GenerationRenderer = ({ part }: ToolRendererProps) => {
	const toolPart = part as unknown as ToolMessagePart;
	const { type } = toolPart;
	const { toolCallId, state, input, output } = toolPart;
	const toolName = type.replace("tool-", "");

	return (
		<div className="relative" key={toolCallId}>
			<GenerationWidget
				toolName={toolName}
				state={state}
				input={input}
				output={output}
			/>
		</div>
	);
};
