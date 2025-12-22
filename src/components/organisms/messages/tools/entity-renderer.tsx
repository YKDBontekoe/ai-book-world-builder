"use client";

import { EntityWidget } from "@/components/organisms/chat/widgets/entity-widget";
import type { ToolMessagePart, ToolRendererProps } from "@/components/organisms/messages/tools/types";

export const EntityRenderer = ({ part }: ToolRendererProps) => {
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
