/**
 * Result Type - Standardized return type for server actions and services
 *
 * This provides a consistent pattern for handling success/error cases
 * without relying on exceptions for control flow.
 */

/**
 * A discriminated union type representing either a successful result with data,
 * or a failed result with an error.
 */
export type Result<T, E = string> =
	| { success: true; data: T }
	| { success: false; error: E };

/**
 * Create a successful result
 * @param data The success payload
 */
export function ok<T>(data: T): Result<T, never> {
	return { success: true, data };
}

/**
 * Create a failed result
 * @param error The error message or error object
 */
export function err<E = string>(error: E): Result<never, E> {
	return { success: false, error };
}

/**
 * Type guard to check if a result is successful
 */
export function isOk<T, E>(
	result: Result<T, E>,
): result is { success: true; data: T } {
	return result.success === true;
}

/**
 * Type guard to check if a result is an error
 */
export function isErr<T, E>(
	result: Result<T, E>,
): result is { success: false; error: E } {
	return result.success === false;
}

/**
 * Unwrap a result, throwing if it's an error
 * Use sparingly - prefer pattern matching with isOk/isErr
 */
export function unwrap<T, E>(result: Result<T, E>): T {
	if (result.success) {
		return result.data;
	}
	throw new Error(String(result.error));
}

/**
 * Unwrap a result with a default value for errors
 */
export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
	if (result.success) {
		return result.data;
	}
	return defaultValue;
}

/**
 * Map over a successful result
 */
export function map<T, U, E>(
	result: Result<T, E>,
	fn: (value: T) => U,
): Result<U, E> {
	if (result.success) {
		return ok(fn(result.data));
	}
	return result;
}

/**
 * Chain results together (flatMap)
 */
export function andThen<T, U, E>(
	result: Result<T, E>,
	fn: (value: T) => Result<U, E>,
): Result<U, E> {
	if (result.success) {
		return fn(result.data);
	}
	return result;
}

/**
 * Execute a function and wrap the result, catching any thrown errors
 */
export async function tryCatch<T>(
	fn: () => Promise<T>,
	errorMessage?: string,
): Promise<Result<T>> {
	try {
		const data = await fn();
		return ok(data);
	} catch (error) {
		const message =
			errorMessage ||
			(error instanceof Error ? error.message : "Unknown error");
		console.error("tryCatch error:", error);
		return err(message);
	}
}

/**
 * Synchronous version of tryCatch
 */
export function tryCatchSync<T>(fn: () => T, errorMessage?: string): Result<T> {
	try {
		const data = fn();
		return ok(data);
	} catch (error) {
		const message =
			errorMessage ||
			(error instanceof Error ? error.message : "Unknown error");
		console.error("tryCatchSync error:", error);
		return err(message);
	}
}
