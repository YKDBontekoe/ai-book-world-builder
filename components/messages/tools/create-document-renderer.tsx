"use client";

import { DocumentPreview } from "../../document-preview";
import { ToolError } from "./tool-error";
import type { ToolMessagePart, ToolRendererProps } from "./types";

export const CreateDocumentRenderer = ({ part, isReadonly }: ToolRendererProps) => {
	const toolPart = part as unknown as ToolMessagePart;
	const { toolCallId } = toolPart;

	if (toolPart.output && "error" in toolPart.output) {
		return (
			<ToolError
				error={toolPart.output.error}
				toolCallId={toolCallId}
				prefix="Error creating document"
			/>
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
