import { Redis } from "ioredis";

const REDIS_URL = Deno.env.get("REDIS_URL") || "redis://localhost:6379";

export const redis = new Redis(REDIS_URL, {
  connectTimeout: 5_000,
  maxRetriesPerRequest: null, // BullMQ wants this set
});
