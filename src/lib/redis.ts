import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!redisUrl || !redisToken) {
	console.warn(
		"UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN is not set. Redis will be disabled.",
	);
}

export const redis =
	redisUrl && redisToken
		? new Redis({
				url: redisUrl,
				token: redisToken,
			})
		: null;
