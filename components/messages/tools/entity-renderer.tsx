"use client";

import { EntityWidget } from "../../chat/widgets/entity-widget";
import { ToolError } from "./tool-error";
import type { ToolMessagePart, ToolRendererProps } from "./types";

export const EntityRenderer = ({ part }: ToolRendererProps) => {
	const toolPart = part as unknown as ToolMessagePart;
	const { toolCallId } = toolPart;
	const output = toolPart.output;

	if (output?.error) {
		return <ToolError error={output.error} toolCallId={toolCallId} prefix="Error" />;
	}

	if (!output?.entity) return null;

	return (
		<div className="relative" key={toolCallId}>
			<EntityWidget
				entity={output.entity}
				projectId={output?.entity?.projectId}
			/>
		</div>
	);
};
