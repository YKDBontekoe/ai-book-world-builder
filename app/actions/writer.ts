"use server";

import { db } from "../../lib/db/drizzle";
import { scene, chapter, chapterVersion } from "../../lib/db/schema";
import { eq, asc, desc } from "drizzle-orm";
import { continueWriting } from "../../lib/ai/writer";
import { createScene, getScenesForProject } from "../../lib/db/queries/scene";
import { ensureProjectAccess } from "../../lib/actions-utils";
import { buildSceneGenerationContext } from "../../lib/ai/context-builder";

export async function getProjectStructure(projectId: string) {
  try {
    // 1. Verify Access (Read is sufficient)
    await ensureProjectAccess(projectId);

    // 2. Fetch all data in parallel
    const [chapters, allScenes] = await Promise.all([
      db
        .select()
        .from(chapter)
        .where(eq(chapter.projectId, projectId))
        .orderBy(asc(chapter.sequence)),
      getScenesForProject({ projectId, excludeContent: true }),
    ]);

    // 3. Map scenes to chapters in memory
    const scenesByChapter = allScenes.reduce((acc, s) => {
      if (!acc[s.chapterId]) {
        acc[s.chapterId] = [];
      }
      acc[s.chapterId].push(s);
      return acc;
    }, {} as Record<string, typeof allScenes>);

    const structure = chapters.map((ch) => ({
      ...ch,
      scenes: scenesByChapter[ch.id] || [],
    }));

    // 4. Generate text representation
    const structureText = formatStructure(structure);

    return { structure, structureText };
  } catch (error) {
    console.error("Failed to fetch project structure", error);
    return { structure: [], structureText: "" };
  }
}

function formatStructure(structure: any[]) {
  return structure
    .map((ch) => {
      const chHeader = `Chapter ${ch.sequence}: ${ch.title}`;
      const scenesText = ch.scenes
        .map((s: any) => `  Scene ${s.sequence}: ${s.title}`)
        .join("\n");
      return `${chHeader}\n${scenesText}`;
    })
    .join("\n\n");
}

export async function updateSceneContent(sceneId: string, content: string) {
  try {
    // 1. Get Scene to find Project ID
    const [targetScene] = await db
      .select()
      .from(scene)
      .where(eq(scene.id, sceneId))
      .limit(1);

    if (!targetScene) {
      throw new Error("Scene not found");
    }

    // 2. Verify Access (Write requires ownership)
    await ensureProjectAccess(targetScene.projectId, true);

    await db
      .update(scene)
      .set({ content, updatedAt: new Date(), status: "drafting" })
      .where(eq(scene.id, sceneId));
    return { success: true };
  } catch (error) {
    console.error("Failed to update scene content", error);
    return { success: false };
  }
}

export async function createChapterSnapshot(chapterId: string) {
  try {
    // 1. Fetch current chapter
    const [currentChapter] = await db
      .select()
      .from(chapter)
      .where(eq(chapter.id, chapterId))
      .limit(1);

    if (!currentChapter) return { success: false };

    // 2. Verify Access (Write requires ownership)
    await ensureProjectAccess(currentChapter.projectId, true);

    // 3. Aggregate content
    const scenes = await db
      .select()
      .from(scene)
      .where(eq(scene.chapterId, chapterId))
      .orderBy(asc(scene.sequence));

    const fullContent = scenes
      .map((s) => `## ${s.title}\n\n${s.content || ""}`)
      .join("\n\n");

    // 4. Determine next version number
    const [lastVersion] = await db
      .select()
      .from(chapterVersion)
      .where(eq(chapterVersion.chapterId, chapterId))
      .orderBy(desc(chapterVersion.version))
      .limit(1);

    const nextVersion = (lastVersion?.version || 0) + 1;

    // 5. Save snapshot
    await db.insert(chapterVersion).values({
      chapterId,
      content: fullContent,
      version: nextVersion,
      createdAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to create chapter snapshot", error);
    return { success: false };
  }
}

export async function generateScene(chapterId: string, prevSceneId?: string) {
  try {
    // 1. Fetch Context & Verify Access
    const [currentChapter] = await db
      .select()
      .from(chapter)
      .where(eq(chapter.id, chapterId))
      .limit(1); // Added limit(1) which was implicit in destructuring but safer to be explicit

    if (!currentChapter) throw new Error("Chapter not found");

    // Write access required
    await ensureProjectAccess(currentChapter.projectId, true);

    // Find previous scenes in this chapter to build context
    const scenes = await db
      .select()
      .from(scene)
      .where(eq(scene.chapterId, chapterId))
      .orderBy(asc(scene.sequence));

    // Use shared context builder
    const { context, prevContent, newSequence } = buildSceneGenerationContext(
      currentChapter,
      scenes,
      prevSceneId
    );

    // 2. Generate Content
    const generation = await continueWriting(context, prevContent);

    if (generation.error || !generation.text) {
      throw new Error(generation.error || "No text generated");
    }

    // 3. Create New Scene
    const newScene = await createScene({
      projectId: currentChapter.projectId,
      chapterId,
      title: "AI Generated Scene",
      sequence: newSequence,
      content: generation.text,
      status: "drafted",
    });

    if (prevSceneId) {
      // Note: This still relies on `scene` having `prevSceneId`.
      // Assuming it does based on original code.
      await db
        .update(scene)
        .set({ prevSceneId })
        .where(eq(scene.id, newScene.id));
    }

    return { success: true, sceneId: newScene.id };
  } catch (error) {
    console.error("Failed to generate scene", error);
    return { success: false, error: "Generation failed" };
  }
}

export async function saveProjectStructure(
  projectId: string,
  structureText: string
) {
  try {
     // Verify Access (Write)
     await ensureProjectAccess(projectId, true);

     // Placeholder implementation for StructureEditorDialog
     return { success: true };
  } catch (error) {
     console.error("Failed to save project structure", error);
     return { success: false };
  }
}
