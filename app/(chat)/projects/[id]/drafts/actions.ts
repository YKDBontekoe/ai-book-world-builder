"use server";

import { generateText } from "ai";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import { myProvider } from "@/lib/ai/providers";
import {
  createChapterDraftEntry,
  createOutline,
  createVolumePlan,
  getAttributesForProject,
  getEntitiesForProject,
  getOutlineById,
  getProjectByIdWithAccess,
  getRelationshipsForProject,
  getVolumePlanById,
  type VolumePlan,
} from "@/lib/db/queries";
import type { Outline } from "@/lib/db/schema";
import { ChatSDKError } from "@/lib/errors";
import {
  describeChapterStatus,
  extractChaptersFromText,
} from "@/lib/story/chapters";
import {
  buildLoreContext,
  extractBeatsFromText,
  outlineToPrompt,
} from "@/lib/story/lore";

const outlineSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(3, "Add a title to keep outlines organized."),
  idea: z
    .string()
    .min(12, "Describe the scene or chapter in at least 12 characters."),
  pov: z.string().min(3, "Select a point of view."),
  tone: z.string().min(3, "Add a tonal cue."),
  pacing: z.string().min(3, "Add pacing guidance."),
});

const draftSchema = z.object({
  projectId: z.string().uuid(),
  outlineId: z.string().uuid(),
  notes: z.string().optional(),
});

const volumeSchema = z.object({
  projectId: z.string().uuid(),
  outlineId: z.string().uuid(),
  volumeTitle: z.string().min(3, "Name your volume so you can find it later."),
  guidance: z.string().optional(),
});

const chapterDraftSequenceSchema = z.object({
  projectId: z.string().uuid(),
  volumeId: z.string().uuid(),
});

export type OutlineDraftState = {
  error?: string;
  outline?: Outline;
  draft?: string;
};

export type VolumePlannerState = {
  error?: string;
  volume?: VolumePlan;
};

async function requireProjectOwner(projectId: string, userId?: string) {
  const project = await getProjectByIdWithAccess({ id: projectId, userId });

  if (!project) {
    throw new ChatSDKError(
      "not_found:api",
      "Project not found or you do not have access."
    );
  }

  if (project.userId !== userId) {
    throw new ChatSDKError(
      "forbidden:api",
      "Only the project owner can update outlines."
    );
  }

  return project;
}

export async function generateOutlineAction(
  _prevState: OutlineDraftState,
  formData: FormData
): Promise<OutlineDraftState> {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/guest");
  }

  const parsed = outlineSchema.safeParse({
    projectId: formData.get("projectId"),
    title: formData.get("title"),
    idea: formData.get("idea"),
    pov: formData.get("pov"),
    tone: formData.get("tone"),
    pacing: formData.get("pacing"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.errors.map((issue) => issue.message).join(" "),
    };
  }

  try {
    await requireProjectOwner(parsed.data.projectId, session.user?.id);

    const [entities, attributes, relationships] = await Promise.all([
      getEntitiesForProject({ projectId: parsed.data.projectId }),
      getAttributesForProject({ projectId: parsed.data.projectId }),
      getRelationshipsForProject({ projectId: parsed.data.projectId }),
    ]);

    const loreContext = buildLoreContext({
      entities,
      attributes,
      relationships,
    });

    const { text } = await generateText({
      model: myProvider.languageModel("artifact-model"),
      system:
        "You plan detailed story outlines for fiction drafts. Keep responses concise, numbered, and aligned to supplied tone and pacing.",
      prompt: `Story idea: ${parsed.data.idea}\nPoint of view: ${parsed.data.pov}\nTone: ${parsed.data.tone}\nPacing: ${parsed.data.pacing}\n\n${loreContext}\n\nReturn a numbered list of beats with one sentence each.`,
    });

    const beats = extractBeatsFromText(text);

    const outline = await createOutline({
      projectId: parsed.data.projectId,
      title: parsed.data.title,
      summary: parsed.data.idea,
      pov: parsed.data.pov,
      tone: parsed.data.tone,
      pacing: parsed.data.pacing,
      beats,
    });

    revalidatePath(`/projects/${parsed.data.projectId}/drafts`);

    return { outline };
  } catch (error) {
    const chatError = error instanceof ChatSDKError ? error : null;
    return {
      error:
        chatError?.message ??
        "Unable to generate an outline right now. Please try again.",
    };
  }
}

export async function generateDraftAction(
  _prevState: OutlineDraftState,
  formData: FormData
): Promise<OutlineDraftState> {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/guest");
  }

  const parsed = draftSchema.safeParse({
    projectId: formData.get("projectId"),
    outlineId: formData.get("outlineId"),
    notes: formData.get("notes") ?? undefined,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.errors.map((issue) => issue.message).join(" "),
    };
  }

  try {
    await requireProjectOwner(parsed.data.projectId, session.user?.id);

    const outline = await getOutlineById({ id: parsed.data.outlineId });

    if (!outline || outline.projectId !== parsed.data.projectId) {
      throw new ChatSDKError(
        "not_found:api",
        "Outline not found for this project."
      );
    }

    const [entities, attributes, relationships] = await Promise.all([
      getEntitiesForProject({ projectId: parsed.data.projectId }),
      getAttributesForProject({ projectId: parsed.data.projectId }),
      getRelationshipsForProject({ projectId: parsed.data.projectId }),
    ]);

    const loreContext = buildLoreContext({
      entities,
      attributes,
      relationships,
    });

    const outlinePrompt = outlineToPrompt(outline);
    const noteSection = parsed.data.notes
      ? `Additional notes to weave in: ${parsed.data.notes}`
      : "";

    const { text } = await generateText({
      model: myProvider.languageModel("artifact-model"),
      system:
        "You are drafting narrative prose that follows a provided outline while respecting project lore. Keep continuity with entities and relationships and write in clear paragraphs.",
      prompt: `${outlinePrompt}\n\n${loreContext}\n${noteSection}\n\nWrite the opening draft that stays aligned to the outline beats.`,
    });

    return { draft: text, outline };
  } catch (error) {
    const chatError = error instanceof ChatSDKError ? error : null;
    return {
      error:
        chatError?.message ??
        "Unable to generate a draft right now. Please try again.",
    };
  }
}

export async function generateVolumePlanAction(
  _prevState: VolumePlannerState,
  formData: FormData
): Promise<VolumePlannerState> {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/guest");
  }

  const parsed = volumeSchema.safeParse({
    projectId: formData.get("projectId"),
    outlineId: formData.get("outlineId"),
    volumeTitle: formData.get("volumeTitle"),
    guidance: formData.get("guidance") ?? undefined,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.errors.map((issue) => issue.message).join(" "),
    };
  }

  try {
    await requireProjectOwner(parsed.data.projectId, session.user?.id);

    const outline = await getOutlineById({ id: parsed.data.outlineId });

    if (!outline || outline.projectId !== parsed.data.projectId) {
      throw new ChatSDKError(
        "not_found:api",
        "Outline not found for this project."
      );
    }

    const [entities, attributes, relationships] = await Promise.all([
      getEntitiesForProject({ projectId: parsed.data.projectId }),
      getAttributesForProject({ projectId: parsed.data.projectId }),
      getRelationshipsForProject({ projectId: parsed.data.projectId }),
    ]);

    const loreContext = buildLoreContext({
      entities,
      attributes,
      relationships,
    });
    const outlinePrompt = outlineToPrompt(outline);

    const { text } = await generateText({
      model: myProvider.languageModel("artifact-model"),
      system:
        "You are an editorial planner who maps outlines into ordered chapter sequences with short guidance notes.",
      prompt: `${outlinePrompt}\n${loreContext}\n${
        parsed.data.guidance ? `Planner notes: ${parsed.data.guidance}` : ""
      }\n\nReturn a numbered list of chapters using the format 'Chapter title - focus or note'.`,
    });

    const chapters = extractChaptersFromText(text);

    if (chapters.length === 0) {
      throw new ChatSDKError(
        "bad_request:api",
        "No chapters were returned. Add more guidance and try again."
      );
    }

    const volume = await createVolumePlan({
      projectId: parsed.data.projectId,
      outlineId: parsed.data.outlineId,
      title: parsed.data.volumeTitle,
      summary: parsed.data.guidance,
      chapters,
    });

    revalidatePath(`/projects/${parsed.data.projectId}/drafts`);

    return { volume };
  } catch (error) {
    const chatError = error instanceof ChatSDKError ? error : null;
    return {
      error:
        chatError?.message ??
        "Unable to map chapters right now. Please try again in a moment.",
    };
  }
}

export async function generateChapterDraftSequenceAction(
  _prevState: VolumePlannerState,
  formData: FormData
): Promise<VolumePlannerState> {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/guest");
  }

  const parsed = chapterDraftSequenceSchema.safeParse({
    projectId: formData.get("projectId"),
    volumeId: formData.get("volumeId"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.errors.map((issue) => issue.message).join(" "),
    };
  }

  try {
    await requireProjectOwner(parsed.data.projectId, session.user?.id);

    const volume = await getVolumePlanById({ id: parsed.data.volumeId });

    if (!volume || volume.projectId !== parsed.data.projectId) {
      throw new ChatSDKError(
        "not_found:api",
        "Chapter plan not found for this project."
      );
    }

    const outline = await getOutlineById({ id: volume.outlineId });

    if (!outline) {
      throw new ChatSDKError(
        "not_found:api",
        "Outline missing for this chapter plan."
      );
    }

    const [entities, attributes, relationships] = await Promise.all([
      getEntitiesForProject({ projectId: parsed.data.projectId }),
      getAttributesForProject({ projectId: parsed.data.projectId }),
      getRelationshipsForProject({ projectId: parsed.data.projectId }),
    ]);

    const loreContext = buildLoreContext({
      entities,
      attributes,
      relationships,
    });
    const outlinePrompt = outlineToPrompt(outline);

    for (const chapterPlan of [...volume.chapters].sort(
      (first, second) => first.sequence - second.sequence
    )) {
      if (chapterPlan.drafts.length > 0) {
        continue;
      }

      const completedChapters = volume.chapters
        .filter((chapterItem) => chapterItem.sequence < chapterPlan.sequence)
        .map((chapterItem) => describeChapterStatus(chapterItem))
        .join("\n");

      const chapterNotes = chapterPlan.notes
        ? `Notes: ${chapterPlan.notes}`
        : "Focus on this chapter's title as the guide.";

      const { text } = await generateText({
        model: myProvider.languageModel("artifact-model"),
        system:
          "You write full chapter drafts in sequence while honoring outlines, lore, and prior chapters.",
        prompt: `${outlinePrompt}\n\n${loreContext}\n\n${
          completedChapters
            ? `Completed chapters so far:\n${completedChapters}\n\n`
            : ""
        }Volume: ${volume.title}\nChapter ${chapterPlan.sequence}: ${
          chapterPlan.title
        }\n${chapterNotes}\n\nWrite the prose for this chapter, maintaining continuity and moving the story forward.`,
      });

      await createChapterDraftEntry({
        chapterId: chapterPlan.id,
        volumeId: volume.id,
        outlineId: outline.id,
        projectId: parsed.data.projectId,
        content: text,
      });
    }

    const refreshedVolume = await getVolumePlanById({ id: volume.id });

    revalidatePath(`/projects/${parsed.data.projectId}/drafts`);

    return { volume: refreshedVolume ?? volume };
  } catch (error) {
    const chatError = error instanceof ChatSDKError ? error : null;
    return {
      error:
        chatError?.message ??
        "Unable to generate the chapter drafts right now. Please try again.",
    };
  }
}
