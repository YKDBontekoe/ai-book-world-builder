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
				{ ex: 3600 },
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
				.mockResolvedValueOnce(["1", ["key1", "key2"]])
				.mockResolvedValueOnce(["0", ["key3"]]);

			await invalidateCachePattern("test-*");

			expect(mockedRedis.scan).toHaveBeenCalledTimes(2);
			expect(mockedRedis.del).toHaveBeenCalledWith(["key1", "key2"]);
			expect(mockedRedis.del).toHaveBeenCalledWith(["key3"]);
		});
	});
});
