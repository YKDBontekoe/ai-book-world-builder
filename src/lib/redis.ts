import { Redis } from "@upstash/redis";

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

let redisClient: Redis | null = null;

if (upstashUrl && upstashToken) {
	redisClient = new Redis({
		url: upstashUrl,
		token: upstashToken,
	});
} else {
	console.warn(
		"Upstash Redis environment variables are not set. Rate limiting will be disabled.",
	);
}

export const redis = redisClient;
