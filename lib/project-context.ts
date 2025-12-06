import type {
  Entity,
  EntityAttribute,
  Project,
  ProjectFolder,
} from "@/lib/db/schema";

export type ProjectSummary = Pick<
  Project,
  "id" | "name" | "description" | "visibility" | "folders"
> & { createdAt: string };

/**
 * Normalizes database-backed projects into a client-safe payload while preserving
 * descriptive metadata for UI and prompt hydration.
 */
export function serializeProject(project: Project): ProjectSummary {
  return {
    id: project.id,
    name: project.name,
    description: project.description ?? undefined,
    visibility: project.visibility,
    folders: project.folders as ProjectFolder[],
    createdAt: project.createdAt.toISOString(),
  };
}

/**
 * Builds a concise, AI-friendly context string to ground chat generations in the
 * current project's structure, entities, and metadata.
 */
export function buildProjectContextPrompt({
  project,
  entities,
  attributes,
}: {
  project: Project;
  entities: Entity[];
  attributes: EntityAttribute[];
}) {
  const folderLines = project.folders
    .map((folder) => `- ${folder.name}: ${folder.description ?? "No description"}`)
    .join("\n");

  const attributesByEntity = attributes.reduce<Record<string, string[]>>(
    (acc, attribute) => {
      const current = acc[attribute.entityId] ?? [];
      current.push(`${attribute.name}: ${attribute.value}`);
      acc[attribute.entityId] = current;
      return acc;
    },
    {}
  );

  const entityLines = entities.slice(0, 12).map((entity) => {
    const summarizedAttributes = attributesByEntity[entity.id]?.slice(0, 3);
    const details = summarizedAttributes?.length
      ? ` — ${summarizedAttributes.join(", ")}`
      : "";
    return `- ${entity.name} (${entity.kind})${details}`;
  });

  const descriptions = [
    `Project: ${project.name} (${project.visibility})`,
    project.description ? `Summary: ${project.description}` : undefined,
    folderLines ? `Folders:\n${folderLines}` : undefined,
    entityLines.length > 0
      ? `Key entities (limit 12):\n${entityLines.join("\n")}`
      : "No entities added yet.",
  ].filter(Boolean);

  return descriptions.join("\n\n");
}
