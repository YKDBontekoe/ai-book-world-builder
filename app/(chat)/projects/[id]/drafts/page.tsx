import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/app/(auth)/auth";
import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
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
    <PageContainer>
      <PageHeader
        action={
          <Button asChild variant="outline">
            <Link href={`/projects/${project.id}`}>Back to project</Link>
          </Button>
        }
        description="Ground drafts and outlines with your lore entities."
        metadata="Project"
        title={project.name}
      />

      <DraftWorkspace
        canEdit={canEdit}
        outlines={outlines}
        projectId={project.id}
        visibility={project.visibility}
      />
    </PageContainer>
  );
}
