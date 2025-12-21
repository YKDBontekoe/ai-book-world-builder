import { createProject } from "./tools/create-project";
import { createVolume } from "./tools/create-volume";
import { draftScene } from "./tools/draft-scene";
import { exportBook } from "./tools/export-book";
import { manageEntities } from "./tools/manage-entities";
import { manageStory } from "./tools/manage-story";
import { orchestrateBook } from "./tools/orchestrate-book";
import { proposeManageEntities } from "./tools/propose-manage-entities";
import { runDiagnostics } from "./tools/run-diagnostics";
import { updateSceneCards } from "./tools/update-scene-cards";
import { createOutline } from "./tools/create-outline";
import { analyzeCharacter } from "./tools/analyze-character";
import { analyzeBook } from "./tools/analyze-book";
import { assessReadiness } from "./tools/assess-readiness";

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
