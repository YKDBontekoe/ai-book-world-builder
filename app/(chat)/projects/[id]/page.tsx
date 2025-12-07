import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { ExportBookDialog } from "@/components/export-book-dialog";
import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  getEntitiesForProject,
  getProjectByIdWithAccess,
  getRelationshipsForProject,
} from "@/lib/db/queries";
import type { Entity, Relationship } from "@/lib/db/schema";

function buildWarnings({
  entities,
  relationships,
}: {
  entities: Entity[];
  relationships: Relationship[];
}) {
  const warnings: string[] = [];

  for (const entity of entities) {
    if (entity.startDate && entity.endDate) {
      const start = new Date(entity.startDate);
      const end = new Date(entity.endDate);
      if (start > end) {
        warnings.push(`${entity.name} has conflicting start and end dates.`);
      }
    }
  }

  for (const relationship of relationships) {
    if (relationship.startDate && relationship.endDate) {
      const start = new Date(relationship.startDate);
      const end = new Date(relationship.endDate);
      if (start > end) {
        warnings.push(
          `${relationship.type} relationship has conflicting start and end dates.`
        );
      }
    }
  }

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
    <PageContainer>
      <PageHeader
        description={project.description ?? undefined}
        metadata={`Created ${new Date(project.createdAt).toLocaleDateString()}`}
        title={
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-semibold text-2xl">{project.name}</h1>
            <Badge variant="secondary">{project.visibility}</Badge>
          </div>
        }
      />

      <div className="flex flex-col gap-2">
        {canEdit ? (
          <p className="text-muted-foreground text-sm">You own this project.</p>
        ) : (
          <p className="text-muted-foreground text-sm">
            Viewing with read-only access.
          </p>
        )}
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
        <CardHeader className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg">Export Book</CardTitle>
            <p className="text-muted-foreground text-sm">
              Download your book as PDF or EPUB. Exports are saved to your
              account.
            </p>
          </div>
          <ExportBookDialog projectId={project.id} projectName={project.name} />
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
    </PageContainer>
  );
}
