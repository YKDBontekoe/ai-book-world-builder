/**
 * Server Action Middleware
 *
 * A composable middleware system for Next.js Server Actions.
 * Provides authentication, authorization, validation, and error handling
 * in a declarative, reusable way.
 *
 * @example
 * // Simple usage with auth requirement
 * export const myAction = createAction({
 *   auth: "user",
 *   handler: async ({ user }) => {
 *     return { message: "Hello, " + user.email };
 *   },
 * });
 *
 * @example
 * // With validation
 * export const createItem = createAction({
 *   auth: "admin",
 *   input: z.object({ name: z.string() }),
 *   handler: async ({ user, input }) => {
 *     return await createItemInDb(input.name, user.id);
 *   },
 * });
 */

import type { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import type { UserRole } from "@/lib/db/schema/auth";
import {
	ForbiddenError,
	getErrorMessage,
	isAppError,
	RateLimitError,
	UnauthorizedError,
	ValidationError,
} from "@/lib/errors";
import { redis } from "@/lib/redis";
import { err, ok, type Result } from "@/lib/result";

// ============================================================================
// Types
// ============================================================================

/**
 * Authenticated user context passed to action handlers
 */
export interface ActionUser {
	id: string;
	email?: string;
	role?: UserRole;
}

/**
 * Authentication level requirements
 * - "none": No authentication required
 * - "user": Any authenticated user
 * - "admin": Admin role required
 */
export type AuthLevel = "none" | "user" | "admin";

/**
 * Context passed to action handlers
 */
export interface ActionContext<TInput = unknown> {
	user: ActionUser;
	input: TInput;
}

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
	/** Maximum number of requests allowed */
	limit: number;
	/** Time window in seconds */
	duration: number;
}

/**
 * Configuration for creating an action
 */
export interface ActionConfig<TInput, TOutput> {
	/** Authentication level required. Defaults to "user" */
	auth?: AuthLevel;
	/** Zod schema for input validation */
	input?: z.ZodSchema<TInput>;
	/** Rate limiting configuration */
	rateLimit?: RateLimitConfig;
	/** Action name, required if rateLimit is used to namespace the key */
	actionName?: string;
	/** The action handler function */
	handler: (context: ActionContext<TInput>) => Promise<TOutput>;
}

/**
 * Configuration for actions that don't require authentication
 */
export interface PublicActionConfig<TInput, TOutput> {
	auth: "none";
	input?: z.ZodSchema<TInput>;
	/** Rate limiting configuration */
	rateLimit?: RateLimitConfig;
	/** Action name, required if rateLimit is used to namespace the key */
	actionName?: string;
	handler: (context: { input: TInput }) => Promise<TOutput>;
}

// ============================================================================
// Core Middleware Implementation
// ============================================================================

/**
 * Get the current authenticated user from the session
 */
async function getUser(): Promise<ActionUser | null> {
	const session = await auth();
	if (!session?.user?.id) {
		return null;
	}
	return {
		id: session.user.id,
		email: session.user.email ?? undefined,
		role: session.user.role,
	};
}

/**
 * Verify user meets authentication requirements
 */
function verifyAuth(user: ActionUser | null, level: AuthLevel): ActionUser {
	if (level === "none") {
		// Return a placeholder user for public actions
		return user ?? { id: "anonymous" };
	}

	if (!user) {
		throw new UnauthorizedError("You must be logged in to perform this action");
	}

	if (level === "admin" && user.role !== "admin") {
		throw new ForbiddenError("Admin access required");
	}

	return user;
}

/**
 * Validate input against a Zod schema
 */
function validateInput<T>(
	schema: z.ZodSchema<T> | undefined,
	input: unknown,
): T {
	if (!schema) {
		return input as T;
	}

	const result = schema.safeParse(input);
	if (!result.success) {
		throw ValidationError.fromZodError(result.error);
	}

	return result.data;
}

/**
 * Check rate limit for the user/action
 */
async function checkRateLimit(
	actionName: string,
	userId: string,
	limit: number,
	duration: number,
) {
	if (!redis) {
		// If Redis is not available, we can't enforce rate limits globally.
		// For now, we fail open (allow request) but log a warning in dev?
		// Since cache also fails open, we follow that pattern.
		return;
	}

	const key = `rate-limit:${actionName}:${userId}`;

	try {
		const current = await redis.incr(key);

		// If this is the first request (or key expired), set expiration
		if (current === 1) {
			await redis.expire(key, duration);
		}

		if (current > limit) {
			const ttl = await redis.ttl(key);
			throw new RateLimitError(undefined, ttl > 0 ? ttl : undefined);
		}
	} catch (error) {
		if (error instanceof RateLimitError) {
			throw error;
		}
		// Log redis errors but don't block the action
		console.error(`Rate limit check failed for ${key}:`, error);
	}
}

/**
 * Create a server action with middleware
 *
 * @example
 * export const getItems = createAction({
 *   auth: "user",
 *   handler: async ({ user }) => {
 *     return await db.items.findMany({ where: { userId: user.id } });
 *   },
 * });
 *
 * @example
 * export const createItem = createAction({
 *   auth: "admin",
 *   input: z.object({ name: z.string().min(1) }),
 *   handler: async ({ user, input }) => {
 *     return await db.items.create({ data: { name: input.name } });
 *   },
 * });
 */
export function createAction<TInput, TOutput>(
	config: ActionConfig<TInput, TOutput>,
): (input?: TInput) => Promise<Result<TOutput>>;

export function createAction<TInput, TOutput>(
	config: PublicActionConfig<TInput, TOutput>,
): (input?: TInput) => Promise<Result<TOutput>>;

export function createAction<TInput, TOutput>(
	config: ActionConfig<TInput, TOutput> | PublicActionConfig<TInput, TOutput>,
): (input?: TInput) => Promise<Result<TOutput>> {
	const authLevel = config.auth ?? "user";

	return async (input?: TInput): Promise<Result<TOutput>> => {
		try {
			// Step 1: Authentication
			const rawUser = await getUser();
			const user = verifyAuth(rawUser, authLevel);

			// Step 2: Rate Limiting
			if (config.rateLimit) {
				if (!config.actionName) {
					// Logic error during development
					throw new Error(
						"actionName is required when rateLimit is configured",
					);
				}
				await checkRateLimit(
					config.actionName,
					user.id,
					config.rateLimit.limit,
					config.rateLimit.duration,
				);
			}

			// Step 3: Validation
			const validatedInput = validateInput(config.input, input);

			// Step 4: Execute handler
			const result = await config.handler({
				user,
				input: validatedInput,
			} as ActionContext<TInput>);

			return ok(result);
		} catch (error) {
			console.error("Action error:", error);

			if (isAppError(error)) {
				return err(error.message);
			}

			return err(getErrorMessage(error));
		}
	};
}

// ============================================================================
// Convenience Factories
// ============================================================================

/**
 * Create a public action (no authentication required)
 */
export function createPublicAction<TInput, TOutput>(
	config: Omit<PublicActionConfig<TInput, TOutput>, "auth">,
): (input?: TInput) => Promise<Result<TOutput>> {
	return createAction({ ...config, auth: "none" });
}

/**
 * Create a user-authenticated action
 */
export function createUserAction<TInput, TOutput>(
	config: Omit<ActionConfig<TInput, TOutput>, "auth">,
): (input?: TInput) => Promise<Result<TOutput>> {
	return createAction({ ...config, auth: "user" });
}

/**
 * Create an admin-only action
 */
export function createAdminAction<TInput, TOutput>(
	config: Omit<ActionConfig<TInput, TOutput>, "auth">,
): (input?: TInput) => Promise<Result<TOutput>> {
	return createAction({ ...config, auth: "admin" });
}

// ============================================================================
// Composable Middleware Helpers
// ============================================================================

/**
 * Middleware function type
 */
export type Middleware<TContext, TNextContext> = (
	context: TContext,
	next: (context: TNextContext) => Promise<unknown>,
) => Promise<unknown>;

/**
 * Compose multiple middlewares into a single function
 *
 * @example
 * const withLogging: Middleware = async (ctx, next) => {
 *   console.log("Before");
 *   const result = await next(ctx);
 *   console.log("After");
 *   return result;
 * };
 */
export function compose<T>(
	...middlewares: Array<(ctx: T, next: () => Promise<T>) => Promise<T>>
) {
	return (context: T, handler: (ctx: T) => Promise<T>): Promise<T> => {
		let index = -1;

		const dispatch = (i: number, ctx: T): Promise<T> => {
			if (i <= index) {
				return Promise.reject(new Error("next() called multiple times"));
			}
			index = i;

			const middleware = middlewares[i];
			if (!middleware) {
				return handler(ctx);
			}

			return middleware(ctx, () => dispatch(i + 1, ctx));
		};

		return dispatch(0, context);
	};
}
