"use client";

import { GenericTool } from "@/components/chat/generic-tool";
import { EntityProposal } from "@/components/chat/widgets/entity-proposal";
import { EntityWidget } from "@/components/chat/widgets/entity-widget";
import { GenerationWidget } from "@/components/chat/widgets/generation-widget";
import { SceneWidget } from "@/components/chat/widgets/scene-widget";
import { DocumentToolResult } from "@/components/document";
import { DocumentPreview } from "@/components/document-preview";
import {
	Tool,
	ToolContent,
	ToolHeader,
	ToolInput,
	ToolOutput,
} from "@/components/elements/tool";
import type { ChatMessage } from "@/lib/types";

// Extract the Part type from ChatMessage
type MessagePart = ChatMessage["parts"][number];

interface ToolRendererProps {
	part: MessagePart;
	isReadonly: boolean;
}

export function ToolRenderer({ part, isReadonly }: ToolRendererProps) {
	const { type } = part;

	if (type === "tool-createDocument") {
		const { toolCallId } = part;

		if (part.output && "error" in part.output) {
			return (
				<div
					className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-500 dark:bg-red-950/50"
					key={toolCallId}
				>
					Error creating document: {String(part.output.error)}
				</div>
			);
		}

		return (
			<DocumentPreview
				isReadonly={isReadonly}
				key={toolCallId}
				result={part.output}
			/>
		);
	}

	if (type === "tool-updateDocument") {
		const { toolCallId } = part;

		if (part.output && "error" in part.output) {
			return (
				<div
					className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-500 dark:bg-red-950/50"
					key={toolCallId}
				>
					Error updating document: {String(part.output.error)}
				</div>
			);
		}

		return (
			<div className="relative" key={toolCallId}>
				<DocumentPreview
					args={{ ...part.output, isUpdate: true }}
					isReadonly={isReadonly}
					result={part.output}
				/>
			</div>
		);
	}

	if (type === "tool-requestSuggestions") {
		const { toolCallId, state } = part;

		return (
			<Tool defaultOpen={true} key={toolCallId}>
				<ToolHeader state={state} type="tool-requestSuggestions" />
				<ToolContent>
					{state === "input-available" && <ToolInput input={part.input} />}
					{state === "output-available" && (
						<ToolOutput
							errorText={undefined}
							output={
								"error" in part.output ? (
									<div className="rounded border p-2 text-red-500">
										Error: {String(part.output.error)}
									</div>
								) : (
									<DocumentToolResult
										isReadonly={isReadonly}
										result={part.output}
										type="request-suggestions"
									/>
								)
							}
						/>
					)}
				</ToolContent>
			</Tool>
		);
	}

	if (type === "tool-createEntity" || type === "tool-updateEntity") {
		const { toolCallId } = part;
		const output = part.output as any;

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
	}

	if (type === "tool-proposeManageEntities") {
		const { toolCallId } = part;
		const output = part.output as any;

		if (!output?.proposal) return null;

		return (
			<div className="relative" key={toolCallId}>
				<EntityProposal
					projectId={output.proposal.projectId}
					operations={output.proposal.operations}
				/>
			</div>
		);
	}

	if (type === "tool-createScene" || type === "tool-updateScene") {
		const { toolCallId } = part;
		const output = part.output as any;

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
				<SceneWidget
					scene={output.scene}
					projectId={output?.scene?.projectId}
				/>
			</div>
		);
	}

	if (
		type === "tool-orchestrateBook" ||
		type === "tool-draftScene" ||
		type === "tool-runDiagnostics" ||
		type === "tool-assessReadiness" ||
		type === "tool-updateSceneCards"
	) {
		const { toolCallId, state, input, output } = part;
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
	}

	if (type === "tool-createRelation") {
		const { toolCallId } = part;
		const output = part.output as any;

		if (output && "error" in output) {
			return (
				<div
					className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-500 dark:bg-red-950/50"
					key={toolCallId}
				>
					Error creating relation: {String(output.error)}
				</div>
			);
		}

		return (
			<div
				className="mb-2 rounded-lg border bg-muted/20 p-3 text-sm"
				key={toolCallId}
			>
				{output?.message}
			</div>
		);
	}

	if (type.startsWith("tool-")) {
		// Catch-all for any other tools including generic ones
		const toolName = type.replace("tool-", "");
		const toolPart = part as any;
		const { toolCallId, state, input, output } = toolPart;

		return (
			<GenericTool
				key={toolCallId}
				toolCallId={toolCallId}
				toolName={toolName}
				state={state}
				input={input}
				output={output}
			/>
		);
	}

	return null;
}
