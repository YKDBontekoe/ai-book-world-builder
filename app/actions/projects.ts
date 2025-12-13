"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/app/(auth)/auth";
import { getProjectByIdWithAccess } from "@/lib/db/queries";
import { db } from "@/lib/db/drizzle";
import {
  project,
  entity,
  entityAttribute,
  relationship,
  outline,
  volume,
  chapter,
  chapterDraft,
  scene,
  sceneCard,
} from "@/lib/db/schema";

export async function forkProject(originalProjectId: string, newName?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }
  const userId = session.user.id;

  const originalProject = await getProjectByIdWithAccess({
    id: originalProjectId,
    userId,
  });

  if (!originalProject) {
    return { error: "Project not found or access denied" };
  }

  try {
    const result = await db.transaction(async (tx) => {
      // 1. Create New Project
      const [newProject] = await tx
        .insert(project)
        .values({
          name: newName || `Fork of ${originalProject.name}`,
          description: originalProject.description,
          visibility: "private",
          userId,
          folders: originalProject.folders,
          forkedFromId: originalProjectId,
          createdAt: new Date(),
        })
        .returning();

      // 2. Copy Entities
      const oldEntities = await tx
        .select()
        .from(entity)
        .where(eq(entity.projectId, originalProjectId));

      const entityIdMap = new Map<string, string>();

      for (const oldEnt of oldEntities) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...entityData } = oldEnt;
        const [newEnt] = await tx
          .insert(entity)
          .values({
            ...entityData,
            projectId: newProject.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();
        entityIdMap.set(oldEnt.id, newEnt.id);
      }

      // 3. Copy Entity Attributes
      const oldAttributes = await tx
        .select()
        .from(entityAttribute)
        .where(eq(entityAttribute.projectId, originalProjectId));

      for (const oldAttr of oldAttributes) {
         // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...attrData } = oldAttr;
        if (entityIdMap.has(oldAttr.entityId)) {
          await tx.insert(entityAttribute).values({
            ...attrData,
            entityId: entityIdMap.get(oldAttr.entityId)!,
            projectId: newProject.id,
            createdAt: new Date(),
          });
        }
      }

      // 4. Copy Relationships
      const oldRelationships = await tx
        .select()
        .from(relationship)
        .where(eq(relationship.projectId, originalProjectId));

      for (const oldRel of oldRelationships) {
         // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...relData } = oldRel;
        if (
          entityIdMap.has(oldRel.sourceEntityId) &&
          entityIdMap.has(oldRel.targetEntityId)
        ) {
          await tx.insert(relationship).values({
            ...relData,
            sourceEntityId: entityIdMap.get(oldRel.sourceEntityId)!,
            targetEntityId: entityIdMap.get(oldRel.targetEntityId)!,
            projectId: newProject.id,
            createdAt: new Date(),
          });
        }
      }

      // 5. Copy Outlines
      const oldOutlines = await tx
        .select()
        .from(outline)
        .where(eq(outline.projectId, originalProjectId));

      const outlineIdMap = new Map<string, string>();
      const volumeIdMap = new Map<string, string>();
      const chapterIdMap = new Map<string, string>();

      for (const oldOutline of oldOutlines) {
         // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...outlineData } = oldOutline;
        const [newOutline] = await tx
          .insert(outline)
          .values({
            ...outlineData,
            projectId: newProject.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();
        outlineIdMap.set(oldOutline.id, newOutline.id);

        // Copy Volumes for this outline
        const oldVolumes = await tx
          .select()
          .from(volume)
          .where(and(eq(volume.projectId, originalProjectId), eq(volume.outlineId, oldOutline.id)));

        for (const oldVolume of oldVolumes) {
           // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id: oldVolId, ...volData } = oldVolume;
          const [newVolume] = await tx
            .insert(volume)
            .values({
              ...volData,
              outlineId: newOutline.id,
              projectId: newProject.id,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .returning();
          volumeIdMap.set(oldVolId, newVolume.id);

          // Copy Chapters for this volume
          const oldChapters = await tx
            .select()
            .from(chapter)
            .where(and(eq(chapter.projectId, originalProjectId), eq(chapter.volumeId, oldVolId)));

          for (const oldChapter of oldChapters) {
             // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id: oldChapId, ...chapData } = oldChapter;
            const [newChapter] = await tx
              .insert(chapter)
              .values({
                ...chapData,
                volumeId: newVolume.id,
                outlineId: newOutline.id,
                projectId: newProject.id,
                createdAt: new Date(),
                updatedAt: new Date(),
              })
              .returning();
            chapterIdMap.set(oldChapId, newChapter.id);

            // Copy Chapter Drafts
            const oldDrafts = await tx
              .select()
              .from(chapterDraft)
              .where(and(eq(chapterDraft.projectId, originalProjectId), eq(chapterDraft.chapterId, oldChapId)));

            for (const oldDraft of oldDrafts) {
               // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { id, ...draftData } = oldDraft;
              await tx.insert(chapterDraft).values({
                ...draftData,
                chapterId: newChapter.id,
                volumeId: newVolume.id,
                outlineId: newOutline.id,
                projectId: newProject.id,
                createdAt: new Date(),
                updatedAt: new Date(),
              });
            }
          }
        }
      }

      // 6. Copy Scenes (Linked to Chapters)
      const oldScenes = await tx
        .select()
        .from(scene)
        .where(eq(scene.projectId, originalProjectId));

      const sceneIdMap = new Map<string, string>();

      for (const oldScene of oldScenes) {
         // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...sceneData } = oldScene;
        // Only copy if chapter exists (it should, but safety first)
        if (chapterIdMap.has(oldScene.chapterId)) {
          const [newScene] = await tx
            .insert(scene)
            .values({
              ...sceneData,
              chapterId: chapterIdMap.get(oldScene.chapterId)!,
              projectId: newProject.id,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .returning();
          sceneIdMap.set(oldScene.id, newScene.id);
        }
      }

      // 7. Copy Scene Cards
      const oldSceneCards = await tx
        .select()
        .from(sceneCard)
        .where(eq(sceneCard.projectId, originalProjectId));

      for (const oldCard of oldSceneCards) {
         // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...cardData } = oldCard;
        if (sceneIdMap.has(oldCard.sceneId)) {
          await tx.insert(sceneCard).values({
            ...cardData,
            sceneId: sceneIdMap.get(oldCard.sceneId)!,
            projectId: newProject.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }

      return { success: true, projectId: newProject.id };
    });

    revalidatePath("/projects");
    return result;
  } catch (error) {
    console.error("Fork project error:", error);
    return { error: "Failed to fork project" };
  }
}
