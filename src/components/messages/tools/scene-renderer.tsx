"use client";

import { SceneWidget } from "@/components/chat/widgets/scene-widget";
import type { ToolMessagePart, ToolRendererProps } from "./types";

export const SceneRenderer = ({ part }: ToolRendererProps) => {
	const toolPart = part as unknown as ToolMessagePart;
	const { toolCallId } = toolPart;
	const output = toolPart.output;

	if (output?.error) {
		return (
			<div
				className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-500 text-sm dark:border-red-900 dark:bg-red-950/50"
				key={toolCallId}
			>
				Error: {output.error}
			</div>
		);
	}

	if (!output?.scene) return null;

	return (
		<div className="relative" key={toolCallId}>
			<SceneWidget scene={output.scene} projectId={output?.scene?.projectId} />
		</div>
	);
};
