"use server";

import { generateObject } from "ai";
import { z } from "zod";
import { myProvider } from "@/lib/ai/providers";
import { db } from "@/lib/db/drizzle";
import { outline, volume, chapter, scene } from "@/lib/db/schema";
import { ensureProjectAccess } from "@/lib/actions-utils";
import { cookies } from "next/headers";
import { eq, asc, desc } from "drizzle-orm";
import { continueWriting } from "@/lib/ai/writer";
import { createScene } from "@/lib/db/queries/scene";

const bookPlanSchema = z.object({
  title: z.string().describe("The suggested title of the book"),
  logline: z.string().describe("A one-sentence summary of the story"),
  summary: z.string().describe("A paragraph summary of the plot"),
  chapters: z.array(
    z.object({
      title: z.string(),
      summary: z.string().describe("What happens in this chapter"),
    })
  ).describe("The list of chapters for the book"),
});

export type BookPlan = z.infer<typeof bookPlanSchema>;

export async function generateBookPlan(prompt: string, modelId?: string) {
  try {
    const cookieStore = await cookies();
    const targetModel = modelId || cookieStore.get("chat-model")?.value || "gpt-4o";

    const { object } = await generateObject({
      model: myProvider.languageModel(targetModel),
      schema: bookPlanSchema,
      prompt: `Create a book outline based on this prompt: "${prompt}".
               Structure it into a logical sequence of chapters (approx 10-20 depending on the scope).
               Provide a title, logline, and detailed summary.`,
    });

    return { success: true, plan: object };
  } catch (error) {
    console.error("Failed to generate book plan", error);
    return { success: false, error: "Failed to generate plan" };
  }
}

export async function createBookFromPlan(projectId: string, plan: BookPlan) {
  try {
    await ensureProjectAccess(projectId, true);

    await db.transaction(async (tx) => {
        // 1. Create Outline
        const [newOutline] = await tx.insert(outline).values({
          projectId,
          title: plan.title,
          summary: plan.summary,
          pov: "Third Person",
          tone: "Neutral",
          pacing: "Moderate",
          beats: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }).returning();

        // 2. Create Volume
        const [newVolume] = await tx.insert(volume).values({
          projectId,
          outlineId: newOutline.id,
          title: "Volume 1",
          createdAt: new Date(),
          updatedAt: new Date(),
        }).returning();

        // 3. Create Chapters
        for (let i = 0; i < plan.chapters.length; i++) {
            const ch = plan.chapters[i];
            await tx.insert(chapter).values({
                projectId,
                volumeId: newVolume.id,
                outlineId: newOutline.id,
                title: ch.title,
                notes: ch.summary,
                sequence: i + 1,
                status: "planned",
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }

        // 4. Create Initial Scene for Chapter 1
        const [chapter1] = await tx.select().from(chapter)
            .where(eq(chapter.volumeId, newVolume.id))
            .orderBy(asc(chapter.sequence))
            .limit(1);

        if (chapter1) {
            await tx.insert(scene).values({
                projectId,
                chapterId: chapter1.id,
                title: "Scene 1",
                sequence: 1,
                content: "",
                status: "drafting",
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to create book from plan", error);
    return { success: false, error: "Failed to apply plan" };
  }
}

export async function planChapterScenes(chapterId: string) {
    try {
        const [targetChapter] = await db
            .select()
            .from(chapter)
            .where(eq(chapter.id, chapterId))
            .limit(1);

        if (!targetChapter) throw new Error("Chapter not found");

        await ensureProjectAccess(targetChapter.projectId, true);

        const cookieStore = await cookies();
        const modelId = cookieStore.get("chat-model")?.value || "gpt-4o";

        const scenePlanSchema = z.object({
            scenes: z.array(z.object({
                title: z.string(),
                beat: z.string().describe("What happens in this scene"),
            }))
        });

        const { object: scenePlan } = await generateObject({
            model: myProvider.languageModel(modelId),
            schema: scenePlanSchema,
            prompt: `Break this chapter into 3-5 scenes based on its summary.\n\nChapter Title: ${targetChapter.title}\nSummary: ${targetChapter.notes}`,
        });

        const [lastScene] = await db
            .select()
            .from(scene)
            .where(eq(scene.chapterId, chapterId))
            .orderBy(desc(scene.sequence))
            .limit(1);

        let startSequence = lastScene ? lastScene.sequence + 1 : 1;
        const createdIds: string[] = [];

        for (const plan of scenePlan.scenes) {
             const newScene = await createScene({
                projectId: targetChapter.projectId,
                chapterId,
                title: plan.title,
                sequence: startSequence++,
                content: "", // Start empty
                status: "planned" // Or drafting
            });
            createdIds.push(newScene.id);
        }

        return { success: true, sceneIds: createdIds };

    } catch (error) {
        console.error("Failed to plan chapter scenes", error);
        return { success: false, error: "Planning failed" };
    }
}

export async function generateSceneText(sceneId: string) {
    try {
        const [targetScene] = await db.select().from(scene).where(eq(scene.id, sceneId)).limit(1);
        if (!targetScene) throw new Error("Scene not found");

        await ensureProjectAccess(targetScene.projectId, true);

        // Build context from previous scenes in the same chapter
        const [targetChapter] = await db.select().from(chapter).where(eq(chapter.id, targetScene.chapterId)).limit(1);
        const scenes = await db.select().from(scene).where(eq(scene.chapterId, targetScene.chapterId)).orderBy(asc(scene.sequence));

        // Find previous scenes that have content
        const previousScenes = scenes.filter(s => s.sequence < targetScene.sequence && s.content);
        const prevContext = previousScenes.map(s => `Scene ${s.title}: ${s.content?.slice(-500)}`).join("\n");
        const chapterContext = `Chapter: ${targetChapter.title}\nNotes: ${targetChapter.notes}`;

        const cookieStore = await cookies();
        const modelId = cookieStore.get("chat-model")?.value || "gpt-4o";

        const { text } = await continueWriting(
            `${chapterContext}\n${prevContext}`,
            `Scene Title: ${targetScene.title}\n\n`,
            { modelId }
        );

        if (text) {
             await db.update(scene).set({
                 content: text,
                 status: "drafting",
                 updatedAt: new Date()
             }).where(eq(scene.id, sceneId));
        }

        return { success: true };

    } catch (error) {
        console.error("Failed to generate scene text", error);
        return { success: false };
    }
}
