export type ErrorType =
	| "bad_request"
	| "unauthorized"
	| "forbidden"
	| "not_found"
	| "rate_limit"
	| "offline";

export type Surface =
	| "chat"
	| "auth"
	| "api"
	| "stream"
	| "database"
	| "history"
	| "vote"
	| "document"
	| "suggestions"
	| "activate_gateway";

export type ErrorCode = `${ErrorType}:${Surface}`;

export type ErrorVisibility = "response" | "log" | "none";

export const visibilityBySurface: Record<Surface, ErrorVisibility> = {
	database: "log",
	chat: "response",
	auth: "response",
	stream: "response",
	api: "response",
	history: "response",
	vote: "response",
	document: "response",
	suggestions: "response",
	activate_gateway: "response",
};

export class ChatSDKError extends Error {
	type: ErrorType;
	surface: Surface;
	statusCode: number;

	constructor(errorCode: ErrorCode, cause?: string) {
		super();

		const [type, surface] = errorCode.split(":");

		this.type = type as ErrorType;
		this.cause = cause;
		this.surface = surface as Surface;
		this.message = cause ?? getMessageByErrorCode(errorCode);
		this.statusCode = getStatusCodeByType(this.type);
	}

	toResponse() {
		const code: ErrorCode = `${this.type}:${this.surface}`;
		const visibility = visibilityBySurface[this.surface];

		const { message, cause, statusCode } = this;

		if (visibility === "log") {
			console.error({
				code,
				message,
				cause,
			});

			return Response.json(
				{ code: "", message: "Something went wrong. Please try again later." },
				{ status: statusCode },
			);
		}

		return Response.json({ code, message, cause }, { status: statusCode });
	}
}

export function getMessageByErrorCode(errorCode: ErrorCode): string {
	if (errorCode.includes("database")) {
		return "An error occurred while executing a database query.";
	}

	switch (errorCode) {
		case "bad_request:api":
			return "The request couldn't be processed. Please check your input and try again.";

		case "bad_request:activate_gateway":
			return "AI Gateway requires a valid credit card on file to service requests. Please visit https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai%3Fmodal%3Dadd-credit-card to add a card and unlock your free credits.";

		case "unauthorized:auth":
			return "You need to sign in before continuing.";
		case "forbidden:auth":
			return "Your account does not have access to this feature.";

		case "rate_limit:chat":
			return "You have exceeded your maximum number of messages for the day. Please try again later.";
		case "not_found:chat":
			return "The requested chat was not found. Please check the chat ID and try again.";
		case "forbidden:chat":
			return "This chat belongs to another user. Please check the chat ID and try again.";
		case "unauthorized:chat":
			return "You need to sign in to view this chat. Please sign in and try again.";
		case "offline:chat":
			return "We're having trouble sending your message. Please check your internet connection and try again.";

		case "not_found:document":
			return "The requested document was not found. Please check the document ID and try again.";
		case "forbidden:document":
			return "This document belongs to another user. Please check the document ID and try again.";
		case "unauthorized:document":
			return "You need to sign in to view this document. Please sign in and try again.";
		case "bad_request:document":
			return "The request to create or update the document was invalid. Please check your input and try again.";

		default:
			return "Something went wrong. Please try again later.";
	}
}

function getStatusCodeByType(type: ErrorType) {
	switch (type) {
		case "bad_request":
			return 400;
		case "unauthorized":
			return 401;
		case "forbidden":
			return 403;
		case "not_found":
			return 404;
		case "rate_limit":
			return 429;
		case "offline":
			return 503;
		default:
			return 500;
	}
}

// ============================================================================
// Application-Specific Error Classes
// ============================================================================

/**
 * Base class for application errors with HTTP status code support
 */
export abstract class AppError extends Error {
	abstract readonly statusCode: number;
	abstract readonly code: string;

	constructor(message: string) {
		super(message);
		this.name = this.constructor.name;
		Error.captureStackTrace?.(this, this.constructor);
	}

	toJSON() {
		return {
			code: this.code,
			message: this.message,
			statusCode: this.statusCode,
		};
	}
}

/**
 * Error thrown when user is not authenticated
 */
export class UnauthorizedError extends AppError {
	readonly statusCode = 401;
	readonly code = "UNAUTHORIZED";

	constructor(message = "You must be logged in to perform this action") {
		super(message);
	}
}

/**
 * Error thrown when user lacks permission for an action
 */
export class ForbiddenError extends AppError {
	readonly statusCode = 403;
	readonly code = "FORBIDDEN";

	constructor(message = "You do not have permission to perform this action") {
		super(message);
	}
}

/**
 * Error thrown when a requested resource is not found
 */
export class NotFoundError extends AppError {
	readonly statusCode = 404;
	readonly code = "NOT_FOUND";

	readonly resourceType?: string;
	readonly resourceId?: string;

	constructor(message: string, resourceType?: string, resourceId?: string) {
		super(message);
		this.resourceType = resourceType;
		this.resourceId = resourceId;
	}

	static forResource(type: string, id: string) {
		return new NotFoundError(`${type} not found: ${id}`, type, id);
	}
}

/**
 * Error thrown when input validation fails
 */
export class ValidationError extends AppError {
	readonly statusCode = 400;
	readonly code = "VALIDATION_ERROR";

	readonly field?: string;
	readonly details?: Record<string, string[]>;

	constructor(
		message: string,
		field?: string,
		details?: Record<string, string[]>,
	) {
		super(message);
		this.field = field;
		this.details = details;
	}

	static forField(field: string, message: string) {
		return new ValidationError(message, field);
	}

	static fromZodError(zodError: {
		errors: Array<{ path: (string | number)[]; message: string }>;
	}) {
		const details: Record<string, string[]> = {};
		for (const err of zodError.errors) {
			const path = err.path.join(".");
			if (!details[path]) {
				details[path] = [];
			}
			details[path].push(err.message);
		}
		return new ValidationError("Validation failed", undefined, details);
	}
}

/**
 * Error thrown when a database operation fails
 */
export class DatabaseError extends AppError {
	readonly statusCode = 500;
	readonly code = "DATABASE_ERROR";

	constructor(message = "A database error occurred") {
		super(message);
	}
}

/**
 * Error thrown when rate limit is exceeded
 */
export class RateLimitError extends AppError {
	readonly statusCode = 429;
	readonly code = "RATE_LIMIT_EXCEEDED";

	readonly retryAfter?: number;

	constructor(
		message = "Rate limit exceeded. Please try again later.",
		retryAfter?: number,
	) {
		super(message);
		this.retryAfter = retryAfter;
	}
}

/**
 * Type guard to check if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
	return error instanceof AppError;
}

/**
 * Convert any error to a user-friendly message
 */
export function getErrorMessage(error: unknown): string {
	if (isAppError(error)) {
		return error.message;
	}
	// In development, we allow viewing the raw error message for debugging
	if (error instanceof Error && process.env.NODE_ENV !== "production") {
		return error.message;
	}
	return "An unexpected error occurred";
}
