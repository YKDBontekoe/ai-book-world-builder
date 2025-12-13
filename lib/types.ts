import type { InferUITool, UIMessage } from "ai";
import { z } from "zod";
import type { ArtifactKind } from "@/components/artifact/types";
import type { analyzeCharacter } from "./ai/tools/analyze-character";

export interface ToolInvocation {
	toolCallId: string;
	toolName: string;
	args: Record<string, unknown>;
	state: "partial-call" | "call" | "result";
	result?: unknown;
}

import type { assessReadiness } from "./ai/tools/assess-readiness";
import type { createChapter } from "./ai/tools/create-chapter";
import type { createDocument } from "./ai/tools/create-document";
import type { createEntity } from "./ai/tools/create-entity";
import type { createOutline } from "./ai/tools/create-outline";
import type { createRelation } from "./ai/tools/create-relation";
import type { createScene } from "./ai/tools/create-scene";
import type { createTimeline } from "./ai/tools/create-timeline";
import type { createVolume } from "./ai/tools/create-volume";
import type { draftScene } from "./ai/tools/draft-scene";
import type { getWeather } from "./ai/tools/get-weather";
import type { orchestrateBook } from "./ai/tools/orchestrate-book";
import type { proposeManageEntities } from "./ai/tools/propose-manage-entities";
import type { requestSuggestions } from "./ai/tools/request-suggestions";
import type { runDiagnostics } from "./ai/tools/run-diagnostics";
import type { suggestPlot } from "./ai/tools/suggest-plot";
import type { updateDocument } from "./ai/tools/update-document";
import type { updateEntity } from "./ai/tools/update-entity";
import type { updateScene } from "./ai/tools/update-scene";
import type { updateSceneCards } from "./ai/tools/update-scene-cards";
import type { Suggestion } from "./db/schema";
import type { AppUsage } from "./usage";

export type DataPart = { type: "append-message"; message: string };

export const messageMetadataSchema = z.object({
	createdAt: z.string(),
});

export type MessageMetadata = z.infer<typeof messageMetadataSchema>;

type weatherTool = InferUITool<typeof getWeather>;
type createDocumentTool = InferUITool<ReturnType<typeof createDocument>>;
type updateDocumentTool = InferUITool<ReturnType<typeof updateDocument>>;
type requestSuggestionsTool = InferUITool<
	ReturnType<typeof requestSuggestions>
>;
type createEntityTool = InferUITool<ReturnType<typeof createEntity>>;
type updateEntityTool = InferUITool<ReturnType<typeof updateEntity>>;
type createRelationTool = InferUITool<ReturnType<typeof createRelation>>;
type createChapterTool = InferUITool<ReturnType<typeof createChapter>>;
type createSceneTool = InferUITool<ReturnType<typeof createScene>>;
type updateSceneTool = InferUITool<ReturnType<typeof updateScene>>;
type createOutlineTool = InferUITool<ReturnType<typeof createOutline>>;
type createTimelineTool = InferUITool<ReturnType<typeof createTimeline>>;
type createVolumeTool = InferUITool<ReturnType<typeof createVolume>>;
type analyzeCharacterTool = InferUITool<ReturnType<typeof analyzeCharacter>>;

type suggestPlotTool = InferUITool<ReturnType<typeof suggestPlot>>;
type orchestrateBookTool = InferUITool<ReturnType<typeof orchestrateBook>>;
type draftSceneTool = InferUITool<ReturnType<typeof draftScene>>;
type assessReadinessTool = InferUITool<ReturnType<typeof assessReadiness>>;
type runDiagnosticsTool = InferUITool<ReturnType<typeof runDiagnostics>>;
type updateSceneCardsTool = InferUITool<ReturnType<typeof updateSceneCards>>;
type proposeManageEntitiesTool = InferUITool<
	ReturnType<typeof proposeManageEntities>
>;

export type ChatTools = {
	getWeather: weatherTool;
	createDocument: createDocumentTool;
	updateDocument: updateDocumentTool;
	requestSuggestions: requestSuggestionsTool;
	createEntity: createEntityTool;
	updateEntity: updateEntityTool;
	createRelation: createRelationTool;
	createChapter: createChapterTool;
	createScene: createSceneTool;
	updateScene: updateSceneTool;
	createOutline: createOutlineTool;
	createTimeline: createTimelineTool;
	createVolume: createVolumeTool;
	analyzeCharacter: analyzeCharacterTool;

	suggestPlot: suggestPlotTool;
	orchestrateBook: orchestrateBookTool;
	draftScene: draftSceneTool;
	assessReadiness: assessReadinessTool;
	runDiagnostics: runDiagnosticsTool;
	updateSceneCards: updateSceneCardsTool;
	proposeManageEntities: proposeManageEntitiesTool;
};

export type SourceCitation = {
	type: "entity" | "outline" | "chapter" | "relationship";
	id: string;
	name: string;
	kind?: string; // for entities (e.g., "Character", "Location")
};

export type CustomUIDataTypes = {
	textDelta: string;
	imageDelta: string;
	sheetDelta: string;
	codeDelta: string;
	suggestion: Suggestion;
	appendMessage: string;
	id: string;
	title: string;
	kind: ArtifactKind;
	clear: null;
	finish: null;
	usage: AppUsage;
	sources: SourceCitation[];
};

export type ChatMessage = UIMessage<
	MessageMetadata,
	CustomUIDataTypes,
	ChatTools
> & {
	content?: string;
	toolInvocations?: ToolInvocation[];
	usage?: AppUsage;
};

export type Attachment = {
	name: string;
	url: string;
	contentType: string;
};
