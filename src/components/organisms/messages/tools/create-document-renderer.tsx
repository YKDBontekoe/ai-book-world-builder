"use client";

import { DocumentPreview } from "@/components/organisms/document/document-preview";
import type { ToolMessagePart, ToolRendererProps } from "@/components/organisms/messages/tools/types";

export const CreateDocumentRenderer = ({
	part,
	isReadonly,
}: ToolRendererProps) => {
	const toolPart = part as unknown as ToolMessagePart;
	const { toolCallId } = toolPart;

	if (toolPart.output && "error" in toolPart.output) {
		return (
			<div
				className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-500 dark:bg-red-950/50"
				key={toolCallId}
			>
				Error creating document: {String(toolPart.output.error)}
			</div>
		);
	}

	return (
		<DocumentPreview
			isReadonly={isReadonly}
			key={toolCallId}
			result={toolPart.output}
		/>
	);
};
