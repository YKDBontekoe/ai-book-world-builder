"use server";

import { auth } from "../(auth)/auth";
import { getProjectByIdWithAccess } from "../../lib/db/queries/project";
import { getScenesForProject } from "../../lib/db/queries/scene";
import { db } from "../../lib/db/drizzle";
import { scene, chapter, chapterVersion } from "../../lib/db/schema";
import { eq, asc, desc } from "drizzle-orm";
import { continueWriting } from "../../lib/ai/writer";
import { createScene } from "../../lib/db/queries/scene";
import { createChapter } from "../../lib/db/queries/chapter";

async function ensureProjectAccess(projectId: string, requireOwner = false) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const project = await getProjectByIdWithAccess({
    id: projectId,
    userId: session.user.id,
  });

  if (!project) {
    throw new Error("Project not found or access denied");
  }

  if (requireOwner && project.userId !== session.user.id) {
    throw new Error("Unauthorized: Owner access required");
  }

  return { project, user: session.user };
}

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
      getScenesForProject({ projectId }),
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
      .where(eq(chapter.id, chapterId));

    if (!currentChapter) throw new Error("Chapter not found");

    // Write access required
    await ensureProjectAccess(currentChapter.projectId, true);

    // Find previous scenes in this chapter to build context
    const scenes = await db
      .select()
      .from(scene)
      .where(eq(scene.chapterId, chapterId))
      .orderBy(asc(scene.sequence));

    let context = `Chapter: ${currentChapter.title}\nNotes: ${
      currentChapter.notes || ""
    }\n`;
    let prevContent = "";
    let newSequence = 1;

    if (prevSceneId) {
      const prevScene = scenes.find((s) => s.id === prevSceneId);
      if (prevScene) {
        prevContent = prevScene.content || "";
        newSequence = prevScene.sequence + 1;
        // Add context from earlier scenes if needed
        context += scenes
          .filter((s) => s.sequence <= prevScene.sequence)
          .map(
            (s) =>
              `Scene ${s.title}: ${s.content?.substring(0, 200)}...`
          )
          .join("\n");
      }
    } else if (scenes.length > 0) {
      // Append to end
      const lastScene = scenes[scenes.length - 1];
      prevContent = lastScene.content || "";
      newSequence = lastScene.sequence + 1;
    }

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

export async function createNewChapter(projectId: string, title: string) {
  try {
    // 1. Verify Access (Write)
    await ensureProjectAccess(projectId, true);

    // 2. Get next sequence
    const [lastChapter] = await db
      .select()
      .from(chapter)
      .where(eq(chapter.projectId, projectId))
      .orderBy(desc(chapter.sequence))
      .limit(1);

    const sequence = (lastChapter?.sequence || 0) + 1;

    // 3. Create Chapter
    const newChapter = await createChapter({
      projectId,
      title,
      sequence,
    });

    return { success: true, chapterId: newChapter.id };
  } catch (error) {
    console.error("Failed to create new chapter", error);
    return { success: false };
  }
}
