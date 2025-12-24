import "server-only";
import { auth } from "@/app/(auth)/auth";
import { projectRepository } from "@/lib/db/repositories/project-repository";
import type { Project } from "@/lib/db/schema";
import {
	ForbiddenError,
	getErrorMessage,
	isAppError,
	NotFoundError,
	UnauthorizedError,
} from "@/lib/errors";
import { err, ok, type Result } from "@/lib/result";

// ============================================================================
// Types
// ============================================================================

export interface AuthenticatedUser {
	id: string;
	email?: string;
	type?: string;
}

export interface ProjectContext {
	project: Project;
	user: AuthenticatedUser;
}

// ============================================================================
// Base Service Class
// ============================================================================

/**
 * Base service class providing common patterns for authentication,
 * authorization, and error handling.
 *
 * All business logic services should extend this class.
 */
export abstract class BaseService {
	/**
	 * Get the current authenticated user
	 * @throws UnauthorizedError if not authenticated
	 */
	protected async getAuthenticatedUser(): Promise<AuthenticatedUser> {
		const session = await auth();
		if (!session?.user?.id) {
			throw new UnauthorizedError();
		}
		return {
			id: session.user.id,
			email: session.user.email ?? undefined,
			type: (session.user as { type?: string }).type,
		};
	}

	/**
	 * Execute a callback with authenticated user context
	 * Returns a Result type for safe error handling
	 */
	protected async withAuth<T>(
		callback: (user: AuthenticatedUser) => Promise<T>,
	): Promise<Result<T>> {
		try {
			const user = await this.getAuthenticatedUser();
			const data = await callback(user);
			return ok(data);
		} catch (error) {
			console.error("Service error:", error);
			return err(getErrorMessage(error));
		}
	}

	/**
	 * Execute a callback with project access verification
	 * @param projectId - The project to access
	 * @param requireOwner - If true, requires the user to be the project owner
	 * @param callback - The function to execute with project context
	 */
	protected async withProjectAccess<T>(
		projectId: string,
		requireOwner: boolean,
		callback: (context: ProjectContext) => Promise<T>,
	): Promise<Result<T>> {
		try {
			const user = await this.getAuthenticatedUser();

			const project = await projectRepository.findByIdWithAccess(
				projectId,
				user.id,
			);
			if (!project) {
				throw NotFoundError.forResource("Project", projectId);
			}

			if (requireOwner && project.userId !== user.id) {
				throw new ForbiddenError("Owner access required for this operation");
			}

			const data = await callback({ project, user });
			return ok(data);
		} catch (error) {
			if (isAppError(error)) {
				return err(error.message);
			}
			console.error("Service error:", error);
			return err(getErrorMessage(error));
		}
	}

	/**
	 * Execute a callback with project read access (read-only)
	 */
	protected async withProjectReadAccess<T>(
		projectId: string,
		callback: (context: ProjectContext) => Promise<T>,
	): Promise<Result<T>> {
		return this.withProjectAccess(projectId, false, callback);
	}

	/**
	 * Execute a callback with project write access (requires ownership)
	 */
	protected async withProjectWriteAccess<T>(
		projectId: string,
		callback: (context: ProjectContext) => Promise<T>,
	): Promise<Result<T>> {
		return this.withProjectAccess(projectId, true, callback);
	}

	/**
	 * Wrap an async operation in try/catch and return Result
	 */
	protected async safeExecute<T>(
		operation: () => Promise<T>,
		errorMessage?: string,
	): Promise<Result<T>> {
		try {
			const data = await operation();
			return ok(data);
		} catch (error) {
			console.error("Service error:", error);
			return err(errorMessage || getErrorMessage(error));
		}
	}
}

// ============================================================================
// Utility function for standalone use
// ============================================================================

/**
 * Ensure project access for use outside of a service class
 * @deprecated Prefer using BaseService.withProjectAccess for new code
 */
export async function ensureProjectAccess(
	projectId: string,
	requireOwner = false,
): Promise<ProjectContext> {
	const session = await auth();
	if (!session?.user?.id) {
		throw new UnauthorizedError();
	}

	const user: AuthenticatedUser = {
		id: session.user.id,
		email: session.user.email ?? undefined,
		type: (session.user as { type?: string }).type,
	};

	const project = await projectRepository.findByIdWithAccess(
		projectId,
		user.id,
	);
	if (!project) {
		throw NotFoundError.forResource("Project", projectId);
	}

	if (requireOwner && project.userId !== user.id) {
		throw new ForbiddenError("Owner access required for this operation");
	}

	return { project, user };
}
