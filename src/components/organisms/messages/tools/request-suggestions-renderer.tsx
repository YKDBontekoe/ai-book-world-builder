"use client";

import { DocumentToolResult } from "@/components/organisms/document/document";
import {
	Tool,
	ToolContent,
	ToolHeader,
	ToolInput,
	ToolOutput,
} from "@/components/molecules/tool";
import type { ToolMessagePart, ToolRendererProps } from "@/components/organisms/messages/tools/types";

export const RequestSuggestionsRenderer = ({
	part,
	isReadonly,
}: ToolRendererProps) => {
	const toolPart = part as unknown as ToolMessagePart;
	const { toolCallId, state, output } = toolPart;

	let uiState:
		| "input-streaming"
		| "input-available"
		| "output-available"
		| "output-error" = "input-available";

	if (state === "partial-call") {
		uiState = "input-streaming";
	} else if (state === "call") {
		uiState = "input-available";
	} else if (state === "result") {
		if (output && typeof output === "object" && "error" in output) {
			uiState = "output-error";
		} else {
			uiState = "output-available";
		}
	}

	return (
		<Tool defaultOpen={true} key={toolCallId}>
			<ToolHeader state={uiState} type="tool-requestSuggestions" />
			<ToolContent>
				{state === "partial-call" || state === "call" ? (
					<ToolInput input={toolPart.input} />
				) : null}
				{state === "result" && (
					<ToolOutput
						errorText={undefined}
						output={
							output && "error" in output ? (
								<div className="rounded border p-2 text-red-500">
									Error: {String(output.error)}
								</div>
							) : (
								<DocumentToolResult
									isReadonly={isReadonly}
									result={output}
									type="request-suggestions"
								/>
							)
						}
					/>
				)}
			</ToolContent>
		</Tool>
	);
};
