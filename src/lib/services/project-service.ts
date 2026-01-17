import "server-only";
import { inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import type { DbTransaction } from "@/lib/db/drizzle";
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
import { projectDuplicationService } from "@/lib/services/project-duplication-service";

export class ProjectService {
	async deleteProjects(
		projectIds: string[],
		userId: string,
	): Promise<
		{ success: true; deletedProjectIds: string[] } | { error: string }
	> {
		if (projectIds.length === 0) {
			return { success: true, deletedProjectIds: [] };
		}

		if (projectIds.length > 50) {
			return { error: "Cannot delete more than 50 projects at once." };
		}

		try {
			// Verify ownership for all projects
			const projects = (await db
				.select({ id: project.id, userId: project.userId })
				.from(project)
				.where(inArray(project.id, projectIds))) as Array<{
				id: string;
				userId: string;
			}>;

			const ownedProjectIds = projects
				.filter((record) => record.userId === userId)
				.map((record) => record.id);

			if (ownedProjectIds.length === 0) {
				return { error: "No valid projects to delete" };
			}

			await db.transaction(async (tx: DbTransaction) => {
				// 1. Generation related tables (Leaf first)
				await this.deleteGenerationData(tx, ownedProjectIds);

				// 2. Book Exports
				await tx
					.delete(bookExport)
					.where(inArray(bookExport.projectId, ownedProjectIds));

				// 3. Structure (Scenes, Chapters, etc.)
				await this.deleteStructureData(tx, ownedProjectIds);

				// 4. Entities & Relationships
				await this.deleteEntityData(tx, ownedProjectIds);

				// 5. Project itself
				await tx.delete(project).where(inArray(project.id, ownedProjectIds));
			});

			return { success: true, deletedProjectIds: ownedProjectIds };
		} catch (error) {
			console.error("Delete projects error:", error);
			return { error: "Failed to delete projects" };
		}
	}

	private async deleteGenerationData(tx: DbTransaction, projectIds: string[]) {
		type GenerationIdRow = { id: string | null };
		const generations = (await tx
			.select()
			.from(bookGeneration)
			.where(
				inArray(bookGeneration.projectId, projectIds),
			)) as GenerationIdRow[];

		const generationIds = generations
			.map((generation) => generation.id)
			.filter((id): id is string => typeof id === "string");

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
			.where(inArray(bookGeneration.projectId, projectIds));
	}

	private async deleteStructureData(tx: DbTransaction, projectIds: string[]) {
		await tx.delete(sceneCard).where(inArray(sceneCard.projectId, projectIds));
		await tx.delete(scene).where(inArray(scene.projectId, projectIds));
		await tx
			.delete(chapterDraft)
			.where(inArray(chapterDraft.projectId, projectIds));
		await tx.delete(chapter).where(inArray(chapter.projectId, projectIds));
		await tx.delete(volume).where(inArray(volume.projectId, projectIds));
		await tx.delete(outline).where(inArray(outline.projectId, projectIds));
	}

	private async deleteEntityData(tx: DbTransaction, projectIds: string[]) {
		await tx
			.delete(relationship)
			.where(inArray(relationship.projectId, projectIds));
		await tx
			.delete(entityAttribute)
			.where(inArray(entityAttribute.projectId, projectIds));
		await tx.delete(entity).where(inArray(entity.projectId, projectIds));
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
