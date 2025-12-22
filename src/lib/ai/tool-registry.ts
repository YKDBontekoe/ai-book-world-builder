import { createProject } from "@/lib/ai/tools/create-project";
import { createVolume } from "@/lib/ai/tools/create-volume";
import { draftScene } from "@/lib/ai/tools/draft-scene";
import { exportBook } from "@/lib/ai/tools/export-book";
import { manageEntities } from "@/lib/ai/tools/manage-entities";
import { manageStory } from "@/lib/ai/tools/manage-story";
import { orchestrateBook } from "@/lib/ai/tools/orchestrate-book";
import { proposeManageEntities } from "@/lib/ai/tools/propose-manage-entities";
import { runDiagnostics } from "@/lib/ai/tools/run-diagnostics";
import { updateSceneCards } from "@/lib/ai/tools/update-scene-cards";
import { createOutline } from "@/lib/ai/tools/create-outline";
import { analyzeCharacter } from "@/lib/ai/tools/analyze-character";
import { analyzeBook } from "@/lib/ai/tools/analyze-book";
import { assessReadiness } from "@/lib/ai/tools/assess-readiness";

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
    createProject: createProject({ session }),
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
    createOutline: createOutline({
      session,
      projectId: projectId ?? undefined,
    }),
    createVolume: createVolume({
      session,
      projectId: projectId ?? undefined,
    }),
    analyzeCharacter: analyzeCharacter({ session }),
    analyzeBook: analyzeBook({
      session,
      projectId: projectId ?? undefined,
    }),
    // Dynamic Pipeline Tools
    orchestrateBook: orchestrateBook({ dataStream }),
    draftScene: draftScene({ session }),
    updateSceneCards: updateSceneCards({ session }),
    runDiagnostics: runDiagnostics({ session }),
    assessReadiness: assessReadiness({
      session,
      projectId: projectId ?? undefined,
    }),
    proposeManageEntities: proposeManageEntities(),
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

    // Consolidated Managers
    "manageEntities",
    "manageStory",

    // Dynamic Book Pipeline
    "orchestrateBook",
    "updateSceneCards",
    "draftScene",
    "runDiagnostics",
    "assessReadiness",
    "proposeManageEntities",
];
