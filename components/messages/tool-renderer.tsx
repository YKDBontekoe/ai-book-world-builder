"use client";

import { CreateDocumentRenderer } from "./tools/create-document-renderer";
import { CreateRelationRenderer } from "./tools/create-relation-renderer";
import { EntityRenderer } from "./tools/entity-renderer";
import { GenerationRenderer } from "./tools/generation-renderer";
import { GenericToolRenderer } from "./tools/generic-tool-renderer";
import { ProposeManageEntitiesRenderer } from "./tools/propose-manage-entities-renderer";
import { RequestSuggestionsRenderer } from "./tools/request-suggestions-renderer";
import { SceneRenderer } from "./tools/scene-renderer";
import type { ToolRendererProps } from "./tools/types";
import { UpdateDocumentRenderer } from "./tools/update-document-renderer";

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
