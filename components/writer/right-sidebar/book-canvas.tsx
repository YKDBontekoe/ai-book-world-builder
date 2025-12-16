"use client";

import { useState } from "react";
import { Project } from "@/lib/db/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Network, FileClock, BookOpen } from "lucide-react";
import { NodeGraph } from "./node-graph";

interface BookCanvasProps {
  project: Project;
  activeSceneId: string | null;
  onSceneSelect: (sceneId: string) => void;
  structure: any; // Type strictly later
}

export function BookCanvas({ project, activeSceneId, onSceneSelect, structure }: BookCanvasProps) {
  return (
    <div className="h-full flex flex-col bg-muted/20 backdrop-blur-xl border-l">
      <div className="p-2 border-b">
         <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Book Canvas</h2>
      </div>
      <Tabs defaultValue="graph" className="flex-1 flex flex-col">
        <div className="px-4 py-2 border-b">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="graph" title="Branch Graph"><Network className="h-4 w-4"/></TabsTrigger>
              <TabsTrigger value="timeline" title="Timeline"><FileClock className="h-4 w-4"/></TabsTrigger>
              <TabsTrigger value="bible" title="Story Bible"><BookOpen className="h-4 w-4"/></TabsTrigger>
            </TabsList>
        </div>

        <TabsContent value="graph" className="flex-1 mt-0 p-0 relative min-h-0">
           <NodeGraph
             structure={structure}
             activeSceneId={activeSceneId}
             onNodeClick={onSceneSelect}
           />
        </TabsContent>
        <TabsContent value="timeline" className="flex-1 mt-0 p-4">
           <div className="text-sm text-muted-foreground text-center mt-10">Timeline View (Coming Soon)</div>
        </TabsContent>
        <TabsContent value="bible" className="flex-1 mt-0 p-4">
           <div className="text-sm text-muted-foreground text-center mt-10">Story Bible (Coming Soon)</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
