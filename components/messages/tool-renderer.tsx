"use client";

import { CreateDocumentRenderer } from "@/components/messages/tools/create-document-renderer";
import { CreateRelationRenderer } from "@/components/messages/tools/create-relation-renderer";
import { EntityRenderer } from "@/components/messages/tools/entity-renderer";
import { GenerationRenderer } from "@/components/messages/tools/generation-renderer";
import { GenericToolRenderer } from "@/components/messages/tools/generic-tool-renderer";
import { ProposeManageEntitiesRenderer } from "@/components/messages/tools/propose-manage-entities-renderer";
import { RequestSuggestionsRenderer } from "@/components/messages/tools/request-suggestions-renderer";
import { SceneRenderer } from "@/components/messages/tools/scene-renderer";
import type { ToolRendererProps } from "@/components/messages/tools/types";
import { UpdateDocumentRenderer } from "@/components/messages/tools/update-document-renderer";

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
