"use client";

import dynamic from "next/dynamic";
import { SceneNavigation } from "./left-sidebar/scene-navigation";
import type { Project } from "@/lib/db/schema";
import type { ChapterWithScenes } from "@/lib/types";

const StructureEditorDialog = dynamic(() => import("./structure-editor-dialog").then(mod => mod.StructureEditorDialog));
const ProjectSettingsModal = dynamic(() => import("./project-settings-modal").then(mod => mod.ProjectSettingsModal));

interface WriterSidebarProps {
  project: Project;
  structure: ChapterWithScenes[];
  structureText: string;
  activeSceneId: string | null;
  onSceneSelect: (id: string) => void;
  loading: boolean;
  onStructureUpdate: () => void;
}

export function WriterSidebar({
  project,
  structure,
  structureText,
  activeSceneId,
  onSceneSelect,
  loading,
  onStructureUpdate,
}: WriterSidebarProps) {
  return (
    <div className="flex flex-col h-full border-r animate-in slide-in-from-left-4 duration-500 ease-spring">
      <div className="p-4 border-b flex items-center justify-between">
         <h2 className="font-semibold">Outline</h2>
         <div className="flex gap-1">
             <StructureEditorDialog
                project={project}
                initialStructureText={structureText}
                onStructureUpdate={onStructureUpdate}
             />
             <ProjectSettingsModal project={project} />
         </div>
      </div>
      <SceneNavigation
         project={project}
         structure={structure}
         activeSceneId={activeSceneId}
         onSceneSelect={onSceneSelect}
         loading={loading}
         onStructureUpdate={onStructureUpdate}
      />
   </div>
  );
}
