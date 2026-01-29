import { beforeEach, describe, expect, it, vi } from "vitest";
import { auth } from "@/app/(auth)/auth";
import { createAction } from "@/lib/action-middleware";
import { redis } from "@/lib/redis";

// Mock Auth
vi.mock("@/app/(auth)/auth", () => ({
	auth: vi.fn(),
}));

// Mock Redis
vi.mock("@/lib/redis", () => ({
	redis: {
		incr: vi.fn(),
		expire: vi.fn(),
		ttl: vi.fn(),
	},
}));

describe("Action Middleware Rate Limiting", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Setup successful auth
		vi.mocked(auth).mockResolvedValue({
			user: { id: "user-1", role: "user" },
		} as any);
	});

	it("should allow request when within rate limit", async () => {
		const handler = vi.fn().mockResolvedValue("success");
		const action = createAction({
			actionName: "test-action",
			rateLimit: { limit: 2, duration: 60 },
			handler,
		});

		if (!redis) throw new Error("Redis not mocked");

		// Mock Redis incr to return 1 (first request)
		vi.mocked(redis.incr).mockResolvedValue(1);

		const result = await action();

		expect(result.success).toBe(true);
		expect(redis.incr).toHaveBeenCalledWith("rate-limit:test-action:user-1");
		expect(redis.expire).toHaveBeenCalledWith(
			"rate-limit:test-action:user-1",
			60,
		);
		expect(handler).toHaveBeenCalled();
	});

	it("should throw RateLimitError when rate limit exceeded", async () => {
		const handler = vi.fn().mockResolvedValue("success");
		const action = createAction({
			actionName: "test-action",
			rateLimit: { limit: 2, duration: 60 },
			handler,
		});

		if (!redis) throw new Error("Redis not mocked");

		// Mock Redis incr to return 3 (exceeded limit of 2)
		vi.mocked(redis.incr).mockResolvedValue(3);
		// Mock Redis ttl to return 30 seconds remaining
		vi.mocked(redis.ttl).mockResolvedValue(30);

		const result = await action();

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toContain("Rate limit exceeded");
		}

		expect(redis.incr).toHaveBeenCalled();
		expect(handler).not.toHaveBeenCalled();
	});

	it("should throw error if actionName is missing when rateLimit is present", async () => {
		const handler = vi.fn().mockResolvedValue("success");
		const action = createAction({
			// valid TS but invalid runtime config
			actionName: undefined,
			rateLimit: { limit: 1, duration: 60 },
			handler,
		});

		const result = await action();
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error).toContain("actionName is required");
		}
	});
});
