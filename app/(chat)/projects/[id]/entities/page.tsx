import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { EmptyState } from "@/components/empty-state";
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
        warnings.push(`${entity.name} has an end date before its start date.`);
      }
    }
  });

  relationships.forEach((relationship) => {
    if (relationship.startDate && relationship.endDate) {
      const start = new Date(relationship.startDate);
      const end = new Date(relationship.endDate);
      if (start > end) {
        warnings.push(
          `${relationship.type} between entities has an end date before the start date.`
        );
      }
    }
  });

  return warnings;
}

export default async function EntitiesPage({
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

  const [entities, relationships] = await Promise.all([
    getEntitiesForProject({ projectId: project.id }),
    getRelationshipsForProject({ projectId: project.id }),
  ]);

  const canEdit =
    session.user?.type === "regular" && project.userId === session.user.id;
  const warnings = buildWarnings({ entities, relationships });

  return (
    <PageContainer>
      <PageHeader
        action={
          canEdit ? (
            <Button asChild>
              <Link href={`/projects/${project.id}/entities/new`}>
                Add entity
              </Link>
            </Button>
          ) : undefined
        }
        breadcrumb="Schema"
        description="Track world objects, their defining attributes, and how they connect."
        title="Entities"
      />

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

      {entities.length === 0 ? (
        <EmptyState
          description="Start adding characters, factions, or locations to surface richer AI suggestions in drafts."
          title="No entities yet"
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Project entities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {entities.map((entity) => (
              <div className="space-y-2" key={entity.id}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <Link
                      className="font-medium leading-tight hover:underline"
                      href={`/projects/${project.id}/entities/${entity.id}`}
                    >
                      {entity.name}
                    </Link>
                    <p className="text-muted-foreground text-sm">
                      {entity.summary}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {entity.startDate && entity.endDate
                        ? `${new Date(entity.startDate).toLocaleDateString()}–${new Date(entity.endDate).toLocaleDateString()}`
                        : entity.startDate
                          ? `Since ${new Date(entity.startDate).toLocaleDateString()}`
                          : "Timeline not set"}
                    </p>
                  </div>
                  <Badge variant="outline">{entity.kind}</Badge>
                </div>
                <Separator />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
