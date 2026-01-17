import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/cron/process-feedback/route";

// Mock the service
vi.mock("@/lib/services/feedback-service", () => ({
	processDailyFeedback: vi.fn().mockResolvedValue({ processed: 1 }),
}));

describe("Cron API Auth", () => {
	beforeEach(() => {
		vi.resetModules();
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it("should return 500 if CRON_SECRET is not set", async () => {
		// Ensure CRON_SECRET is undefined
		// biome-ignore lint/performance/noDelete: "Test cleanup"
		delete process.env.CRON_SECRET;

		const request = new Request("http://localhost/api/cron/process-feedback");
		const response = await GET(request);

		// The current implementation allows access if secret is missing (returns 200)
		// We expect 500 after our fix
		expect(response.status).toBe(500);
	});

	it("should return 401 if auth header is missing", async () => {
		vi.stubEnv("CRON_SECRET", "test-secret");

		const request = new Request("http://localhost/api/cron/process-feedback");
		const response = await GET(request);

		expect(response.status).toBe(401);
	});

	it("should return 401 if auth header is incorrect", async () => {
		vi.stubEnv("CRON_SECRET", "test-secret");

		const request = new Request("http://localhost/api/cron/process-feedback", {
			headers: {
				Authorization: "Bearer wrong-secret",
			},
		});
		const response = await GET(request);

		expect(response.status).toBe(401);
	});

	it("should return 200 if auth header is correct", async () => {
		vi.stubEnv("CRON_SECRET", "test-secret");

		const request = new Request("http://localhost/api/cron/process-feedback", {
			headers: {
				Authorization: "Bearer test-secret",
			},
		});
		const response = await GET(request);

		expect(response.status).toBe(200);
	});
});
