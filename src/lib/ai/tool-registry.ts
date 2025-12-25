import { analyzeBook } from "@/lib/ai/tools/analyze-book";
import { analyzeCharacter } from "@/lib/ai/tools/analyze-character";
import { analyzeConsistency } from "@/lib/ai/tools/analyze-consistency";
import { assessReadiness } from "@/lib/ai/tools/assess-readiness";
import { batchWriteChapter } from "@/lib/ai/tools/batch-write-chapter";
import { createOutline } from "@/lib/ai/tools/create-outline";
import { createProject } from "@/lib/ai/tools/create-project";
import { createVolume } from "@/lib/ai/tools/create-volume";
import { critiqueChapter } from "@/lib/ai/tools/critique-chapter";
import { draftScene } from "@/lib/ai/tools/draft-scene";
import { expandScene } from "@/lib/ai/tools/expand-scene";
import { exportBook } from "@/lib/ai/tools/export-book";
import { generateLore } from "@/lib/ai/tools/generate-lore";
import { manageEntities } from "@/lib/ai/tools/manage-entities";
import { manageStory } from "@/lib/ai/tools/manage-story";
import { orchestrateBook } from "@/lib/ai/tools/orchestrate-book";
import { proposeManageEntities } from "@/lib/ai/tools/propose-manage-entities";
import { rewriteScene } from "@/lib/ai/tools/rewrite-scene";
import { runDiagnostics } from "@/lib/ai/tools/run-diagnostics";
import { searchProject } from "@/lib/ai/tools/search-project";
import { updateSceneCards } from "@/lib/ai/tools/update-scene-cards";
import { updateSceneContent } from "@/lib/ai/tools/update-scene-content";

type Session = any;
type DataStream = any;

export function getAgentTools({
	session,
	projectId,
	dataStream,
}: {
	session: Session;
	projectId?: string | null;
	dataStream?: DataStream;
}) {
	return {
		// --- Core Creation ---
		createProject: createProject({ session }),
		createOutline: createOutline({
			session,
			projectId: projectId ?? undefined,
		}),
		createVolume: createVolume({
			session,
			projectId: projectId ?? undefined,
		}),

		// --- Content Generation (New) ---
		batchWriteChapter: batchWriteChapter(),
		rewriteScene: rewriteScene(),
		expandScene: expandScene(),

		// --- Management ---
		exportBook: exportBook({
			session,
			projectId: projectId ?? undefined,
		}),
		manageEntities: manageEntities({
			session,
			projectId: projectId ?? undefined,
		}),
		manageStory: manageStory({
			session,
			projectId: projectId ?? undefined,
		}),
		proposeManageEntities: proposeManageEntities(),

		// --- Analysis & World (New & Existing) ---
		analyzeCharacter: analyzeCharacter({ session }),
		analyzeBook: analyzeBook({
			session,
			projectId: projectId ?? undefined,
		}),
		analyzeConsistency: analyzeConsistency(),
		critiqueChapter: critiqueChapter(),
		generateLore: generateLore(),
		searchProject: searchProject(),

		// --- Dynamic Pipeline ---
		orchestrateBook: orchestrateBook({ dataStream }),
		draftScene: draftScene({ session }),
		updateSceneContent: updateSceneContent(),
		updateSceneCards: updateSceneCards({ session }),
		runDiagnostics: runDiagnostics({ session }),
		assessReadiness: assessReadiness({
			session,
			projectId: projectId ?? undefined,
		}),
	};
}

export type AgentTools = ReturnType<typeof getAgentTools>;
export type AgentToolName = keyof AgentTools;

export const toolList: AgentToolName[] = [
	"createProject",
	"exportBook",
	"createVolume",
	"createOutline",
	"analyzeCharacter",
	"analyzeBook",

	// New Tools
	"batchWriteChapter",
	"rewriteScene",
	"expandScene",
	"analyzeConsistency",
	"critiqueChapter",
	"generateLore",
	"searchProject",

	// Consolidated Managers
	"manageEntities",
	"manageStory",

	// Dynamic Book Pipeline
	"orchestrateBook",
	"updateSceneCards",
	"updateSceneContent",
	"draftScene",
	"runDiagnostics",
	"assessReadiness",
	"proposeManageEntities",
];
