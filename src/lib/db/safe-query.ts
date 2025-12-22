import { ChatSDKError, type ErrorCode } from "@/lib/errors";

/**
 * Executes a database query safely, handling errors uniformly.
 *
 * - Rethrows `ChatSDKError` instances as-is.
 * - Logs unknown errors to console.error.
 * - Wraps unknown errors in a new `ChatSDKError` with the provided message and code.
 */
export async function safeQuery<T>(
	queryFn: () => Promise<T>,
	{
		errorMessage,
		errorCode = "bad_request:database",
	}: {
		errorMessage: string;
		errorCode?: ErrorCode;
	},
): Promise<T> {
	try {
		return await queryFn();
	} catch (error) {
		// If it's already a known error, rethrow it to preserve specific error codes/messages
		if (error instanceof ChatSDKError) {
			throw error;
		}

		// Log the underlying error for debugging (crucial for "database" surface which defaults to 'log')
		console.error(`[safeQuery] ${errorMessage}`, error);

		// Throw a sanitized error
		throw new ChatSDKError(errorCode, errorMessage);
	}
}
