"use client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	clearCacheByPrefix,
	clearCached,
	getCached,
	setCached,
} from "@/lib/cache";
import { redis as actualRedis } from "@/lib/redis";

// Mock the redis client
vi.mock("@/lib/redis", () => ({
	redis: {
		get: vi.fn(),
		set: vi.fn(),
		del: vi.fn(),
		scan: vi.fn(),
	},
}));

const mockedRedis = vi.mocked(actualRedis);

describe("Cache Utils", () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	describe("getCached", () => {
		it("returns cached data if available", async () => {
			const mockData = { foo: "bar" };
			mockedRedis.get.mockResolvedValue(JSON.stringify(mockData));

			const result = await getCached("test-key");

			expect(result).toEqual(mockData);
			expect(mockedRedis.get).toHaveBeenCalledWith("test-key");
		});

		it("returns null if cache miss", async () => {
			mockedRedis.get.mockResolvedValue(null);
			const result = await getCached("test-key");
			expect(result).toBeNull();
		});

		it("handles json parse error by deleting key and returning null", async () => {
			mockedRedis.get.mockResolvedValue("invalid-json");
			const result = await getCached("test-key");

			expect(mockedRedis.del).toHaveBeenCalledWith("test-key");
			expect(result).toBeNull();
		});
	});

	describe("setCached", () => {
		it("sets value with TTL in redis", async () => {
			const mockData = { foo: "bar" };
			await setCached("test-key", mockData, 3600);

			expect(mockedRedis.set).toHaveBeenCalledWith(
				"test-key",
				JSON.stringify(mockData),
				{ ex: 3600 },
			);
		});
	});

	describe("clearCached", () => {
		it("deletes key from redis", async () => {
			await clearCached("test-key");
			expect(mockedRedis.del).toHaveBeenCalledWith("test-key");
		});
	});

	describe("clearCacheByPrefix", () => {
		it("scans and deletes keys matching pattern", async () => {
			mockedRedis.scan
				.mockResolvedValueOnce([1, ["test:1", "test:2"]])
				.mockResolvedValueOnce([0, ["test:3"]]);

			await clearCacheByPrefix("test");

			expect(mockedRedis.scan).toHaveBeenCalledTimes(2);
			expect(mockedRedis.del).toHaveBeenCalledWith(
				"test:1",
				"test:2",
				"test:3",
			);
		});
	});
});
