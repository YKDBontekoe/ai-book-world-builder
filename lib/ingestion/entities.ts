import { DEFAULT_PROJECT_FOLDERS } from "@/lib/constants";
import type { ProjectFolder } from "@/lib/db/schema";
import { cleanText, deriveHeadings } from "./text";

export type ExtractedEntityAttribute = {
  name: string;
  value: string;
  dataType?: string;
  startDate?: string;
  endDate?: string;
};

export type ExtractedRelationship = {
  targetName: string;
  type: string;
  description?: string;
};

export type ExtractedEntity = {
  id?: string;
  name: string;
  kind: string;
  summary?: string;
  folderId?: string;
  attributes: ExtractedEntityAttribute[];
  relationships: ExtractedRelationship[];
};

type FolderLookup = {
  folder: ProjectFolder;
  aliases: string[];
};

function buildFolderLookup(
  projectFolders?: ProjectFolder[]
): Record<string, FolderLookup> {
  const folders = projectFolders?.length
    ? projectFolders
    : DEFAULT_PROJECT_FOLDERS;

  return folders.reduce<Record<string, FolderLookup>>((acc, folder) => {
    acc[folder.id.toLowerCase()] = {
      folder,
      aliases: [
        folder.id.toLowerCase(),
        folder.name.toLowerCase(),
        folder.slug.toLowerCase(),
      ],
    };
    return acc;
  }, {});
}

function resolveFolder(
  line: string,
  folderLookup: Record<string, FolderLookup>
): ProjectFolder | undefined {
  const normalized = line.trim().toLowerCase().replace(/:$/, "");

  return Object.values(folderLookup).find(({ aliases }) =>
    aliases.some((alias) => normalized === alias)
  )?.folder;
}

function parseAttributes(segment: string): ExtractedEntityAttribute[] {
  const [_, rawAttributes] = segment.split(/attributes?:/i);

  if (!rawAttributes) {
    return [];
  }

  return rawAttributes
    .split(",")
    .map((candidate) => candidate.trim())
    .filter(Boolean)
    .map((definition) => {
      const [name, value] = definition.split("=").map((part) => part.trim());

      if (!name || !value) {
        return null;
      }

      return { name, value, dataType: "text" } satisfies ExtractedEntityAttribute;
    })
    .filter((attribute): attribute is ExtractedEntityAttribute => Boolean(attribute));
}

function parseRelationships(segment: string): ExtractedRelationship[] {
  const [_, rawRelationships] = segment.split(/relationships?:/i);

  if (!rawRelationships) {
    return [];
  }

  return rawRelationships
    .split(",")
    .map((candidate) => candidate.trim())
    .filter(Boolean)
    .map((definition) => {
      const [targetCandidate, typeOrDescription] = definition
        .split("=")
        .map((part) => part.trim());

      if (!targetCandidate) {
        return null;
      }

      const typeMatch = targetCandidate.match(/(.+?)\s*\((.+)\)/);
      const targetName = typeMatch?.[1]?.trim() ?? targetCandidate;
      const type =
        typeMatch?.[2]?.trim() ?? typeOrDescription?.trim() ?? "related";

      return {
        targetName,
        type,
        description: typeOrDescription?.trim(),
      } satisfies ExtractedRelationship;
    })
    .filter((relationship): relationship is ExtractedRelationship =>
      Boolean(relationship?.targetName)
    );
}

function mergeAttributes(
  base: ExtractedEntityAttribute[],
  incoming: ExtractedEntityAttribute[]
): ExtractedEntityAttribute[] {
  const merged = new Map<string, ExtractedEntityAttribute>();

  for (const attribute of [...base, ...incoming]) {
    if (!attribute.name || !attribute.value) continue;
    const key = attribute.name.toLowerCase();
    merged.set(key, attribute);
  }

  return [...merged.values()];
}

function addFolderAttribute(
  attributes: ExtractedEntityAttribute[],
  folder?: ProjectFolder
): ExtractedEntityAttribute[] {
  if (!folder) {
    return attributes;
  }

  const folderAttribute: ExtractedEntityAttribute = {
    name: "Folder",
    value: folder.name,
    dataType: "text",
  };

  return mergeAttributes(attributes, [folderAttribute]);
}

function parseEntityLine({
  line,
  folder,
}: {
  line: string;
  folder?: ProjectFolder;
}): ExtractedEntity | null {
  const normalizedLine = line.replace(/^[-*]\s*/, "").trim();
  if (!normalizedLine) return null;

  const segments = normalizedLine
    .split("|")
    .map((segment) => segment.trim())
    .filter(Boolean);

  const [primary, ...rest] = segments;
  if (!primary) return null;

  const [nameAndKind, summaryPart] = primary
    .split(":")
    .map((part) => part.trim());

  const nameMatch = nameAndKind.match(/^(?<name>[^()]+?)(?:\((?<kind>[^)]+)\))?$/);
  const name = nameMatch?.groups?.name?.trim() ?? nameAndKind;
  const kind = nameMatch?.groups?.kind?.trim() ?? folder?.name ?? "Lore";
  const summary = summaryPart?.trim() || undefined;

  const attributes = rest
    .filter((segment) => /^(attributes?|attrs?)/i.test(segment))
    .flatMap(parseAttributes);

  const relationships = rest
    .filter((segment) => /^relationships?/i.test(segment))
    .flatMap(parseRelationships);

  return {
    name,
    kind,
    summary,
    folderId: folder?.id,
    attributes: addFolderAttribute(attributes, folder),
    relationships,
  } satisfies ExtractedEntity;
}

function fallbackEntity(
  normalizedText: string,
  headings?: string[],
  folderLookup?: Record<string, FolderLookup>
): ExtractedEntity[] {
  if (!headings?.length) {
    return [];
  }

  const folder = resolveFolder(headings[0], folderLookup ?? {})?.id;
  const [firstLine] = cleanText(normalizedText).split("\n");

  return [
    {
      name: headings[0],
      kind: folder ?? "Lore",
      summary: firstLine,
      folderId: folder,
      attributes: addFolderAttribute([], folderLookup?.[folder ?? ""]?.folder),
      relationships: [],
    },
  ];
}

export function deriveEntitiesFromContent({
  text,
  projectFolders,
  headings,
}: {
  text: string;
  projectFolders?: ProjectFolder[];
  headings?: string[];
}): ExtractedEntity[] {
  const normalizedText = cleanText(text);
  const folderLookup = buildFolderLookup(projectFolders);
  const lines = normalizedText.split("\n").map((line) => line.trim());
  const entities: ExtractedEntity[] = [];
  let currentFolder = resolveFolder(lines[0] ?? "", folderLookup);
  const seenNames = new Map<string, ExtractedEntity>();

  for (const rawLine of lines) {
    const folder = resolveFolder(rawLine, folderLookup);
    if (folder) {
      currentFolder = folder;
      continue;
    }

    if (!/^[-*]/.test(rawLine)) {
      continue;
    }

    const parsed = parseEntityLine({ line: rawLine, folder: currentFolder });

    if (!parsed) continue;

    const existing = seenNames.get(parsed.name.toLowerCase());
    if (existing) {
      const mergedAttributes = mergeAttributes(
        existing.attributes,
        parsed.attributes
      );
      seenNames.set(parsed.name.toLowerCase(), {
        ...existing,
        summary: parsed.summary ?? existing.summary,
        attributes: mergedAttributes,
        relationships: [
          ...existing.relationships,
          ...parsed.relationships,
        ],
      });
      continue;
    }

    seenNames.set(parsed.name.toLowerCase(), parsed);
  }

  entities.push(...seenNames.values());

  if (entities.length === 0) {
    const derivedHeadings = headings?.length
      ? headings
      : deriveHeadings(normalizedText);
    entities.push(...fallbackEntity(normalizedText, derivedHeadings, folderLookup));
  }

  return entities;
}
