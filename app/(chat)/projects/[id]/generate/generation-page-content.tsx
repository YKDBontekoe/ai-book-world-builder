"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GenerationView } from "@/components/generation/generation-view";
import type { Project } from "@/lib/db/schema";

interface GenerationPageContentProps {
  project: Project;
  initialGenerationId?: string | null;
}

export function GenerationPageContent({ project, initialGenerationId }: GenerationPageContentProps) {
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
              Book Generation
            </h1>
            <p className="text-sm text-muted-foreground">{project.name}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <GenerationView project={project} existingGenerationId={initialGenerationId} />
      </main>
    </div>
  );
}
