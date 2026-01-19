import "server-only";
import { inArray } from "drizzle-orm";

import { db } from "@/lib/db";
import {
	entityRepository,
	generationRepository,
	storyRepository,
} from "@/lib/db/repositories";
import { bookExport, project } from "@/lib/db/schema";
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
				.filter((p) => p.userId === userId)
				.map((p) => p.id);

			if (ownedProjectIds.length === 0) {
				return { error: "No valid projects to delete" };
			}

			await db.transaction(async (tx: any) => {
				// 1. Generation related tables (Leaf first)
				await generationRepository.deleteByProjectIds(ownedProjectIds, tx);

				// 2. Book Exports
				await tx
					.delete(bookExport)
					.where(inArray(bookExport.projectId, ownedProjectIds));

				// 3. Structure (Scenes, Chapters, etc.)
				await storyRepository.deleteByProjectIds(ownedProjectIds, tx);

				// 4. Entities & Relationships
				await entityRepository.deleteByProjectIds(ownedProjectIds, tx);

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
