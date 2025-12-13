"use client";

import { SceneWidget } from "../../chat/widgets/scene-widget";
import { ToolError } from "./tool-error";
import type { ToolMessagePart, ToolRendererProps } from "./types";

export const SceneRenderer = ({ part }: ToolRendererProps) => {
	const toolPart = part as unknown as ToolMessagePart;
	const { toolCallId } = toolPart;
	const output = toolPart.output;

	if (output?.error) {
		return <ToolError error={output.error} toolCallId={toolCallId} prefix="Error" />;
	}

	if (!output?.scene) return null;

	return (
		<div className="relative" key={toolCallId}>
			<SceneWidget scene={output.scene} projectId={output?.scene?.projectId} />
		</div>
	);
};
