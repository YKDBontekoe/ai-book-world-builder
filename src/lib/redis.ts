import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
	console.warn("REDIS_URL is not set. Redis caching will be disabled.");
}

const client = redisUrl
	? createClient({
			url: redisUrl,
		})
	: null;

if (client) {
	client.on("error", (err) => console.error("Redis Client Error", err));
	client.connect().catch((err) => {
		console.error("Failed to connect to Redis", err);
	});
}

export const redis = client;
