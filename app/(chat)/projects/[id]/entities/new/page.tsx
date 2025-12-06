import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/app/(auth)/auth";
import { getProjectByIdWithAccess } from "@/lib/db/queries";
import { CreateEntityForm } from "./create-entity-form";

export default async function NewEntityPage({
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
    redirect("/projects");
  }

  const canEdit = session.user?.type === "regular" && project.userId === session.user.id;

  if (!canEdit) {
    redirect(`/projects/${project.id}`);
  }

  return (
    <div className="flex min-h-dvh flex-col gap-6 p-6">
      <div className="space-y-1">
        <Button asChild variant="ghost" className="px-0" size="sm">
          <Link href={`/projects/${project.id}/entities`}>Back to schema</Link>
        </Button>
        <h1 className="font-semibold text-2xl">Add a new entity</h1>
        <p className="text-muted-foreground text-sm">
          Define the people, places, and artifacts that appear in your drafts.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
        <CreateEntityForm projectId={project.id} />
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Drafting guidance</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm space-y-2">
            <p>
              Keep names unique to avoid confusing AI assistants. If the same
              entity evolves over time, reuse the name and update the dates so we
              can warn about conflicts in drafts.
            </p>
            <p>
              When an entity spans multiple eras, keep start and end dates
              aligned so relationships inherit accurate timelines.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
