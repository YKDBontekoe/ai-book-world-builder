import "server-only";
import { inArray } from "drizzle-orm";

import { type DbTransaction, db } from "@/lib/db";
import { entityCleanupRepository } from "@/lib/db/repositories/entity-cleanup-repository";
import { generationRepository } from "@/lib/db/repositories/generation-repository";
import { structureRepository } from "@/lib/db/repositories/structure-repository";
import { project } from "@/lib/db/schema";
import { projectDuplicationService } from "@/lib/services/project-duplication-service";

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

			await db.transaction(async (tx: DbTransaction) => {
				// 1. Generation related tables (Leaf first)
				await generationRepository.deleteByProjectIds(tx, ownedProjectIds);

				// 2. Structure (Scenes, Chapters, etc.)
				await structureRepository.deleteByProjectIds(tx, ownedProjectIds);

				// 3. Entities & Relationships
				await entityCleanupRepository.deleteByProjectIds(tx, ownedProjectIds);

				// 4. Project itself
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
