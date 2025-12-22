"use server";

import { asc, desc, eq } from "drizzle-orm";
import {
  db,
  getAttributesForProject,
  getBookGenerationForProject,
  getEntitiesForProject,
  getOutlinesForProject,
  getProjectByIdWithAccess,
  getRelationshipsForProject,
  mergeVolumeData,
} from "@/lib/db/queries";
import type {
  BookGeneration,
  Chapter,
  ChapterDraft,
  Entity,
  EntityAttribute,
  Outline,
  Project,
  Relationship,
  Volume,
} from "@/lib/db/schema";
import { chapter, chapterDraft, volume } from "@/lib/db/schema";
import { buildLoreContext, outlineToPrompt } from "@/lib/story/lore";
import { buildProjectContext } from "./project-context";

export type FullProjectData = {
  project: Project;
  entities: Entity[];
  attributes: EntityAttribute[];
  relationships: Relationship[];
  outlines: Outline[];
  volumes: Array<
    Volume & { chapters: Array<Chapter & { drafts: ChapterDraft[] }> }
  >;
  generation: BookGeneration | null;
  loreContext: string;
  projectContext: string;
  outlinePrompts: string[];
};

/**
 * Fetches ALL project data needed for the book generation pipeline.
 * This is the single source of truth for the AI pipeline stages.
 */
export async function getFullProjectDataForGeneration({
  projectId,
  userId,
}: {
  projectId: string;
  userId?: string;
}): Promise<FullProjectData | null> {
  const projectResult = await getProjectByIdWithAccess({
    id: projectId,
    userId,
  });

  if (!projectResult) {
    return null;
  }

  const [entities, attributes, relationships, outlines, generation] =
    await Promise.all([
      getEntitiesForProject({ projectId }),
      getAttributesForProject({ projectId }),
      getRelationshipsForProject({ projectId }),
      getOutlinesForProject({ projectId }),
      getBookGenerationForProject({ projectId }),
    ]);

  // Fetch volumes, chapters, and drafts for all outlines
  const volumesList = await db
    .select()
    .from(volume)
    .where(eq(volume.projectId, projectId))
    .orderBy(asc(volume.createdAt));

  const chaptersList = await db
    .select()
    .from(chapter)
    .where(eq(chapter.projectId, projectId))
    .orderBy(asc(chapter.sequence));

  const draftsList = await db
    .select()
    .from(chapterDraft)
    .where(eq(chapterDraft.projectId, projectId))
    .orderBy(desc(chapterDraft.createdAt));

  const mergedVolumes = mergeVolumeData({
    volumes: volumesList,
    chapters: chaptersList,
    drafts: draftsList,
  });

  // Build context strings
  const loreContext = buildLoreContext({
    entities,
    attributes,
    relationships,
  });

  const projectContext = buildProjectContext({
    project: projectResult,
    entities,
    attributes,
    relationships,
  });

  const outlinePrompts = outlines.map((o) => outlineToPrompt(o));

  return {
    project: projectResult,
    entities,
    attributes,
    relationships,
    outlines,
    volumes: mergedVolumes,
    generation,
    loreContext,
    projectContext,
    outlinePrompts,
  };
}
