import type {
	Entity,
	EntityAttribute,
	Project,
	ProjectFolder,
	Relationship,
} from "@/lib/db/schema";
import { buildLoreContext } from "@/lib/story/lore";

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
		description: project.description ?? null,
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
	outline,
	chapters,
}: {
	project: Project;
	entities: Entity[];
	attributes: EntityAttribute[];
	outline?: { title: string; summary: string | null } | null;
	chapters?: { sequence: number; title: string; notes: string | null }[];
}) {
	const folderLines = project.folders
		.map(
			(folder) => `- ${folder.name}: ${folder.description ?? "No description"}`,
		)
		.join("\n");

	const attributesByEntity = attributes.reduce<Record<string, string[]>>(
		(acc, attribute) => {
			const current = acc[attribute.entityId] ?? [];
			current.push(`${attribute.name}: ${attribute.value}`);
			acc[attribute.entityId] = current;
			return acc;
		},
		{},
	);

	const entityLines = entities.map((entity) => {
		const summarizedAttributes = attributesByEntity[entity.id]?.slice(0, 3);
		const details = summarizedAttributes?.length
			? ` — ${summarizedAttributes.join(", ")}`
			: "";
		// If we have a summary, include a snippet of it
		const summarySnippet = entity.summary
			? ` (${entity.summary.slice(0, 60)}...)`
			: "";
		return `- ${entity.name} (${entity.kind})${details}${summarySnippet}`;
	});

	const chapterLines = chapters?.length
		? chapters
				.map(
					(c) =>
						`- Ch.${c.sequence} ${c.title}${c.notes ? ` (${c.notes.slice(0, 50)}...)` : ""}`,
				)
				.join("\n")
		: undefined;

	const descriptions = [
		`Project: ${project.name} (${project.visibility})`,
		project.description ? `Summary: ${project.description}` : undefined,
		folderLines ? `Folders:\n${folderLines}` : undefined,
		outline
			? `Book Outline: ${outline.title}\n${outline.summary ?? ""}`
			: undefined,
		chapterLines ? `Chapters:\n${chapterLines}` : undefined,
		entityLines.length > 0
			? `Key entities (Context-Relevant):\n${entityLines.join("\n")}`
			: "No entities added yet.",
	].filter(Boolean);

	return descriptions.join("\n\n");
}

/**
 * Builds a richer project context string that combines the project summary
 * with lore details (entities, attributes, and relationships) for use in
 * grounding chat prompts.
 */
export function buildProjectContext({
	project,
	entities,
	attributes,
	relationships,
	outline,
	chapters,
}: {
	project: Project;
	entities: Entity[];
	attributes: EntityAttribute[];
	relationships: Relationship[];
	outline?: { title: string; summary: string | null } | null;
	chapters?: { sequence: number; title: string; notes: string | null }[];
}): string {
	const projectSummary = buildProjectContextPrompt({
		project,
		entities,
		attributes,
		outline,
		chapters,
	});

	const loreContext = buildLoreContext({
		entities,
		attributes,
		relationships,
	});

	return [projectSummary, loreContext].filter(Boolean).join("\n\n");
}
