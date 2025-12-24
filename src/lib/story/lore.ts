import type {
	Entity,
	EntityAttribute,
	Outline,
	Relationship,
} from "@/lib/db/schema";

const LEADING_MARKER_REGEX = /^[-*()\d.\s]+/;

function cleanLine(line: string): string {
	return line.replace(LEADING_MARKER_REGEX, "").trim();
}

export function extractBeatsFromText(text: string): string[] {
	return text
		.split("\n")
		.map((line) => cleanLine(line))
		.filter((line) => line.length > 0);
}

export function buildLoreContext({
	entities,
	attributes,
	relationships,
}: {
	entities: Entity[];
	attributes: EntityAttribute[];
	relationships: Relationship[];
}): string {
	if (entities.length === 0 && relationships.length === 0) {
		return "Lore: No structured entities were defined for this project yet.";
	}

	const attributeMap = new Map<string, EntityAttribute[]>();
	const entityNameMap = new Map<string, string>();

	for (const attribute of attributes) {
		const existingAttributes = attributeMap.get(attribute.entityId) ?? [];
		attributeMap.set(attribute.entityId, [...existingAttributes, attribute]);
	}

	for (const entityItem of entities) {
		entityNameMap.set(entityItem.id, entityItem.name);
	}

	const entityLines = entities.map((entityItem) => {
		const attributesForEntity = attributeMap.get(entityItem.id) ?? [];
		const attributeSummary = attributesForEntity
			.map((attribute) => `${attribute.name}: ${attribute.value}`)
			.join("; ");

		const summary = entityItem.summary ?? "No summary yet";

		if (attributeSummary.length > 0) {
			return `- ${entityItem.name} (${entityItem.kind}): ${summary}. Traits: ${attributeSummary}`;
		}

		return `- ${entityItem.name} (${entityItem.kind}): ${summary}`;
	});

	const relationshipLines = relationships.map(
		(relationshipItem) =>
			`- ${relationshipItem.type} between ${
				entityNameMap.get(relationshipItem.sourceEntityId) ??
				relationshipItem.sourceEntityId
			} and ${
				entityNameMap.get(relationshipItem.targetEntityId) ??
				relationshipItem.targetEntityId
			}: ${relationshipItem.description ?? "No relationship details provided."}`,
	);

	return [
		"Lore entities:",
		entityLines.join("\n"),
		relationshipLines.length > 0
			? `Relationships:\n${relationshipLines.join("\n")}`
			: null,
	]
		.filter(Boolean)
		.join("\n");
}

export function outlineToPrompt(outline: Outline): string {
	const beats = outline.beats?.length
		? outline.beats
		: outline.summary
			? [outline.summary]
			: [];

	const numberedBeats = beats
		.map((beat, index) => `${index + 1}. ${beat}`)
		.join("\n");

	return [
		`Title: ${outline.title}`,
		`Point of view: ${outline.pov}`,
		`Tone: ${outline.tone}`,
		`Pacing: ${outline.pacing}`,
		beats.length > 0 ? `Outline:\n${numberedBeats}` : "",
	]
		.filter(Boolean)
		.join("\n");
}
