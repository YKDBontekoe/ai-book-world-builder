"use client";

import type { ScanCommandOptions, SetCommandOptions } from "@upstash/redis";
import { redis } from "@/lib/redis";

/**
 * Get a value from the cache.
 * Handles JSON parsing.
 */
export async function getCached<T>(key: string): Promise<T | null> {
	if (!redis) return null;
	try {
		const cached = await redis.get<string>(key);
		if (!cached) {
			return null;
		}
		try {
			// Malformed JSON in cache, delete it and return null
			return JSON.parse(cached);
		} catch (e) {
			console.warn(`Invalid JSON in cache for key ${key}, deleting.`, e);
			await redis.del(key);
			return null;
		}
	} catch (error) {
		console.error(`Failed to get cache for key ${key}`, error);
		return null;
	}
}

/**
 * Set a value in the cache.
 * Handles JSON stringification.
 */
export async function setCached<T>(key: string, value: T, ttlSeconds: number) {
	if (!redis) return;
	try {
		const options: SetCommandOptions = { ex: ttlSeconds };
		await redis.set(key, JSON.stringify(value), options);
	} catch (error) {
		console.error(`Failed to set cache for key ${key}`, error);
	}
}

/**
 * Delete a value from the cache.
 */
export async function clearCached(key: string) {
	if (!redis) return;
	try {
		await redis.del(key);
	} catch (error) {
		console.error(`Failed to clear cache for key ${key}`, error);
	}
}

/**
 * Clear all keys matching a prefix.
 */
export async function clearCacheByPrefix(prefix: string) {
	if (!redis) return;
	try {
		const keys = await scanKeys(`${prefix}:*`);
		if (keys.length > 0) {
			await redis.del(...keys);
		}
	} catch (error) {
		console.error(`Failed to clear cache for prefix ${prefix}`, error);
	}
}

/**
 * Scan for all keys matching a pattern.
 */
export async function scanKeys(pattern: string): Promise<string[]> {
	if (!redis) return [];
	const keys: string[] = [];
	let cursor = 0;
	do {
		const options: ScanCommandOptions = {
			match: pattern,
			count: 100,
		};
		const [newCursor, foundKeys] = (await redis.scan(
			cursor,
			options,
		)) as unknown as [number, string[]];
		cursor = newCursor;
		keys.push(...foundKeys);
	} while (cursor !== 0);
	return keys;
}
