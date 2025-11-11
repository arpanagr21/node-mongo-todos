import Redis from "ioredis";

let client: Redis | null = null;

export const getRedisClient = (): Redis | null => {
  if (client) return client;

  const url = process.env.REDIS_URL;
  if (!url) return null;

  client = new Redis(url);
  client.on("error", (err) => console.warn("Redis error:", err));
  return client;
};
