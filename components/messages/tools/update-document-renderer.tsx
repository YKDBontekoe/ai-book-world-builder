"use client";

import { DocumentPreview } from "../../document-preview";
import { ToolError } from "./tool-error";
import type { ToolMessagePart, ToolRendererProps } from "./types";

export const UpdateDocumentRenderer = ({ part, isReadonly }: ToolRendererProps) => {
	const toolPart = part as unknown as ToolMessagePart;
	const { toolCallId } = toolPart;

	if (toolPart.output && "error" in toolPart.output) {
		return (
			<ToolError
				error={toolPart.output.error}
				toolCallId={toolCallId}
				prefix="Error updating document"
			/>
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
