import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

try {
  redis = Redis.fromEnv();
} catch (error) {
  console.warn(
    "Failed to initialize Upstash Redis from environment variables. Ensure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set.",
  );
}

export { redis };
