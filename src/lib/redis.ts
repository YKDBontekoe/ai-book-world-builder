import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!redisUrl || !redisToken) {
	console.warn(
		"UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN is not set. Rate limiting and caching may be disabled.",
	);
}

// The Redis constructor can handle undefined URL/token, it will just create a disabled client.
export const redis = new Redis({
	url: redisUrl!,
	token: redisToken!,
});
