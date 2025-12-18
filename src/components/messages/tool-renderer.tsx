"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "../ui/skeleton";
import type { ToolRendererProps } from "./tools/types";

// Loading fallback for tools
const ToolSkeleton = () => <Skeleton className="h-32 w-full" />;

// Dynamically import tool renderers to reduce initial bundle size
const CreateDocumentRenderer = dynamic(
	() =>
		import("./tools/create-document-renderer").then(
			(mod) => mod.CreateDocumentRenderer,
		),
	{ loading: ToolSkeleton },
);

const CreateRelationRenderer = dynamic(
	() =>
		import("./tools/create-relation-renderer").then(
			(mod) => mod.CreateRelationRenderer,
		),
	{ loading: ToolSkeleton },
);

const EntityRenderer = dynamic(
	() => import("./tools/entity-renderer").then((mod) => mod.EntityRenderer),
	{ loading: ToolSkeleton },
);

const GenerationRenderer = dynamic(
	() =>
		import("./tools/generation-renderer").then((mod) => mod.GenerationRenderer),
	{ loading: ToolSkeleton },
);

const GenericToolRenderer = dynamic(
	() =>
		import("./tools/generic-tool-renderer").then(
			(mod) => mod.GenericToolRenderer,
		),
	{ loading: ToolSkeleton },
);

const ProposeManageEntitiesRenderer = dynamic(
	() =>
		import("./tools/propose-manage-entities-renderer").then(
			(mod) => mod.ProposeManageEntitiesRenderer,
		),
	{ loading: ToolSkeleton },
);

const RequestSuggestionsRenderer = dynamic(
	() =>
		import("./tools/request-suggestions-renderer").then(
			(mod) => mod.RequestSuggestionsRenderer,
		),
	{ loading: ToolSkeleton },
);

const SceneRenderer = dynamic(
	() => import("./tools/scene-renderer").then((mod) => mod.SceneRenderer),
	{ loading: ToolSkeleton },
);

const UpdateDocumentRenderer = dynamic(
	() =>
		import("./tools/update-document-renderer").then(
			(mod) => mod.UpdateDocumentRenderer,
		),
	{ loading: ToolSkeleton },
);

const toolRenderers: Record<string, React.ComponentType<ToolRendererProps>> = {
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
