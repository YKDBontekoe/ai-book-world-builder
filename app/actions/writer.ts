"use server";

import { db } from "../../lib/db/drizzle";
import { scene, chapter, chapterVersion, outline, volume } from "../../lib/db/schema";
import { eq, asc, desc } from "drizzle-orm";
import { continueWriting } from "../../lib/ai/writer";
import { createScene, getScenesForProject } from "../../lib/db/queries/scene";
import { createOutline, getOutlinesForProject } from "../../lib/db/queries/outline";
import { createVolumePlan, getVolumePlansForProject } from "../../lib/db/queries/volume";
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
      .where(eq(chapter.id, chapterId))
      .limit(1);

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

export async function createNewChapter(projectId: string) {
  try {
    await ensureProjectAccess(projectId, true);

    // 1. Get or Create Outline/Volume (Basic Check)
    const outlines = await getOutlinesForProject({ projectId });
    let outlineId = outlines[0]?.id;
    if (!outlineId) {
       const newOutline = await createOutline({
          projectId,
          title: "Project Outline",
          pov: "Third Person",
          tone: "Neutral",
          pacing: "Moderate",
          beats: [],
       });
       outlineId = newOutline.id;
    }

    const volumes = await getVolumePlansForProject({ projectId });
    let volumeId = volumes[0]?.id;
    if (!volumeId) {
        const newVolume = await createVolumePlan({
            projectId,
            outlineId,
            title: "Volume 1",
            chapters: [],
        });
        volumeId = newVolume.id;
    }

    // 2. Determine sequence
    const existingChapters = await db
       .select()
       .from(chapter)
       .where(eq(chapter.volumeId, volumeId))
       .orderBy(desc(chapter.sequence));

    const nextSequence = (existingChapters[0]?.sequence ?? 0) + 1;

    // 3. Create Chapter
    const [newChapter] = await db.insert(chapter).values({
        projectId,
        volumeId,
        outlineId,
        title: `Chapter ${nextSequence}`,
        sequence: nextSequence,
        status: "planned",
        createdAt: new Date(),
        updatedAt: new Date(),
    }).returning();

    return { success: true, chapterId: newChapter.id };
  } catch (error) {
      console.error("Failed to create new chapter", error);
      return { success: false };
  }
}

export async function initializeProject(projectId: string) {
    try {
        await ensureProjectAccess(projectId, true);

        // 1. Check/Create Structure
        const outlines = await getOutlinesForProject({ projectId });
        let outlineId = outlines[0]?.id;
        if (!outlineId) {
            const newOutline = await createOutline({
                projectId,
                title: "Project Outline",
                pov: "Third Person",
                tone: "Neutral",
                pacing: "Moderate",
                beats: [],
            });
            outlineId = newOutline.id;
        }

        const volumes = await getVolumePlansForProject({ projectId });
        let volumeId = volumes[0]?.id;
        let chapterId: string | null = null;

        if (!volumeId) {
            // Create Volume AND Chapter 1
            const newVolume = await createVolumePlan({
                projectId,
                outlineId,
                title: "Volume 1",
                chapters: [{ title: "Chapter 1", sequence: 1 }],
            });
            volumeId = newVolume.id;
            chapterId = newVolume.chapters[0]?.id;
        } else {
             // Volume exists, check for chapters
             const chapters = await db
                .select()
                .from(chapter)
                .where(eq(chapter.volumeId, volumeId))
                .orderBy(asc(chapter.sequence));

             if (chapters.length > 0) {
                 chapterId = chapters[0].id;
             } else {
                 // Create Chapter 1
                 const [newChapter] = await db.insert(chapter).values({
                     projectId,
                     volumeId,
                     outlineId,
                     title: "Chapter 1",
                     sequence: 1,
                     status: "planned",
                     createdAt: new Date(),
                     updatedAt: new Date(),
                 }).returning();
                 chapterId = newChapter.id;
             }
        }

        if (!chapterId) throw new Error("Failed to resolve chapter");

        // 2. Check/Create Scene 1
        const scenes = await db
            .select()
            .from(scene)
            .where(eq(scene.chapterId, chapterId));

        let sceneId = scenes[0]?.id;

        if (!sceneId) {
            const newScene = await createScene({
                projectId,
                chapterId,
                title: "Scene 1",
                sequence: 1,
                content: "",
                status: "drafting",
            });
            sceneId = newScene.id;
        }

        return { success: true, sceneId };

    } catch (error) {
        console.error("Failed to initialize project", error);
        return { success: false, error: "Initialization failed" };
    }
}
