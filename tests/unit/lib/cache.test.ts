
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	getCached,
	invalidateCache,
	invalidateCachePattern,
} from "@/lib/cache";
import { redis } from "@/lib/redis";

// Mock redis client
vi.mock("@/lib/redis", () => ({
	redis: {
		get: vi.fn(),
		set: vi.fn(),
		del: vi.fn(),
		scan: vi.fn(),
	},
}));

// Define a type for the mocked redis client to satisfy TS
type MockRedis = {
	get: ReturnType<typeof vi.fn>;
	set: ReturnType<typeof vi.fn>;
	del: ReturnType<typeof vi.fn>;
	scan: ReturnType<typeof vi.fn>;
};

const mockedRedis = redis as unknown as MockRedis;

describe("Cache Utils", () => {
	beforeEach(() => {
		vi.resetAllMocks();
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
			mockedRedis.set.mockResolvedValue("OK");

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
			mockedRedis.del.mockResolvedValue(1);

			const result = await getCached("test-key", fetchFn);

			expect(mockedRedis.del).toHaveBeenCalledWith("test-key");
			expect(fetchFn).toHaveBeenCalled();
			expect(result).toEqual(mockData);
		});

		it("handles redis set error gracefully", async () => {
			mockedRedis.get.mockResolvedValue(null);
			mockedRedis.set.mockRejectedValue(new Error("Redis Set Error"));
			const mockData = { foo: "bar" };
			const fetchFn = vi.fn().mockResolvedValue(mockData);

			const result = await getCached("test-key", fetchFn);
			expect(result).toEqual(mockData);
			expect(fetchFn).toHaveBeenCalled();
		});

		it("handles redis get error by falling back to fetch", async () => {
			mockedRedis.get.mockRejectedValue(new Error("Redis Get Error"));
			const mockData = { foo: "bar" };
			const fetchFn = vi.fn().mockResolvedValue(mockData);

			const result = await getCached("test-key", fetchFn);
			expect(result).toEqual(mockData);
			expect(fetchFn).toHaveBeenCalled();
		});
	});

	describe("invalidateCache", () => {
		it("deletes key from redis", async () => {
			mockedRedis.del.mockResolvedValue(1);
			await invalidateCache("test-key");
			expect(mockedRedis.del).toHaveBeenCalledWith("test-key");
		});

		it("handles deletion errors gracefully", async () => {
			mockedRedis.del.mockRejectedValue(new Error("Del Error"));
			await expect(invalidateCache("key")).resolves.not.toThrow();
		});
	});

	describe("invalidateCachePattern", () => {
		it("scans and deletes keys matching pattern", async () => {
			mockedRedis.scan
				.mockResolvedValueOnce({
					cursor: 1,
					keys: ["key1", "key2"],
				})
				.mockResolvedValueOnce({
					cursor: 0, // End of scan
					keys: ["key3"],
				});
			mockedRedis.del.mockResolvedValue(1);

			await invalidateCachePattern("test-*");

			expect(mockedRedis.scan).toHaveBeenCalledTimes(2);
			expect(mockedRedis.del).toHaveBeenCalledWith(["key1", "key2"]);
			expect(mockedRedis.del).toHaveBeenCalledWith(["key3"]);
		});

		it("handles scan/delete errors gracefully", async () => {
			mockedRedis.scan.mockRejectedValue(new Error("Scan Error"));
			await expect(invalidateCachePattern("pattern")).resolves.not.toThrow();
		});

		it("handles empty scan results", async () => {
			mockedRedis.scan.mockResolvedValue({ cursor: 0, keys: [] });
			await invalidateCachePattern("pattern");
			expect(mockedRedis.del).not.toHaveBeenCalled();
		});
	});
});
