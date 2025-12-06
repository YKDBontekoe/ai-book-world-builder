import { generateObject } from "ai";
import { z } from "zod";

import { myProvider } from "@/lib/ai/providers";
import { DEFAULT_PROJECT_FOLDERS } from "@/lib/constants";
import type { ProjectFolder } from "@/lib/db/schema";
import {
  type ExtractedEntity,
  deriveEntitiesFromContent,
} from "@/lib/ingestion/entities";
import { cleanText, deriveHeadings } from "./text";

const extractionSchema = z.object({
  entities: z
    .array(
      z.object({
        name: z.string().trim().min(1),
        kind: z.string().trim().min(1).optional(),
        summary: z.string().trim().optional(),
        folder: z.string().trim().optional(),
        attributes: z
          .array(
            z.object({
              name: z.string().trim().min(1),
              value: z.string().trim().min(1),
              dataType: z.string().trim().optional(),
              startDate: z.string().trim().optional(),
              endDate: z.string().trim().optional(),
            })
          )
          .optional(),
        relationships: z
          .array(
            z.object({
              targetName: z.string().trim().min(1),
              type: z.string().trim().min(1).default("related"),
              description: z.string().trim().optional(),
            })
          )
          .optional(),
      })
    )
    .default([]),
});

type AiExtractionResult = z.infer<typeof extractionSchema>;

type FolderLookup = Record<
  string,
  { folder: ProjectFolder; aliases: string[] }
>;

function buildFolderLookup(projectFolders: ProjectFolder[]): FolderLookup {
  return projectFolders.reduce<FolderLookup>((acc, folder) => {
    const aliases = [folder.id, folder.name, folder.slug]
      .filter(Boolean)
      .map((entry) => entry.toLowerCase());

    aliases.forEach((alias) => {
      acc[alias] = { folder, aliases };
    });

    return acc;
  }, {});
}

function resolveFolder(
  value: string | undefined,
  lookup: FolderLookup
): ProjectFolder | undefined {
  if (!value) return undefined;
  return lookup[value.toLowerCase()]?.folder;
}

function mergeAttributes(
  base: ExtractedEntity["attributes"],
  incoming: ExtractedEntity["attributes"]
): ExtractedEntity["attributes"] {
  const merged = new Map<string, ExtractedEntity["attributes"][number]>();

  for (const attribute of [...base, ...incoming]) {
    const key = attribute.name.toLowerCase();
    merged.set(key, attribute);
  }

  return [...merged.values()];
}

function addFolderAttribute(
  attributes: ExtractedEntity["attributes"],
  folder?: ProjectFolder
): ExtractedEntity["attributes"] {
  if (!folder) return attributes;

  return mergeAttributes(attributes, [
    {
      name: "Folder",
      value: folder.name,
      dataType: "text",
    },
  ]);
}

function normalizeAiEntities({
  aiEntities,
  projectFolders,
}: {
  aiEntities: AiExtractionResult["entities"];
  projectFolders: ProjectFolder[];
}): ExtractedEntity[] {
  const lookup = buildFolderLookup(projectFolders);
  const merged = new Map<string, ExtractedEntity>();

  for (const entry of aiEntities) {
    const name = entry.name.trim();
    if (!name) continue;

    const folder =
      resolveFolder(entry.folder, lookup) ?? resolveFolder(entry.kind, lookup);
    const kind = entry.kind?.trim() || folder?.name || "Lore";
    const attributes = addFolderAttribute(
      (entry.attributes ?? []).map((attribute) => ({
        name: attribute.name.trim(),
        value: attribute.value.trim(),
        dataType: attribute.dataType ?? "text",
        startDate: attribute.startDate,
        endDate: attribute.endDate,
      })),
      folder
    );

    const relationships = (entry.relationships ?? [])
      .map((relation) => ({
        targetName: relation.targetName.trim(),
        type: relation.type.trim() || "related",
        description: relation.description,
      }))
      .filter((relation) => relation.targetName.length > 0);

    const key = name.toLowerCase();
    const existing = merged.get(key);

    if (existing) {
      merged.set(key, {
        ...existing,
        summary: entry.summary?.trim() || existing.summary,
        kind,
        folderId: folder?.id ?? existing.folderId,
        attributes: mergeAttributes(existing.attributes, attributes),
        relationships: [...existing.relationships, ...relationships],
      });
      continue;
    }

    merged.set(key, {
      name,
      kind,
      summary: entry.summary?.trim() || undefined,
      folderId: folder?.id,
      attributes,
      relationships,
    });
  }

  return [...merged.values()];
}

function buildPrompt({
  text,
  headings,
  projectFolders,
}: {
  text: string;
  headings: string[];
  projectFolders: ProjectFolder[];
}): string {
  const folderGuide = projectFolders
    .map((folder) => `- ${folder.name} (id: ${folder.id}, slug: ${folder.slug})`)
    .join("\n");

  const headingContext = headings.length
    ? `Primary headings: ${headings.join(", ")}`
    : "No explicit headings available.";

  return [
    "You are an expert narrative analyst extracting canonical entities from source material.",
    headingContext,
    "Use the provided project folders when possible. Map each entity to the best folder by matching name/slug/id.",
    "List of project folders:",
    folderGuide,
    "Return distinct entities with a short summary, attributes (name=value pairs), and relationships to other entities by name.",
    "Prefer concise, fact-based attributes suitable for grounding LLM prompts.",
    "If the text contains repeated mentions of the same entity, merge them into one entry.",
    "Extract results strictly according to the schema.",
    "--- SOURCE MATERIAL ---",
    text,
  ].join("\n");
}

export type EntityExtractor = {
  extract: (args: {
    text: string;
    projectFolders?: ProjectFolder[];
    headings?: string[];
  }) => Promise<ExtractedEntity[]>;
};

export class AIEntityExtractor implements EntityExtractor {
  async extract({
    text,
    projectFolders,
    headings,
  }: {
    text: string;
    projectFolders?: ProjectFolder[];
    headings?: string[];
  }): Promise<ExtractedEntity[]> {
    const normalizedText = cleanText(text);
    if (!normalizedText) return [];

    const folders = projectFolders?.length
      ? projectFolders
      : DEFAULT_PROJECT_FOLDERS;
    const normalizedHeadings = headings?.length
      ? headings
      : deriveHeadings(normalizedText);

    try {
      const { object } = await generateObject({
        model: myProvider.languageModel("chat-model"),
        schema: extractionSchema,
        prompt: buildPrompt({
          text: normalizedText,
          headings: normalizedHeadings,
          projectFolders: folders,
        }),
      });

      const aiEntities = normalizeAiEntities({
        aiEntities: object.entities,
        projectFolders: folders,
      });

      if (aiEntities.length > 0) {
        return aiEntities;
      }
    } catch (error) {
      console.error("AI entity extraction failed", error);
    }

    return deriveEntitiesFromContent({
      text: normalizedText,
      projectFolders: folders,
      headings: normalizedHeadings,
    });
  }
}

export function createEntityExtractor(): EntityExtractor {
  return new AIEntityExtractor();
}
