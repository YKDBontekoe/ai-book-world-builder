import "server-only";
import { and, desc, eq, inArray, ne, or } from "drizzle-orm";
import type { VisibilityType } from "@/components/organisms/chat/visibility-selector";
import { DEFAULT_PROJECT_FOLDERS } from "@/lib/constants";
import { db } from "@/lib/db";
import { type Project, project } from "@/lib/db/schema";
import { DatabaseError, ForbiddenError, NotFoundError } from "@/lib/errors";
import { BaseRepository, type FindOptions } from "./base-repository";

// ============================================================================
// Types
// ============================================================================

export interface CreateProjectInput {
	name: string;
	description?: string;
	visibility: VisibilityType;
	userId: string;
}

export interface UpdateProjectInput {
	name?: string;
	description?: string;
	visibility?: VisibilityType;
	lastViewedSceneId?: string;
}

export type ProjectFilter = "all" | "mine" | "shared";

// ============================================================================
// Repository Implementation
// ============================================================================

export class ProjectRepository extends BaseRepository<
	Project,
	CreateProjectInput,
	UpdateProjectInput
> {
	/**
	 * Find a project by ID (without access control)
	 */
	async findById(id: string): Promise<Project | null> {
		try {
			const [result] = await db
				.select()
				.from(project)
				.where(eq(project.id, id));
			return result ?? null;
		} catch (error) {
			console.error("ProjectRepository.findById error:", error);
			throw new DatabaseError("Failed to find project");
		}
	}

	/**
	 * Find a project by ID with access control
	 */
	async findByIdWithAccess(
		id: string,
		userId?: string,
	): Promise<Project | null> {
		try {
			const result = await this.findById(id);

			if (!result) {
				return null;
			}

			// Check access: either public or owned by user
			if (result.visibility === "private" && result.userId !== userId) {
				return null;
			}

			return result;
		} catch (error) {
			if (error instanceof DatabaseError) throw error;
			console.error("ProjectRepository.findByIdWithAccess error:", error);
			throw new DatabaseError("Failed to find project");
		}
	}

	/**
	 * Find a project and verify ownership
	 */
	async findByIdWithOwnership(id: string, userId: string): Promise<Project> {
		const result = await this.findByIdWithAccess(id, userId);

		if (!result) {
			throw NotFoundError.forResource("Project", id);
		}

		if (result.userId !== userId) {
			throw new ForbiddenError(
				"You do not have permission to modify this project",
			);
		}

		return result;
	}

	/**
	 * Find all projects (admin use only)
	 */
	async findAll(options?: FindOptions): Promise<Project[]> {
		try {
			let query = db.select().from(project);

			if (options?.orderBy === "createdAt") {
				query = query.orderBy(
					options.orderDirection === "asc"
						? project.createdAt
						: desc(project.createdAt),
				) as typeof query;
			}

			if (options?.limit) {
				query = query.limit(options.limit) as typeof query;
			}

			if (options?.offset) {
				query = query.offset(options.offset) as typeof query;
			}

			return await query;
		} catch (error) {
			console.error("ProjectRepository.findAll error:", error);
			throw new DatabaseError("Failed to list projects");
		}
	}

	/**
	 * Find projects visible to a user (owned or public)
	 */
	async findVisibleToUser(
		userId: string,
		filter: ProjectFilter = "all",
	): Promise<Project[]> {
		try {
			let whereClause:
				| ReturnType<typeof eq>
				| ReturnType<typeof and>
				| ReturnType<typeof or>
				| undefined;

			if (filter === "mine") {
				whereClause = eq(project.userId, userId);
			} else if (filter === "shared") {
				whereClause = and(
					eq(project.visibility, "public"),
					ne(project.userId, userId),
				);
			} else {
				whereClause = or(
					eq(project.userId, userId),
					eq(project.visibility, "public"),
				);
			}

			return await db
				.select()
				.from(project)
				.where(whereClause)
				.orderBy(desc(project.createdAt));
		} catch (error) {
			console.error("ProjectRepository.findVisibleToUser error:", error);
			throw new DatabaseError("Failed to list projects");
		}
	}

	/**
	 * Find projects by user ID
	 */
	async findByUserId(userId: string): Promise<Project[]> {
		try {
			return await db
				.select()
				.from(project)
				.where(eq(project.userId, userId))
				.orderBy(desc(project.createdAt));
		} catch (error) {
			console.error("ProjectRepository.findByUserId error:", error);
			throw new DatabaseError("Failed to list user projects");
		}
	}

	/**
	 * Create a new project
	 */
	async create(data: CreateProjectInput): Promise<Project> {
		try {
			const folders = DEFAULT_PROJECT_FOLDERS.map((folder) => ({ ...folder }));

			const [createdProject] = await db
				.insert(project)
				.values({
					name: data.name,
					description: data.description,
					visibility: data.visibility,
					userId: data.userId,
					createdAt: new Date(),
					folders,
				})
				.returning();

			return createdProject;
		} catch (error) {
			console.error("ProjectRepository.create error:", error);
			throw new DatabaseError("Failed to create project");
		}
	}

	/**
	 * Update an existing project
	 */
	async update(id: string, data: UpdateProjectInput): Promise<Project> {
		try {
			const [updatedProject] = await db
				.update(project)
				.set(data)
				.where(eq(project.id, id))
				.returning();

			if (!updatedProject) {
				throw NotFoundError.forResource("Project", id);
			}

			return updatedProject;
		} catch (error) {
			if (error instanceof NotFoundError) throw error;
			console.error("ProjectRepository.update error:", error);
			throw new DatabaseError("Failed to update project");
		}
	}

	/**
	 * Delete a project by ID
	 */
	async delete(id: string): Promise<void> {
		try {
			await db.delete(project).where(eq(project.id, id));
		} catch (error) {
			console.error("ProjectRepository.delete error:", error);
			throw new DatabaseError("Failed to delete project");
		}
	}

	/**
	 * Delete multiple projects by IDs
	 */
	async deleteMany(ids: string[]): Promise<void> {
		if (ids.length === 0) return;

		try {
			await db.delete(project).where(inArray(project.id, ids));
		} catch (error) {
			console.error("ProjectRepository.deleteMany error:", error);
			throw new DatabaseError("Failed to delete projects");
		}
	}

	/**
	 * Fork a project (creates a new project based on an existing one)
	 */
	async fork(
		originalId: string,
		userId: string,
		newName?: string,
	): Promise<Project> {
		const original = await this.findByIdWithAccess(originalId, userId);

		if (!original) {
			throw NotFoundError.forResource("Project", originalId);
		}

		try {
			const folders = original.folders
				? [...original.folders]
				: DEFAULT_PROJECT_FOLDERS.map((f) => ({ ...f }));

			const [forkedProject] = await db
				.insert(project)
				.values({
					name: newName || `Fork of ${original.name}`,
					description: original.description,
					visibility: "private",
					userId,
					createdAt: new Date(),
					folders,
					forkedFromId: originalId,
				})
				.returning();

			return forkedProject;
		} catch (error) {
			console.error("ProjectRepository.fork error:", error);
			throw new DatabaseError("Failed to fork project");
		}
	}

	/**
	 * Get projects by multiple IDs
	 */
	async findByIds(ids: string[]): Promise<Project[]> {
		if (ids.length === 0) return [];

		try {
			return await db.select().from(project).where(inArray(project.id, ids));
		} catch (error) {
			console.error("ProjectRepository.findByIds error:", error);
			throw new DatabaseError("Failed to find projects");
		}
	}

	/**
	 * Get projects owned by user from a list of IDs
	 */
	async findOwnedByUser(ids: string[], userId: string): Promise<Project[]> {
		if (ids.length === 0) return [];

		try {
			return await db
				.select()
				.from(project)
				.where(and(inArray(project.id, ids), eq(project.userId, userId)));
		} catch (error) {
			console.error("ProjectRepository.findOwnedByUser error:", error);
			throw new DatabaseError("Failed to find owned projects");
		}
	}
}

// Export singleton instance
export const projectRepository = new ProjectRepository();
