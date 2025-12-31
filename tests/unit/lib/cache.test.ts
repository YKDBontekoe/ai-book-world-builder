import { afterEach, describe, expect, it, vi } from "vitest";

// Mock redis client
vi.mock("@/lib/redis", () => ({
	redis: {
		get: vi.fn(),
		set: vi.fn(),
		del: vi.fn(),
		scan: vi.fn(),
	},
}));

import {
	getCached,
	invalidateCache,
	invalidateCachePattern,
} from "@/lib/cache";
import { redis } from "@/lib/redis";

// Define a type for the mocked redis client to satisfy TS
type MockRedis = {
	get: ReturnType<typeof vi.fn>;
	set: ReturnType<typeof vi.fn>;
	del: ReturnType<typeof vi.fn>;
	scan: ReturnType<typeof vi.fn>;
};

const mockedRedis = redis as unknown as MockRedis;

describe("Cache Utils", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("getCached", () => {
		it("returns cached data if available", async () => {
			const mockData = { foo: "bar" };
			mockedRedis.get.mockResolvedValue(JSON.stringify(mockData));

			const fetchFn = vi.fn();
			const result = await getCached("test-key", fetchFn);

			expect(result).toEqual(mockData);
			expect(mockedRedis.get).toHaveBeenCalledWith("test-key");
			expect(fetchFn).not.toHaveBeenCalled();
		});

		it("fetches data and sets cache if cache miss", async () => {
			mockedRedis.get.mockResolvedValue(null);
			const mockData = { foo: "bar" };
			const fetchFn = vi.fn().mockResolvedValue(mockData);

			const result = await getCached("test-key", fetchFn);

			expect(result).toEqual(mockData);
			expect(mockedRedis.get).toHaveBeenCalledWith("test-key");
			expect(fetchFn).toHaveBeenCalled();
			expect(mockedRedis.set).toHaveBeenCalledWith(
				"test-key",
				JSON.stringify(mockData),
				{ EX: 3600 },
			);
		});

		it("handles json parse error by deleting key and fetching fresh", async () => {
			mockedRedis.get.mockResolvedValue("invalid-json");
			const mockData = { foo: "bar" };
			const fetchFn = vi.fn().mockResolvedValue(mockData);

			const result = await getCached("test-key", fetchFn);

			expect(mockedRedis.del).toHaveBeenCalledWith("test-key");
			expect(fetchFn).toHaveBeenCalled();
			expect(result).toEqual(mockData);
		});
	});

	describe("invalidateCache", () => {
		it("deletes key from redis", async () => {
			await invalidateCache("test-key");
			expect(mockedRedis.del).toHaveBeenCalledWith("test-key");
		});
	});

	describe("invalidateCachePattern", () => {
		it("scans and deletes keys matching pattern", async () => {
			mockedRedis.scan
				// First scan call returns a cursor and some keys
				.mockResolvedValueOnce({
					cursor: 1,
					keys: ["key1", "key2"],
				})
				// Second scan call returns the final cursor and more keys
				.mockResolvedValueOnce({
					cursor: 0, // End of scan
					keys: ["key3"],
				});

			await invalidateCachePattern("test-*");

			// Verify that scan was called twice to get all pages
			expect(mockedRedis.scan).toHaveBeenCalledTimes(2);

			// Verify that del was called with the correct keys from each scan page
			expect(mockedRedis.del).toHaveBeenCalledWith(["key1", "key2"]);
			expect(mockedRedis.del).toHaveBeenCalledWith(["key3"]);
			expect(mockedRedis.del).toHaveBeenCalledTimes(2);
		});
	});
});
