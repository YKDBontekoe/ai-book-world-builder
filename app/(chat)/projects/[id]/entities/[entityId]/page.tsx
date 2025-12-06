import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  getEntitiesForProject,
  getEntityWithDetails,
  getProjectByIdWithAccess,
} from "@/lib/db/queries";
import { AttributeForm } from "./attribute-form";
import { RelationshipForm } from "./relationship-form";

function buildWarnings(
  entity: Awaited<ReturnType<typeof getEntityWithDetails>>
) {
  if (!entity) {
    return [] as string[];
  }

  const warnings: string[] = [];

  if (entity.startDate && entity.endDate) {
    const start = new Date(entity.startDate);
    const end = new Date(entity.endDate);
    if (start > end) {
      warnings.push("Entity end date cannot be before the start date.");
    }
  }

  for (const attribute of entity.attributes) {
    if (attribute.startDate && attribute.endDate) {
      const start = new Date(attribute.startDate);
      const end = new Date(attribute.endDate);
      if (start > end) {
        warnings.push(
          `${attribute.name} has an end date before its start date. Update the timeline to avoid draft conflicts.`
        );
      }
    }
  }

  for (const relationship of entity.relationships) {
    if (relationship.startDate && relationship.endDate) {
      const start = new Date(relationship.startDate);
      const end = new Date(relationship.endDate);
      if (start > end) {
        warnings.push(
          `${relationship.type} relationship has conflicting dates. Drafts may mis-sequence events.`
        );
      }
    }
  }

  return warnings;
}

export default async function EntityDetailPage({
  params,
}: {
  params: Promise<{ id: string; entityId: string }>;
}) {
  const { id, entityId } = await params;
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

  const [entity, entities] = await Promise.all([
    getEntityWithDetails({ id: entityId }),
    getEntitiesForProject({ projectId: project.id }),
  ]);

  if (!entity || entity.projectId !== project.id) {
    notFound();
  }

  const canEdit =
    session.user?.type === "regular" && project.userId === session.user.id;
  const warnings = buildWarnings(entity);

  return (
    <div className="flex min-h-dvh flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <Button asChild className="px-0" size="sm" variant="ghost">
            <Link href={`/projects/${project.id}/entities`}>
              Back to entities
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-2xl">{entity.name}</h1>
            <Badge variant="secondary">{entity.kind}</Badge>
          </div>
          {entity.summary && (
            <p className="max-w-3xl text-muted-foreground">{entity.summary}</p>
          )}
          <p className="text-muted-foreground text-sm">
            {entity.startDate && entity.endDate
              ? `${new Date(entity.startDate).toLocaleDateString()}–${new Date(entity.endDate).toLocaleDateString()}`
              : entity.startDate
                ? `Active since ${new Date(entity.startDate).toLocaleDateString()}`
                : "Timeline not set"}
          </p>
        </div>
        {canEdit && (
          <Button asChild>
            <Link href={`/projects/${project.id}/entities/new`}>
              Add another entity
            </Link>
          </Button>
        )}
      </div>

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

      <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Attributes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {entity.attributes.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No attributes recorded yet. Add traits, stats, or historical
                notes to guide drafts.
              </p>
            ) : (
              entity.attributes.map((attribute) => (
                <div className="space-y-1" key={attribute.id}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium leading-tight">
                        {attribute.name}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {attribute.value}
                      </p>
                    </div>
                    <Badge variant="outline">{attribute.dataType}</Badge>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {attribute.startDate && attribute.endDate
                      ? `${new Date(attribute.startDate).toLocaleDateString()}–${new Date(attribute.endDate).toLocaleDateString()}`
                      : attribute.startDate
                        ? `Effective ${new Date(attribute.startDate).toLocaleDateString()}`
                        : "Timeline not set"}
                  </p>
                  <Separator />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {canEdit && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add attribute</CardTitle>
            </CardHeader>
            <CardContent>
              <AttributeForm entityId={entity.id} projectId={project.id} />
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Relationships</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {entity.relationships.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No relationships yet. Link this entity to others so AI can keep
                continuity in drafts.
              </p>
            ) : (
              entity.relationships.map((relationship) => {
                const target = entities.find(
                  (candidate) =>
                    candidate.id ===
                    (relationship.sourceEntityId === entity.id
                      ? relationship.targetEntityId
                      : relationship.sourceEntityId)
                );

                return (
                  <div className="space-y-1" key={relationship.id}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium leading-tight">
                          {relationship.type}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {relationship.description ||
                            "No context provided yet."}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Linked to {target?.name ?? "another entity"}
                        </p>
                      </div>
                      <Badge variant="outline">Timeline</Badge>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {relationship.startDate && relationship.endDate
                        ? `${new Date(relationship.startDate).toLocaleDateString()}–${new Date(relationship.endDate).toLocaleDateString()}`
                        : relationship.startDate
                          ? `Starts ${new Date(relationship.startDate).toLocaleDateString()}`
                          : "Timeline not set"}
                    </p>
                    <Separator />
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {canEdit && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add relationship</CardTitle>
            </CardHeader>
            <CardContent>
              <RelationshipForm
                entities={entities}
                projectId={project.id}
                sourceEntityId={entity.id}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
