import type { DataUIPart, InferUITool, UIMessage } from "ai";
import { z } from "zod";
import type { ArtifactKind } from "@/components/organisms/artifact/types";
import type { analyzeCharacter } from "@/lib/ai/tools/analyze-character";

export interface ToolInvocation {
	toolCallId: string;
	toolName: string;
	args: Record<string, unknown>;
	state: "partial-call" | "call" | "result";
	result?: unknown;
}

import type { assessReadiness } from "@/lib/ai/tools/assess-readiness";
import type { createDocument } from "@/lib/ai/tools/create-document";
import type { createOutline } from "@/lib/ai/tools/create-outline";
import type { createVolume } from "@/lib/ai/tools/create-volume";
import type { draftScene } from "@/lib/ai/tools/draft-scene";
import type { orchestrateBook } from "@/lib/ai/tools/orchestrate-book";
import type { proposeManageEntities } from "@/lib/ai/tools/propose-manage-entities";
import type { requestSuggestions } from "@/lib/ai/tools/request-suggestions";
import type { runDiagnostics } from "@/lib/ai/tools/run-diagnostics";
import type { updateDocument } from "@/lib/ai/tools/update-document";
import type { updateSceneCards } from "@/lib/ai/tools/update-scene-cards";
import type { Suggestion, Chapter, Scene } from "@/lib/db/schema";
import type { AppUsage } from "@/lib/usage";

export type SceneWithPrev = Scene & { prevSceneId: string | null };
export type ChapterWithScenes = Chapter & { scenes: SceneWithPrev[] };

export type ProcessLog = {
	type: "tool-log";
	message: string;
	tool: string;
	timestamp: number;
};

// DataPart includes standard DataUIParts (derived from CustomUIDataTypes) and custom parts
export type DataPart =
  | DataUIPart<CustomUIDataTypes>
  | { type: "append-message"; message: string }
  | ProcessLog;

export const messageMetadataSchema = z.object({
	createdAt: z.string(),
});

export type MessageMetadata = z.infer<typeof messageMetadataSchema>;

type createDocumentTool = InferUITool<ReturnType<typeof createDocument>>;
type updateDocumentTool = InferUITool<ReturnType<typeof updateDocument>>;
type requestSuggestionsTool = InferUITool<
	ReturnType<typeof requestSuggestions>
>;
type createOutlineTool = InferUITool<ReturnType<typeof createOutline>>;
type createVolumeTool = InferUITool<ReturnType<typeof createVolume>>;
type analyzeCharacterTool = InferUITool<ReturnType<typeof analyzeCharacter>>;

type orchestrateBookTool = InferUITool<ReturnType<typeof orchestrateBook>>;
type draftSceneTool = InferUITool<ReturnType<typeof draftScene>>;
type assessReadinessTool = InferUITool<ReturnType<typeof assessReadiness>>;
type runDiagnosticsTool = InferUITool<ReturnType<typeof runDiagnostics>>;
type updateSceneCardsTool = InferUITool<ReturnType<typeof updateSceneCards>>;
type proposeManageEntitiesTool = InferUITool<
	ReturnType<typeof proposeManageEntities>
>;

export type ChatTools = {
	createDocument: createDocumentTool;
	updateDocument: updateDocumentTool;
	requestSuggestions: requestSuggestionsTool;
	createOutline: createOutlineTool;
	createVolume: createVolumeTool;
	analyzeCharacter: analyzeCharacterTool;

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
	id?: string;
	content?: string;
	toolInvocations?: ToolInvocation[];
	usage?: AppUsage;
	createdAt?: string | Date;
};

export type Attachment = {
	name: string;
	url: string;
	contentType: string;
};
