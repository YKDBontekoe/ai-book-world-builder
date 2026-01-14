import "server-only";
import { inArray } from "drizzle-orm";

import { db } from "@/lib/db";
import { projectDuplicationService } from "@/lib/services/project-duplication-service";
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

export class ProjectService {
	async deleteProjects(projectIds: string[], userId: string) {
		if (projectIds.length === 0) {
			return { success: true };
		}

		if (projectIds.length > 50) {
			return { error: "Cannot delete more than 50 projects at once." };
		}

		try {
			// Verify ownership for all projects
			const projects = await db
				.select({ id: project.id, userId: project.userId })
				.from(project)
				.where(inArray(project.id, projectIds));

			const ownedProjectIds = projects
				.filter((p: any) => p.userId === userId)
				.map((p: any) => p.id);

			if (ownedProjectIds.length === 0) {
				return { error: "No valid projects to delete" };
			}

			await db.transaction(async (tx: any) => {
				// 1. Generation related tables (Leaf first)
				const generations = await tx
					.select({ id: bookGeneration.id })
					.from(bookGeneration)
					.where(inArray(bookGeneration.projectId, ownedProjectIds));

				const generationIds = (generations as any[]).map((g: any) => g.id);

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
				await tx
					.delete(volume)
					.where(inArray(volume.projectId, ownedProjectIds));
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
				await tx
					.delete(entity)
					.where(inArray(entity.projectId, ownedProjectIds));

				// 5. Project itself
				await tx.delete(project).where(inArray(project.id, ownedProjectIds));
			});

			return { success: true };
		} catch (error) {
			console.error("Delete projects error:", error);
			return { error: "Failed to delete projects" };
		}
	}

	async forkProject(
		originalProjectId: string,
		userId: string,
		newName?: string,
	) {
		return projectDuplicationService.forkProject(
			originalProjectId,
			userId,
			newName,
		);
	}
}

export const projectService = new ProjectService();
