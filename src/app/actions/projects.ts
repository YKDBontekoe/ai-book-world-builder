"use server";

import { eq, inArray } from "drizzle-orm";
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

// Helper for chunked inserts
async function chunkedInsert<T>(
	tx: any,
	table: any,
	items: T[],
	chunkSize = 1000,
) {
	for (let i = 0; i < items.length; i += chunkSize) {
		const chunk = items.slice(i, i + chunkSize);
		await tx.insert(table).values(chunk);
	}
}

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
		// Verify ownership for all projects
		const projects = await db
			.select({ id: project.id, userId: project.userId })
			.from(project)
			.where(inArray(project.id, projectIds));

		const ownedProjectIds = projects
			.filter((p) => p.userId === userId)
			.map((p) => p.id);

		if (ownedProjectIds.length === 0) {
			return { error: "No valid projects to delete" };
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
	const [entityCount, sceneCount] = await Promise.all([
		db.$count(entity, eq(entity.projectId, originalProjectId)),
		db.$count(scene, eq(scene.projectId, originalProjectId)),
	]);

	// Limit to reasonable size for synchronous operation (e.g. 2000 total items)
	// Larger projects would require a background job queue
	if (entityCount + sceneCount > 2000) {
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

			// 2. Fetch all source data in parallel
			const [
				oldEntities,
				oldAttributes,
				oldRelationships,
				oldOutlines,
				oldVolumes,
				oldChapters,
				oldChapterDrafts,
				oldScenes,
				oldSceneCards,
			] = await Promise.all([
				tx.select().from(entity).where(eq(entity.projectId, originalProjectId)),
				tx
					.select()
					.from(entityAttribute)
					.where(eq(entityAttribute.projectId, originalProjectId)),
				tx
					.select()
					.from(relationship)
					.where(eq(relationship.projectId, originalProjectId)),
				tx.select().from(outline).where(eq(outline.projectId, originalProjectId)),
				tx.select().from(volume).where(eq(volume.projectId, originalProjectId)),
				tx
					.select()
					.from(chapter)
					.where(eq(chapter.projectId, originalProjectId)),
				tx
					.select()
					.from(chapterDraft)
					.where(eq(chapterDraft.projectId, originalProjectId)),
				tx.select().from(scene).where(eq(scene.projectId, originalProjectId)),
				tx
					.select()
					.from(sceneCard)
					.where(eq(sceneCard.projectId, originalProjectId)),
			]);

			// 3. Batch Insert Entities
			const entityIdMap = new Map<string, string>();
			if (oldEntities.length > 0) {
				const newEntities = oldEntities.map((old) => {
					const newId = crypto.randomUUID();
					entityIdMap.set(old.id, newId);
					const { id: _id, ...data } = old;
					return {
						...data,
						id: newId,
						projectId: newProject.id,
						createdAt: new Date(),
						updatedAt: new Date(),
					};
				});
				await chunkedInsert(tx, entity, newEntities);
			}

			// 4. Batch Insert Attributes
			if (oldAttributes.length > 0) {
				const newAttributes = [];
				for (const old of oldAttributes) {
					const newEntityId = entityIdMap.get(old.entityId);
					if (newEntityId) {
						const { id: _id, ...data } = old;
						newAttributes.push({
							...data,
							id: crypto.randomUUID(),
							entityId: newEntityId,
							projectId: newProject.id,
							createdAt: new Date(),
						});
					}
				}
				if (newAttributes.length > 0) {
					await chunkedInsert(tx, entityAttribute, newAttributes);
				}
			}

			// 5. Batch Insert Relationships
			if (oldRelationships.length > 0) {
				const newRelationships = [];
				for (const old of oldRelationships) {
					const sourceId = entityIdMap.get(old.sourceEntityId);
					const targetId = entityIdMap.get(old.targetEntityId);
					if (sourceId && targetId) {
						const { id: _id, ...data } = old;
						newRelationships.push({
							...data,
							id: crypto.randomUUID(),
							sourceEntityId: sourceId,
							targetEntityId: targetId,
							projectId: newProject.id,
							createdAt: new Date(),
						});
					}
				}
				if (newRelationships.length > 0) {
					await chunkedInsert(tx, relationship, newRelationships);
				}
			}

			// 6. Structure Hierarchy (Outline -> Volume -> Chapter -> Scene)
			const outlineIdMap = new Map<string, string>();
			if (oldOutlines.length > 0) {
				const newOutlines = oldOutlines.map((old) => {
					const newId = crypto.randomUUID();
					outlineIdMap.set(old.id, newId);
					const { id: _id, ...data } = old;
					return {
						...data,
						id: newId,
						projectId: newProject.id,
						createdAt: new Date(),
						updatedAt: new Date(),
					};
				});
				await chunkedInsert(tx, outline, newOutlines);
			}

			const volumeIdMap = new Map<string, string>();
			if (oldVolumes.length > 0) {
				const newVolumes = [];
				for (const old of oldVolumes) {
					const newOutlineId = outlineIdMap.get(old.outlineId);
					if (newOutlineId) {
						const newId = crypto.randomUUID();
						volumeIdMap.set(old.id, newId);
						const { id: _id, ...data } = old;
						newVolumes.push({
							...data,
							id: newId,
							outlineId: newOutlineId,
							projectId: newProject.id,
							createdAt: new Date(),
							updatedAt: new Date(),
						});
					} else {
						// Log orphaned volumes
						console.warn(
							`Orphaned volume skipped during fork. VolumeId: ${old.id}, OutlineId: ${old.outlineId}, SourceProject: ${originalProjectId}, NewProject: ${newProject.id}`,
						);
					}
				}
				if (newVolumes.length > 0) {
					await chunkedInsert(tx, volume, newVolumes);
				}
			}

			const chapterIdMap = new Map<string, string>();
			if (oldChapters.length > 0) {
				const newChapters = [];
				for (const old of oldChapters) {
					const newVolumeId = volumeIdMap.get(old.volumeId);
					const newOutlineId = outlineIdMap.get(old.outlineId);
					if (newVolumeId && newOutlineId) {
						const newId = crypto.randomUUID();
						chapterIdMap.set(old.id, newId);
						const { id: _id, ...data } = old;
						newChapters.push({
							...data,
							id: newId,
							volumeId: newVolumeId,
							outlineId: newOutlineId,
							projectId: newProject.id,
							createdAt: new Date(),
							updatedAt: new Date(),
						});
					}
				}
				if (newChapters.length > 0) {
					await chunkedInsert(tx, chapter, newChapters);
				}
			}

			// Batch Insert Chapter Drafts
			if (oldChapterDrafts.length > 0) {
				const newDrafts = [];
				for (const old of oldChapterDrafts) {
					const newChapterId = chapterIdMap.get(old.chapterId);
					const newVolumeId = volumeIdMap.get(old.volumeId);
					const newOutlineId = outlineIdMap.get(old.outlineId);
					if (newChapterId && newVolumeId && newOutlineId) {
						const { id: _id, ...data } = old;
						newDrafts.push({
							...data,
							id: crypto.randomUUID(),
							chapterId: newChapterId,
							volumeId: newVolumeId,
							outlineId: newOutlineId,
							projectId: newProject.id,
							createdAt: new Date(),
							updatedAt: new Date(),
						});
					}
				}
				if (newDrafts.length > 0) {
					await chunkedInsert(tx, chapterDraft, newDrafts);
				}
			}

			// Batch Insert Scenes (and remap prevSceneId)
			const sceneIdMap = new Map<string, string>();
			// First pass: Generate IDs and basic mapping
			const newScenesToInsert = [];
			for (const old of oldScenes) {
				const newChapterId = chapterIdMap.get(old.chapterId);
				if (newChapterId) {
					const newId = crypto.randomUUID();
					sceneIdMap.set(old.id, newId);
					const { id: _id, ...data } = old;
					newScenesToInsert.push({
						...data,
						id: newId,
						chapterId: newChapterId,
						projectId: newProject.id,
						createdAt: new Date(),
						updatedAt: new Date(),
						// We'll update prevSceneId in a second pass/logic if needed,
						// but since we have the full map, we can try to resolve it now if the map is complete?
						// Actually, we can't resolve prevSceneId until we know all IDs.
						// BUT, since we process all old scenes and generate new IDs for them,
						// we can do a lookup on sceneIdMap.
					});
				}
			}

			// Second pass: Resolve prevSceneId (in memory)
			const resolvedScenes = newScenesToInsert.map((s) => {
				const oldPrev = s.prevSceneId;
				if (oldPrev && sceneIdMap.has(oldPrev)) {
					return { ...s, prevSceneId: sceneIdMap.get(oldPrev) };
				}
				return { ...s, prevSceneId: null };
			});

			if (resolvedScenes.length > 0) {
				await chunkedInsert(tx, scene, resolvedScenes);
			}

			// Batch Insert Scene Cards
			if (oldSceneCards.length > 0) {
				const newSceneCards = [];
				for (const old of oldSceneCards) {
					const newSceneId = sceneIdMap.get(old.sceneId);
					if (newSceneId) {
						const { id: _id, ...data } = old;
						newSceneCards.push({
							...data,
							id: crypto.randomUUID(),
							sceneId: newSceneId,
							projectId: newProject.id,
							createdAt: new Date(),
							updatedAt: new Date(),
						});
					}
				}
				if (newSceneCards.length > 0) {
					await chunkedInsert(tx, sceneCard, newSceneCards);
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
