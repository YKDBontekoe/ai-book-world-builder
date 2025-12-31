"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import type { VisibilityType } from "@/components/organisms/chat/visibility-selector";
import { db } from "@/lib/db/drizzle";
import { projectRepository } from "@/lib/db/repositories";
import {
	bookExport,
	bookGeneration,
	bookGenerationAsset,
	bookGenerationStep,
	chapter,
	chapterDraft,
	chapterVersion,
	entity,
	entityAttribute,
	generationNote,
	outline,
	project,
	relationship,
	scene,
	sceneCard,
	storyState,
	volume,
} from "@/lib/db/schema";

// Validation Schemas
const createProjectSchema = z.object({
	name: z.string().min(1, "Name is required").max(100, "Name is too long"),
	description: z.string().max(500, "Description is too long").optional(),
	visibility: z.enum(["private", "public"]),
});

const renameProjectSchema = z.object({
	name: z.string().min(1, "Name is required").max(100, "Name is too long"),
	description: z.string().max(500, "Description is too long").optional(),
});

export async function createProjectAction(params: {
	name: string;
	description?: string;
	visibility: VisibilityType;
}) {
	const session = await auth();
	if (!session?.user?.id) {
		return { error: "Unauthorized" };
	}

	const validation = createProjectSchema.safeParse(params);
	if (!validation.success) {
		return { error: validation.error.message };
	}

	try {
		const newProject = await projectRepository.create({
			...validation.data,
			userId: session.user.id,
		});

		revalidatePath("/projects");
		return { success: true, projectId: newProject.id };
	} catch (error) {
		console.error("Create project error:", error);
		return { error: "Failed to create project" };
	}
}

export async function renameProject(
	projectId: string,
	name: string,
	description?: string,
) {
	const session = await auth();
	if (!session?.user?.id) {
		return { error: "Unauthorized" };
	}
	const userId = session.user.id;

	const validation = renameProjectSchema.safeParse({ name, description });
	if (!validation.success) {
		return { error: validation.error.message };
	}

	const existingProject = await projectRepository.findByIdWithAccess(
		projectId,
		userId,
	);

	if (!existingProject) {
		return { error: "Project not found or access denied" };
	}

	if (existingProject.userId !== userId) {
		return { error: "Only the project owner can rename it." };
	}

	try {
		await projectRepository.update(projectId, validation.data);

		revalidatePath("/projects");
		revalidatePath(`/projects/${projectId}`);
		return { success: true };
	} catch (error) {
		console.error("Rename project error:", error);
		return { error: "Failed to rename project" };
	}
}

export async function deleteProject(projectId: string) {
	return deleteProjects([projectId]);
}

export async function deleteProjects(projectIds: string[]) {
	const session = await auth();
	if (!session?.user?.id) {
		return { error: "Unauthorized" };
	}
	const userId = session.user.id;

	if (projectIds.length === 0) {
		return { success: true };
	}

	try {
		// Verify ownership for all projects at the database level
		const ownedProjects = await db
			.select({ id: project.id })
			.from(project)
			.where(and(inArray(project.id, projectIds), eq(project.userId, userId)));

		const ownedProjectIds = ownedProjects.map((p) => p.id);

		// If the number of owned projects doesn't match the number of requested IDs,
		// it means some projects were not found or not owned by the user.
		if (ownedProjectIds.length !== projectIds.length) {
			return { error: "Access denied or project not found" };
		}

		if (ownedProjectIds.length === 0) {
			return { success: true }; // Nothing to delete
		}

		await db.transaction(async (tx) => {
			// 1. Generation related tables (Leaf first)
			const generations = await tx
				.select({ id: bookGeneration.id })
				.from(bookGeneration)
				.where(inArray(bookGeneration.projectId, ownedProjectIds));

			const generationIds = generations.map((g) => g.id);

			if (generationIds.length > 0) {
				await tx
					.delete(generationNote)
					.where(inArray(generationNote.generationId, generationIds));
				await tx
					.delete(bookGenerationAsset)
					.where(inArray(bookGenerationAsset.generationId, generationIds));
				await tx
					.delete(bookGenerationStep)
					.where(inArray(bookGenerationStep.generationId, generationIds));
				await tx
					.delete(storyState)
					.where(inArray(storyState.generationId, generationIds));
				await tx
					.delete(chapterVersion)
					.where(inArray(chapterVersion.generationId, generationIds));
			}

			// Delete generations
			await tx
				.delete(bookGeneration)
				.where(inArray(bookGeneration.projectId, ownedProjectIds));

			// 2. Book Exports
			await tx
				.delete(bookExport)
				.where(inArray(bookExport.projectId, ownedProjectIds));

			// 3. Structure (Scenes, Chapters, etc.)
			await tx
				.delete(sceneCard)
				.where(inArray(sceneCard.projectId, ownedProjectIds));
			await tx.delete(scene).where(inArray(scene.projectId, ownedProjectIds));
			await tx
				.delete(chapterDraft)
				.where(inArray(chapterDraft.projectId, ownedProjectIds));
			await tx
				.delete(chapter)
				.where(inArray(chapter.projectId, ownedProjectIds));
			await tx.delete(volume).where(inArray(volume.projectId, ownedProjectIds));
			await tx
				.delete(outline)
				.where(inArray(outline.projectId, ownedProjectIds));

			// 4. Entities & Relationships
			await tx
				.delete(relationship)
				.where(inArray(relationship.projectId, ownedProjectIds));
			await tx
				.delete(entityAttribute)
				.where(inArray(entityAttribute.projectId, ownedProjectIds));
			await tx.delete(entity).where(inArray(entity.projectId, ownedProjectIds));

			// 5. Project itself
			await tx.delete(project).where(inArray(project.id, ownedProjectIds));
		});

		revalidatePath("/projects");
		return { success: true };
	} catch (error) {
		console.error("Delete projects error:", error);
		return { error: "Failed to delete projects" };
	}
}

export async function forkProject(originalProjectId: string, newName?: string) {
	const session = await auth();
	if (!session?.user?.id) {
		return { error: "Unauthorized" };
	}
	const userId = session.user.id;

	// 1. Pre-flight check for project size to prevent OOM/Timeouts
	const entityCount = await db.$count(
		entity,
		eq(entity.projectId, originalProjectId),
	);

	// Limit to reasonable size for synchronous operation (e.g. 500 entities)
	// Larger projects would require a background job queue
	if (entityCount > 500) {
		return {
			error:
				"Project is too large to fork instantly. Please export and import instead.",
		};
	}

	const originalProject = await projectRepository.findByIdWithAccess(
		originalProjectId,
		userId,
	);

	if (!originalProject) {
		return { error: "Project not found or access denied" };
	}

	// Validate name length
	const rawName = newName || `Fork of ${originalProject.name}`;
	const finalName = rawName.slice(0, 100); // Truncate to DB limit

	try {
		const result = await db.transaction(async (tx) => {
			// 1. Create New Project
			const [newProject] = await tx
				.insert(project)
				.values({
					name: finalName,
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
				const { id: _, ...entityData } = oldEnt;
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
				const { id: _, ...attrData } = oldAttr;
				const newEntityId = entityIdMap.get(oldAttr.entityId);
				if (newEntityId) {
					await tx.insert(entityAttribute).values({
						...attrData,
						entityId: newEntityId,
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
				const { id: _, ...relData } = oldRel;
				const sourceId = entityIdMap.get(oldRel.sourceEntityId);
				const targetId = entityIdMap.get(oldRel.targetEntityId);
				if (sourceId && targetId) {
					await tx.insert(relationship).values({
						...relData,
						sourceEntityId: sourceId,
						targetEntityId: targetId,
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
				const { id: _, ...outlineData } = oldOutline;
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
					.where(
						and(
							eq(volume.projectId, originalProjectId),
							eq(volume.outlineId, oldOutline.id),
						),
					);

				for (const oldVolume of oldVolumes) {
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
						.where(
							and(
								eq(chapter.projectId, originalProjectId),
								eq(chapter.volumeId, oldVolId),
							),
						);

					for (const oldChapter of oldChapters) {
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
							.where(
								and(
									eq(chapterDraft.projectId, originalProjectId),
									eq(chapterDraft.chapterId, oldChapId),
								),
							);

						for (const oldDraft of oldDrafts) {
							const { id: _, ...draftData } = oldDraft;
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

			// 6. Copy Scenes (Two-Pass Strategy to Fix prevSceneId links)
			const oldScenes = await tx
				.select()
				.from(scene)
				.where(eq(scene.projectId, originalProjectId));

			const sceneIdMap = new Map<string, string>();

			// Pass 1: Create scenes with null prevSceneId to avoid constraint violations or self-references
			for (const oldScene of oldScenes) {
				const { id: _, prevSceneId: __, ...sceneData } = oldScene;
				const newChapterId = chapterIdMap.get(oldScene.chapterId);

				if (newChapterId) {
					// Insert without prevSceneId initially
					const [newScene] = await tx
						.insert(scene)
						.values({
							...sceneData,
							prevSceneId: null,
							chapterId: newChapterId,
							projectId: newProject.id,
							createdAt: new Date(),
							updatedAt: new Date(),
						})
						.returning();
					sceneIdMap.set(oldScene.id, newScene.id);
				}
			}

			// Pass 2: Re-link prevSceneId using the map
			for (const oldScene of oldScenes) {
				if (oldScene.prevSceneId) {
					const newSceneId = sceneIdMap.get(oldScene.id);
					const newPrevSceneId = sceneIdMap.get(oldScene.prevSceneId);

					// Only update if both ends of the link were successfully copied
					if (newSceneId && newPrevSceneId) {
						await tx
							.update(scene)
							.set({ prevSceneId: newPrevSceneId })
							.where(eq(scene.id, newSceneId));
					}
				}
			}

			// 7. Copy Scene Cards
			const oldSceneCards = await tx
				.select()
				.from(sceneCard)
				.where(eq(sceneCard.projectId, originalProjectId));

			for (const oldCard of oldSceneCards) {
				const { id: _, ...cardData } = oldCard;
				const newSceneId = sceneIdMap.get(oldCard.sceneId);
				if (newSceneId) {
					await tx.insert(sceneCard).values({
						...cardData,
						sceneId: newSceneId,
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
