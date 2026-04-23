import Redis from "ioredis";

export const redis = new Redis(
  process.env.REDIS_URL || "redis://localhost:6379",
  {
    tls: process.env.REDIS_URL?.startsWith("rediss://") ? {} : undefined,
  },
);

redis.on("error", (err) => {
  console.error("[Redis] Connection error:", err.message);
});

redis.on("connect", () => {
  console.log("[Redis] Connected successfully");
});

export const REDIS_KEYS = {
  TOKEN_VERSION: (userId: number) => `user:token_version:${userId}`,
};
