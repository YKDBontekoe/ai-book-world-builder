/**
 * Action Utilities
 *
 * Helper functions for server actions including authentication,
 * authorization, and error handling.
 */

import { auth } from "@/app/(auth)/auth";
import { projectRepository } from "@/lib/db/repositories/project-repository";
import type { Project } from "@/lib/db/schema";
import {
	type AppError,
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

// Standard action result types for consistency
export type ActionResult<T> = Result<T, string>;
export type ActionError = { error: string };

// ============================================================================
// Authentication Helpers
// ============================================================================

/**
 * Get the current authenticated user
 * @throws UnauthorizedError if not authenticated
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser> {
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
 * Verify authentication and return Result
 */
export async function requireAuth(): Promise<Result<AuthenticatedUser>> {
	try {
		const user = await getAuthenticatedUser();
		return ok(user);
	} catch {
		return err("You must be logged in to perform this action");
	}
}

// ============================================================================
// Project Access Helpers
// ============================================================================

/**
 * Ensure project access - throws on failure
 *
 * @param projectId - The project to access
 * @param requireOwner - If true, requires the user to be the project owner
 * @throws UnauthorizedError if not authenticated
 * @throws NotFoundError if project not found or not accessible
 * @throws ForbiddenError if owner access required but not owner
 *
 * @deprecated For new code, prefer using withProjectAccess for Result-based handling
 */
export async function ensureProjectAccess(
	projectId: string,
	requireOwner = false,
): Promise<ProjectContext> {
	const user = await getAuthenticatedUser();

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

/**
 * Execute a callback with project access - returns Result
 */
export async function withProjectAccess<T>(
	projectId: string,
	requireOwner: boolean,
	callback: (context: ProjectContext) => Promise<T>,
): Promise<Result<T>> {
	try {
		const context = await ensureProjectAccess(projectId, requireOwner);
		const data = await callback(context);
		return ok(data);
	} catch (error) {
		console.error("Action error:", error);
		return err(getErrorMessage(error));
	}
}

/**
 * Execute a callback with project read access
 */
export async function withProjectReadAccess<T>(
	projectId: string,
	callback: (context: ProjectContext) => Promise<T>,
): Promise<Result<T>> {
	return withProjectAccess(projectId, false, callback);
}

/**
 * Execute a callback with project write access (requires ownership)
 */
export async function withProjectWriteAccess<T>(
	projectId: string,
	callback: (context: ProjectContext) => Promise<T>,
): Promise<Result<T>> {
	return withProjectAccess(projectId, true, callback);
}

// ============================================================================
// Error Handling Helpers
// ============================================================================

/**
 * Wrap an async operation and return a standardized Result
 * Use this in server actions for consistent error handling
 */
export async function withErrorHandling<T>(
	operation: () => Promise<T>,
	errorMessage?: string,
): Promise<Result<T>> {
	try {
		const data = await operation();
		return ok(data);
	} catch (error) {
		console.error("Action error:", error);

		if (isAppError(error)) {
			return err(error.message);
		}

		return err(errorMessage || getErrorMessage(error));
	}
}

/**
 * Convert an AppError to a standard action error response
 */
export function toActionError(error: AppError | Error | unknown): ActionError {
	if (isAppError(error)) {
		return { error: error.message };
	}
	if (error instanceof Error) {
		return { error: error.message };
	}
	return { error: "An unexpected error occurred" };
}

// ============================================================================
// Validation Integration
// ============================================================================

/**
 * Re-export validation helpers for convenience
 */
export { validateInput, validateOrThrow } from "@/lib/validation";
