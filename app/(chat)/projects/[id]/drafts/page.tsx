import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/app/(auth)/auth";
import { Button } from "@/components/ui/button";
import {
  getOutlinesForProject,
  getProjectByIdWithAccess,
} from "@/lib/db/queries";
import type { Outline } from "@/lib/db/schema";
import { DraftWorkspace } from "./workspace";

export default async function DraftsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session) {
    redirect("/api/auth/guest");
  }

  const project = await getProjectByIdWithAccess({
    id,
    userId: session.user?.id,
  });

  if (!project) {
    notFound();
  }

  const outlines: Outline[] = await getOutlinesForProject({
    projectId: project.id,
  });

  const canEdit =
    session.user?.type === "regular" && session.user?.id === project.userId;

  return (
    <div className="flex min-h-dvh flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-sm">Project</p>
          <h1 className="font-semibold text-3xl leading-tight">
            {project.name}
          </h1>
          <p className="text-muted-foreground text-sm">
            Ground drafts and outlines with your lore entities.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/projects/${project.id}`}>Back to project</Link>
        </Button>
      </div>

      <DraftWorkspace
        canEdit={canEdit}
        outlines={outlines}
        projectId={project.id}
        visibility={project.visibility}
      />
    </div>
  );
}
