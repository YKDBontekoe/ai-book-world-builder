"use client";

import { DocumentPreview } from "@/components/organisms/document/document-preview";
import type { ToolMessagePart, ToolRendererProps } from "@/components/organisms/messages/tools/types";

export const UpdateDocumentRenderer = ({
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
				Error updating document: {String(toolPart.output.error)}
			</div>
		);
	}

	return (
		<div className="relative" key={toolCallId}>
			<DocumentPreview
				args={{ ...toolPart.output, isUpdate: true }}
				isReadonly={isReadonly}
				result={toolPart.output}
			/>
		</div>
	);
};
