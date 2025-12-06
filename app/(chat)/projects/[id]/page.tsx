import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  getEntitiesForProject,
  getProjectByIdWithAccess,
  getRelationshipsForProject,
} from "@/lib/db/queries";

function buildWarnings({
  entities,
  relationships,
}: {
  // biome-ignore lint/suspicious/noExplicitAny: derived from server fetch
  entities: any[];
  // biome-ignore lint/suspicious/noExplicitAny: derived from server fetch
  relationships: any[];
}) {
  const warnings: string[] = [];

  entities.forEach((entity) => {
    if (entity.startDate && entity.endDate) {
      const start = new Date(entity.startDate);
      const end = new Date(entity.endDate);
      if (start > end) {
        warnings.push(`${entity.name} has conflicting start and end dates.`);
      }
    }
  });

  relationships.forEach((relationship) => {
    if (relationship.startDate && relationship.endDate) {
      const start = new Date(relationship.startDate);
      const end = new Date(relationship.endDate);
      if (start > end) {
        warnings.push(
          `${relationship.type} relationship has conflicting start and end dates.`
        );
      }
    }
  });

  return warnings;
}

export default async function ProjectDetailPage({
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

  const [entities, relationships] = await Promise.all([
    getEntitiesForProject({ projectId: project.id }),
    getRelationshipsForProject({ projectId: project.id }),
  ]);

  const warnings = buildWarnings({ entities, relationships });

  const canEdit =
    session.user?.type === "regular" && project.userId === session.user.id;

  return (
    <div className="flex min-h-dvh flex-col gap-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-semibold text-2xl">{project.name}</h1>
            <Badge variant="secondary">{project.visibility}</Badge>
          </div>
          {project.description && (
            <p className="max-w-3xl text-muted-foreground">
              {project.description}
            </p>
          )}
          <p className="text-muted-foreground text-sm">
            {canEdit
              ? "You own this project."
              : "Viewing with read-only access."}
          </p>
        </div>
        <div className="text-right text-muted-foreground text-sm">
          Created {new Date(project.createdAt).toLocaleDateString()}
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="text-lg">Schema overview</CardTitle>
            <p className="text-muted-foreground text-sm">
              Entities, attributes, and relationships power validation in your
              drafts.
            </p>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href={`/projects/${project.id}/entities`}>Manage schema</Link>
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-3">
          <div>
            <p className="text-muted-foreground text-sm">Entities</p>
            <p className="font-semibold text-xl">{entities.length}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Relationships</p>
            <p className="font-semibold text-xl">{relationships.length}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Warnings</p>
            <p className="font-semibold text-xl">{warnings.length}</p>
          </div>
        </CardContent>
      </Card>

      {warnings.length > 0 && (
        <Card className="border-amber-500/50">
          <CardHeader>
            <CardTitle className="text-base">Draft warnings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-amber-700 text-sm">
            {warnings.map((warning) => (
              <p key={warning}>{warning}</p>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg">Draft workspace</CardTitle>
            <p className="text-muted-foreground text-sm">
              Generate outlines and drafts grounded in your entities and
              relationships.
            </p>
          </div>
          <Button asChild size="sm" variant="default">
            <Link href={`/projects/${project.id}/drafts`}>
              Open draft workspace
            </Link>
          </Button>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Project folders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {project.folders.map((folder) => (
            <div className="space-y-2" key={folder.id}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium leading-tight">{folder.name}</p>
                  <p className="text-muted-foreground text-sm">
                    {folder.description}
                  </p>
                </div>
                <Badge variant="outline">{folder.slug}</Badge>
              </div>
              <Separator />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
