import "server-only";
import { eq, type InferSelectModel } from "drizzle-orm";

import { type DbTransaction, db } from "@/lib/db";
import {
	entityRepository,
	projectRepository,
	storyRepository,
} from "@/lib/db/repositories";
import { entity, project, scene } from "@/lib/db/schema";

// Type definitions for table rows
type ProjectRow = InferSelectModel<typeof project>;

/**
 * Service to handle the complex logic of deep-cloning an entire project.
 */
export class ProjectDuplicationService {
	/**
	 * Creates a complete fork of a project.
	 */
	async forkProject(
		originalProjectId: string,
		userId: string,
		newName?: string,
	): Promise<{ success: boolean; projectId?: string; error?: string }> {
		// 1. Pre-flight check for project size
		const [entityCount, sceneCount] = await Promise.all([
			db.$count(entity, eq(entity.projectId, originalProjectId)),
			db.$count(scene, eq(scene.projectId, originalProjectId)),
		]);

		if (entityCount + sceneCount > 2000) {
			return {
				success: false,
				error:
					"Project is too large to fork instantly. Please export and import instead.",
			};
		}

		const originalProject = await projectRepository.findByIdWithAccess(
			originalProjectId,
			userId,
		);

		if (!originalProject) {
			return { success: false, error: "Project not found or access denied" };
		}

		const rawName = newName || `Fork of ${originalProject.name}`;
		const finalName = rawName.slice(0, 100);

		try {
			const result = await db.transaction(async (tx: DbTransaction) => {
				// 1. Create New Project
				const newProject = await this.cloneProjectRecord(
					tx,
					originalProject,
					finalName,
					userId,
					originalProjectId,
				);

				// 2. Clone Entities & Relations
				await entityRepository.duplicateForProject(
					originalProjectId,
					newProject.id,
					tx,
				);

				// 3. Clone Structure (Outlines, Volumes, Chapters, Scenes, Cards)
				await storyRepository.duplicateStructureForProject(
					originalProjectId,
					newProject.id,
					tx,
				);

				return { success: true, projectId: newProject.id };
			});

			return result;
		} catch (error) {
			console.error("Fork project error:", error);
			return { success: false, error: "Failed to fork project" };
		}
	}

	private async cloneProjectRecord(
		tx: DbTransaction,
		originalProject: ProjectRow,
		name: string,
		userId: string,
		forkedFromId: string,
	) {
		const [newProject] = await tx
			.insert(project)
			.values({
				name,
				description: originalProject.description,
				visibility: "private",
				userId,
				folders: originalProject.folders,
				forkedFromId,
				createdAt: new Date(),
			})
			.returning();
		return newProject;
	}
}

export const projectDuplicationService = new ProjectDuplicationService();
