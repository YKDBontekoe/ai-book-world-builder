"use client";

import { GenericTool } from "@/components/chat/generic-tool";
import { EntityProposal } from "@/components/chat/widgets/entity-proposal";
import { EntityWidget } from "@/components/chat/widgets/entity-widget";
import { GenerationWidget } from "@/components/chat/widgets/generation-widget";
import { SceneWidget } from "@/components/chat/widgets/scene-widget";
import { DocumentToolResult } from "@/components/document/document";
import { DocumentPreview } from "@/components/document/document-preview";
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

// Helper type for tool parts which guaranteed have these properties
// when handled by their specific renderers
interface ToolMessagePart {
	type: string;
	toolCallId: string;
	state: "partial-call" | "call" | "result";
	input?: any;
	output?: any;
	[key: string]: any;
}

interface ToolRendererProps {
	part: MessagePart;
	isReadonly: boolean;
}

const CreateDocumentRenderer = ({ part, isReadonly }: ToolRendererProps) => {
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

const UpdateDocumentRenderer = ({ part, isReadonly }: ToolRendererProps) => {
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

const RequestSuggestionsRenderer = ({
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

const EntityRenderer = ({ part }: ToolRendererProps) => {
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

const ProposeManageEntitiesRenderer = ({ part }: ToolRendererProps) => {
	const toolPart = part as unknown as ToolMessagePart;
	const { toolCallId } = toolPart;
	const output = toolPart.output;

	if (!output?.proposal) return null;

	return (
		<div className="relative" key={toolCallId}>
			<EntityProposal
				projectId={output.proposal.projectId}
				operations={output.proposal.operations}
			/>
		</div>
	);
};

const SceneRenderer = ({ part }: ToolRendererProps) => {
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

const GenerationRenderer = ({ part }: ToolRendererProps) => {
	const toolPart = part as unknown as ToolMessagePart;
	const { type } = toolPart;
	const { toolCallId, state, input, output } = toolPart;
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
};

const CreateRelationRenderer = ({ part }: ToolRendererProps) => {
	const toolPart = part as unknown as ToolMessagePart;
	const { toolCallId } = toolPart;
	const output = toolPart.output;

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
};

const GenericToolRenderer = ({ part }: ToolRendererProps) => {
	const toolPart = part as unknown as ToolMessagePart;
	const { type } = toolPart;
	const toolName = type.replace("tool-", "");
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
};

const toolRenderers: Record<string, React.FC<ToolRendererProps>> = {
	"tool-createDocument": CreateDocumentRenderer,
	"tool-updateDocument": UpdateDocumentRenderer,
	"tool-requestSuggestions": RequestSuggestionsRenderer,
	"tool-createEntity": EntityRenderer,
	"tool-updateEntity": EntityRenderer,
	"tool-proposeManageEntities": ProposeManageEntitiesRenderer,
	"tool-createScene": SceneRenderer,
	"tool-updateScene": SceneRenderer,
	"tool-orchestrateBook": GenerationRenderer,
	"tool-draftScene": GenerationRenderer,
	"tool-runDiagnostics": GenerationRenderer,
	"tool-assessReadiness": GenerationRenderer,
	"tool-updateSceneCards": GenerationRenderer,
	"tool-createRelation": CreateRelationRenderer,
};

export function ToolRenderer({ part, isReadonly }: ToolRendererProps) {
	const { type } = part;

	// Check if we have a specific renderer
	const Renderer = toolRenderers[type];
	if (Renderer) {
		return <Renderer part={part} isReadonly={isReadonly} />;
	}

	// Fallback for any other tool starting with "tool-"
	if (type.startsWith("tool-")) {
		return <GenericToolRenderer part={part} isReadonly={isReadonly} />;
	}

	return null;
}
