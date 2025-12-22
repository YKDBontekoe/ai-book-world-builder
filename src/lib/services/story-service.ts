import { generateObject } from "ai";
import { z } from "zod";
import { myProvider } from "@/lib/ai/providers";
import { db } from "@/lib/db/drizzle";
import { outline, volume, chapter, scene } from "@/lib/db/schema";
import { ensureProjectAccess } from "@/lib/actions-utils";
import { eq, asc, desc } from "drizzle-orm";
import { continueWriting } from "@/lib/ai/writer";
import { createScene } from "@/lib/db/queries/scene";
import { getSelectedModelId } from "@/lib/ai/models";

export const bookPlanSchema = z.object({
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

export interface StoryStyle {
  pov: string;
  tone: string;
  genre: string;
}

export class StoryService {
  async generateBookPlan(prompt: string, style?: StoryStyle, modelId?: string) {
    // Use Large model for complex planning
    const targetModel = modelId || await getSelectedModelId("large");

    let promptText = `Create a book outline based on this prompt: "${prompt}".`;
    if (style) {
      promptText += `\nGenre: ${style.genre}\nPOV: ${style.pov}\nTone: ${style.tone}`;
    }
    promptText += `\nStructure it into a logical sequence of chapters (approx 10-20 depending on the scope). Provide a title, logline, and detailed summary.`;

    const { object } = await generateObject({
      model: myProvider.languageModel(targetModel),
      schema: bookPlanSchema,
      prompt: promptText,
    });

    return object;
  }

  async createBookFromPlan(projectId: string, plan: BookPlan, style?: StoryStyle) {
    await ensureProjectAccess(projectId, true);

    await db.transaction(async (tx) => {
        // 1. Create Outline
        const [newOutline] = await tx.insert(outline).values({
          projectId,
          title: plan.title,
          summary: plan.summary,
          pov: style?.pov || "Third Person",
          tone: style?.tone || "Neutral",
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
  }

  async planChapterScenes(chapterId: string) {
    const [targetChapter] = await db
        .select()
        .from(chapter)
        .where(eq(chapter.id, chapterId))
        .limit(1);

    if (!targetChapter) throw new Error("Chapter not found");

    await ensureProjectAccess(targetChapter.projectId, true);

    // Use Large model for scene planning
    const modelId = await getSelectedModelId("large");

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

    return createdIds;
  }

  async generateSceneText(sceneId: string) {
    const [targetScene] = await db.select().from(scene).where(eq(scene.id, sceneId)).limit(1);
    if (!targetScene) throw new Error("Scene not found");

    await ensureProjectAccess(targetScene.projectId, true);

    // Build context
    const [targetChapter] = await db.select().from(chapter).where(eq(chapter.id, targetScene.chapterId)).limit(1);
    const [targetOutline] = await db.select().from(outline).where(eq(outline.id, targetChapter.outlineId)).limit(1);

    // Get all scenes in chapter
    const scenes = await db.select().from(scene).where(eq(scene.chapterId, targetScene.chapterId)).orderBy(asc(scene.sequence));

    // Smart Context Construction
    const previousScenes = scenes.filter(s => s.sequence < targetScene.sequence);

    // 1. Get full text of immediate predecessor (for continuity)
    const lastScene = previousScenes[previousScenes.length - 1];
    const lastSceneText = lastScene?.content ? `[IMMEDIATELY PREVIOUS SCENE - ${lastScene.title}]\n${lastScene.content.slice(-2000)}` : "";

    // 2. Get summaries of earlier scenes (for arc memory)
    const otherScenesSummary = previousScenes.slice(0, -1).map(s => `[SCENE ${s.title}]: ${s.content ? "Completed" : "Planned"}`).join("\n");

    const chapterContext = `Chapter Title: ${targetChapter.title}\nChapter Summary: ${targetChapter.notes}`;
    const fullContext = `${chapterContext}\n\nPrevious Scenes Summary:\n${otherScenesSummary}\n\n${lastSceneText}`;

    // Use Large model for prose generation
    const modelId = await getSelectedModelId("large");
    const styleInstruction = targetOutline ? `${targetOutline.pov}, ${targetOutline.tone}` : undefined;

    const { text } = await continueWriting(
        fullContext,
        `Scene Title: ${targetScene.title}\n\n`,
        {
            modelId,
            style: styleInstruction
        }
    );

    if (text) {
            await db.update(scene).set({
                content: text,
                status: "drafting",
                updatedAt: new Date()
            }).where(eq(scene.id, sceneId));
    }
  }
}

export const storyService = new StoryService();
