"use client";

import { useState } from "react";
import { ArrowLeft, BookOpen, PenTool } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { GenerationView } from "@/components/generation/generation-view";
import { WriterView } from "@/components/writer/writer-view";
import type { Project } from "@/lib/db/schema";

interface GenerationPageContentProps {
  project: Project;
  initialGenerationId?: string | null;
}

export function GenerationPageContent({
  project,
  initialGenerationId,
}: GenerationPageContentProps) {
  const [viewMode, setViewMode] = useState<"generator" | "writer">("generator");

  return (
    <div className="flex h-dvh flex-col bg-background">
      <header className="flex items-center justify-between border-b bg-background/80 px-6 py-4 backdrop-blur-xl shrink-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/projects/${project.id}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold">
              {viewMode === "generator" ? "Book Generation" : "Writer Mode"}
            </h1>
            <p className="text-sm text-muted-foreground">{project.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(value) =>
              value && setViewMode(value as "generator" | "writer")
            }
          >
            <ToggleGroupItem value="generator" aria-label="Generator Mode">
              <BookOpen className="mr-2 h-4 w-4" />
              Generator
            </ToggleGroupItem>
            <ToggleGroupItem value="writer" aria-label="Writer Mode">
              <PenTool className="mr-2 h-4 w-4" />
              Writer
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        {viewMode === "generator" ? (
          <GenerationView
            project={project}
            existingGenerationId={initialGenerationId}
          />
        ) : (
          <WriterView project={project} />
        )}
      </main>
    </div>
  );
}
