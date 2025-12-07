import type { FullProjectData } from "@/lib/book-generation";

/**
 * Builds a comprehensive story bible from all project data.
 * Used by Stage 1 (Global Outline Planning) to understand the full world.
 */
export function buildStoryBible(data: FullProjectData): string {
  const sections: string[] = [];

  // Project info
  sections.push(`# Story Bible: ${data.project.name}`);
  if (data.project.description) {
    sections.push(`\n## Overview\n${data.project.description}`);
  }

  // Characters
  const characters = data.entities.filter((e) => e.kind === "character");
  if (characters.length > 0) {
    const characterLines = characters.map((c) => {
      const attrs = data.attributes
        .filter((a) => a.entityId === c.id)
        .map((a) => `  - ${a.name}: ${a.value}`)
        .join("\n");
      return `### ${c.name}\n${c.summary || "No description"}\n${attrs}`;
    });
    sections.push(`\n## Characters\n${characterLines.join("\n\n")}`);
  }

  // Locations
  const locations = data.entities.filter((e) => e.kind === "location");
  if (locations.length > 0) {
    const locationLines = locations.map(
      (l) => `### ${l.name}\n${l.summary || "No description"}`
    );
    sections.push(`\n## Locations\n${locationLines.join("\n\n")}`);
  }

  // Events
  const events = data.entities.filter((e) => e.kind === "event");
  if (events.length > 0) {
    const eventLines = events.map(
      (e) => `### ${e.name}\n${e.summary || "No description"}`
    );
    sections.push(`\n## Events & History\n${eventLines.join("\n\n")}`);
  }

  // Relationships
  if (data.relationships.length > 0) {
    const entityMap = new Map(data.entities.map((e) => [e.id, e.name]));
    const relLines = data.relationships.map((r) => {
      const source = entityMap.get(r.sourceEntityId) || "Unknown";
      const target = entityMap.get(r.targetEntityId) || "Unknown";
      return `- ${source} → ${target}: ${r.type}${r.description ? ` (${r.description})` : ""}`;
    });
    sections.push(`\n## Relationships\n${relLines.join("\n")}`);
  }

  // Existing outlines
  if (data.outlines.length > 0) {
    const outlineTexts = data.outlinePrompts.map(
      (p, i) => `### Outline ${i + 1}\n${p}`
    );
    sections.push(`\n## Existing Outlines\n${outlineTexts.join("\n\n")}`);
  }

  return sections.join("\n");
}
