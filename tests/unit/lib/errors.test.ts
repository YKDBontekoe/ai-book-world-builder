import { describe, expect, it, vi } from "vitest";
import {
	ChatSDKError,
	DatabaseError,
	ForbiddenError,
	getErrorMessage,
	getMessageByErrorCode,
	isAppError,
	NotFoundError,
	RateLimitError,
	UnauthorizedError,
	ValidationError,
} from "@/lib/errors";

describe("Error Classes", () => {
	describe("ChatSDKError", () => {
		it("sets correct properties from errorCode", () => {
			const err = new ChatSDKError("bad_request:api");
			expect(err.type).toBe("bad_request");
			expect(err.surface).toBe("api");
			expect(err.statusCode).toBe(400);
			expect(err.message).toBe(
				"The request couldn't be processed. Please check your input and try again.",
			);
		});

		it("uses cause if provided", () => {
			const err = new ChatSDKError("not_found:chat", "Custom Cause");
			expect(err.message).toBe("Custom Cause");
		});

		it("toResponse returns JSON response for response visibility", async () => {
			const err = new ChatSDKError("not_found:chat");
			const response = err.toResponse();
			expect(response).toBeInstanceOf(Response);
			expect(response.status).toBe(404);
			const data = await response.json();
			expect(data.code).toBe("not_found:chat");
		});

		it("toResponse logs and returns generic message for log visibility", async () => {
			const err = new ChatSDKError("bad_request:database" as any); // database surface is "log"
			const consoleSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});

			const response = err.toResponse();
			expect(consoleSpy).toHaveBeenCalled();
			expect(response.status).toBe(400);
			const data = await response.json();
			expect(data.message).toBe(
				"Something went wrong. Please try again later.",
			);

			consoleSpy.mockRestore();
		});
	});

	describe("getMessageByErrorCode", () => {
		it("returns correct messages for known codes", () => {
			expect(getMessageByErrorCode("unauthorized:auth")).toContain("sign in");
			expect(getMessageByErrorCode("rate_limit:chat")).toContain("exceeded");
			expect(getMessageByErrorCode("forbidden:document")).toContain(
				"another user",
			);
		});

		it("returns database message for database codes", () => {
			expect(getMessageByErrorCode("bad_request:database" as any)).toContain(
				"database query",
			);
		});

		it("returns generic message for unknown code", () => {
			expect(getMessageByErrorCode("unknown:api" as any)).toContain(
				"Something went wrong",
			);
		});
	});

	describe("AppError Subclasses", () => {
		it("UnauthorizedError has 401", () => {
			const err = new UnauthorizedError();
			expect(err.statusCode).toBe(401);
			expect(err.code).toBe("UNAUTHORIZED");
		});

		it("ForbiddenError has 403", () => {
			const err = new ForbiddenError();
			expect(err.statusCode).toBe(403);
		});

		it("NotFoundError.forResource creates correct message", () => {
			const err = NotFoundError.forResource("Book", "123");
			expect(err.statusCode).toBe(404);
			expect(err.message).toBe("Book not found: 123");
			expect(err.resourceType).toBe("Book");
			expect(err.resourceId).toBe("123");
		});

		it("ValidationError.forField creates correct error", () => {
			const err = ValidationError.forField("email", "Invalid email");
			expect(err.statusCode).toBe(400);
			expect(err.field).toBe("email");
		});

		it("ValidationError.fromZodError maps paths correctly", () => {
			const zodError = {
				errors: [
					{ path: ["user", "name"], message: "Too short" },
					{ path: ["email"], message: "Invalid" },
				],
			};
			const err = ValidationError.fromZodError(zodError as any);
			expect(err.details).toHaveProperty("user.name", ["Too short"]);
			expect(err.details).toHaveProperty("email", ["Invalid"]);
		});

		it("DatabaseError has 500", () => {
			const err = new DatabaseError();
			expect(err.statusCode).toBe(500);
		});

		it("RateLimitError includes retryAfter", () => {
			const err = new RateLimitError("Slow down", 60);
			expect(err.retryAfter).toBe(60);
			expect(err.statusCode).toBe(429);
		});

		it("toJSON returns consistent structure", () => {
			const err = new UnauthorizedError("Stop");
			expect(err.toJSON()).toEqual({
				code: "UNAUTHORIZED",
				message: "Stop",
				statusCode: 401,
			});
		});
	});

	describe("Utility Functions", () => {
		it("isAppError identifies subclasses", () => {
			expect(isAppError(new UnauthorizedError())).toBe(true);
			expect(isAppError(new Error())).toBe(false);
			expect(isAppError({})).toBe(false);
		});

		it("getErrorMessage returns correct message in dev", () => {
			vi.stubEnv("NODE_ENV", "development");
			expect(getErrorMessage(new UnauthorizedError("Msg"))).toBe("Msg");
			expect(getErrorMessage(new Error("Generic"))).toBe("Generic");
			expect(getErrorMessage("String")).toBe("An unexpected error occurred");
			vi.unstubAllEnvs();
		});

		it("getErrorMessage masks unknown errors in production", () => {
			vi.stubEnv("NODE_ENV", "production");
			expect(getErrorMessage(new UnauthorizedError("Msg"))).toBe("Msg");
			expect(getErrorMessage(new Error("Secret"))).toBe(
				"An unexpected error occurred",
			);
			expect(getErrorMessage("String")).toBe("An unexpected error occurred");
			vi.unstubAllEnvs();
		});
	});
});
