import { redis } from "@/lib/redis";

/**
 * Standardized caching wrapper.
 * @param key The cache key
 * @param fetchFn The function to fetch data if cache miss
 * @param ttlSeconds Time to live in seconds (default 1 hour)
 */
export async function getCached<T>(
	key: string,
	fetchFn: () => Promise<T>,
	ttlSeconds = 3600,
): Promise<T> {
	if (!redis) {
		return fetchFn();
	}

	try {
		const cached = (await redis.get(key)) as string | null;
		if (cached) {
			try {
				return JSON.parse(cached) as T;
			} catch (parseError) {
				console.error(`Failed to parse cache for key ${key}`, parseError);
				// If parsing fails, delete the corrupted key and fallback to fetch
				await redis.del(key);
			}
		}

		const data = await fetchFn();

		if (data) {
			try {
				await redis.set(key, JSON.stringify(data), { ex: ttlSeconds });
			} catch (setError) {
				console.error(`Failed to set cache for key ${key}`, setError);
			}
		}

		return data;
	} catch (error) {
		console.error(`Redis cache error for key ${key}:`, error);
		// Fallback to direct fetch on Redis errors
		return fetchFn();
	}
}

/**
 * Invalidates a specific cache key.
 */
export async function invalidateCache(key: string): Promise<void> {
	if (!redis) return;
	try {
		await redis.del(key);
	} catch (error) {
		console.error(`Failed to invalidate cache key ${key}:`, error);
	}
}

/**
 * Invalidates keys matching a pattern.
 * Note: Use carefully as keys scanning can be expensive in large DBs,
 * though less so with SCAN vs KEYS.
 */
export async function invalidateCachePattern(pattern: string): Promise<void> {
	if (!redis) return;
	try {
		// Scan for keys matching pattern
		let cursor: number | string = 0;
		do {
			// The Upstash redis client's scan method returns a tuple: [cursor: string, keys: string[]]
			const [newCursor, keys]: [string, string[]] = await redis.scan(
				cursor as any,
				{
					match: pattern,
					count: 100,
				},
			);
			cursor = newCursor;
			if (keys.length > 0) {
				await redis.del(...keys);
			}
			// Strict check for numeric 0 or string "0" depending on what client returns
		} while (Number(cursor) !== 0);
	} catch (error) {
		console.error(`Failed to invalidate cache pattern ${pattern}:`, error);
	}
}
