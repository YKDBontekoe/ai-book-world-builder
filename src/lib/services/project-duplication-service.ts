import "server-only";
import { eq, type InferSelectModel } from "drizzle-orm";

import { type DbTransaction, db } from "@/lib/db";
import { projectRepository } from "@/lib/db/repositories";
import { entity, project, scene } from "@/lib/db/schema";
import { EntityDuplicator } from "./duplication/entity-duplicator";
import { SceneDuplicator } from "./duplication/scene-duplicator";
import { StructureDuplicator } from "./duplication/structure-duplicator";

type ProjectRow = InferSelectModel<typeof project>;

/**
 * Service to handle the complex logic of deep-cloning an entire project.
 *
 * This service is responsible for:
 * 1. Cloning the Project record itself.
 * 2. Cloning all Entities, Attributes, and Relationships.
 * 3. Cloning the Book Structure (Outlines, Volumes, Chapters).
 * 4. Cloning Scenes and their Metadata (Cards).
 *
 * ## ID Mapping Strategy
 * To maintain referential integrity (foreign keys) in the new project, we:
 * 1. Generate new UUIDs for every record.
 * 2. Maintain `Map<OldID, NewID>` for each entity type (Entity, Chapter, etc.).
 * 3. When inserting dependent records (e.g., a Scene belonging to a Chapter),
 *    we look up the new Chapter ID in the map using the old Chapter ID.
 */
export class ProjectDuplicationService {
	/**
	 * Creates a complete fork of a project.
	 *
	 * Uses a transaction to ensure all-or-nothing execution. If any part of the
	 * cloning process fails, the database is rolled back to prevent partial states.
	 *
	 * @param originalProjectId - The source project ID.
	 * @param userId - The user who will own the new project.
	 * @param newName - Optional name for the new project.
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

				// ID Maps
				const entityIdMap = new Map<string, string>();
				const outlineIdMap = new Map<string, string>();
				const volumeIdMap = new Map<string, string>();
				const chapterIdMap = new Map<string, string>();
				const sceneIdMap = new Map<string, string>();

				// 2. Clone Entities & Relations
				const entityDuplicator = new EntityDuplicator(tx);
				await entityDuplicator.cloneEntities(
					originalProjectId,
					newProject.id,
					entityIdMap,
				);
				await entityDuplicator.cloneAttributes(
					originalProjectId,
					newProject.id,
					entityIdMap,
				);
				await entityDuplicator.cloneRelationships(
					originalProjectId,
					newProject.id,
					entityIdMap,
				);

				// 3. Clone Structure
				const structureDuplicator = new StructureDuplicator(tx);
				await structureDuplicator.cloneOutlines(
					originalProjectId,
					newProject.id,
					outlineIdMap,
				);
				await structureDuplicator.cloneVolumes(
					originalProjectId,
					newProject.id,
					outlineIdMap,
					volumeIdMap,
				);
				await structureDuplicator.cloneChapters(
					originalProjectId,
					newProject.id,
					volumeIdMap,
					outlineIdMap,
					chapterIdMap,
				);
				await structureDuplicator.cloneChapterDrafts(
					originalProjectId,
					newProject.id,
					chapterIdMap,
					volumeIdMap,
					outlineIdMap,
				);

				// 4. Clone Scenes
				const sceneDuplicator = new SceneDuplicator(tx);
				await sceneDuplicator.cloneScenes(
					originalProjectId,
					newProject.id,
					chapterIdMap,
					sceneIdMap,
				);
				await sceneDuplicator.cloneSceneCards(
					originalProjectId,
					newProject.id,
					sceneIdMap,
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
