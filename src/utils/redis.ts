import Redis from "ioredis";

let client: Redis | null = null;

const buildRedisUrl = (): string | null => {
  if (process.env.REDIS_URL) return process.env.REDIS_URL;
  const host = process.env.REDIS_HOST || process.env.REDIS_HOSTNAME || "redis";
  const port = process.env.REDIS_PORT || "6379";
  const password = process.env.REDIS_PASSWORD;

  if (!host || !port) return null;
  if (password) return `redis://:${password}@${host}:${port}`;
  return `redis://${host}:${port}`;
};

export const getRedisClient = (): Redis | null => {
  if (client) return client;

  const url = buildRedisUrl();
  if (!url) return null;

  client = new Redis(url);
  client.on("error", (err) => console.warn("Redis error:", err));
  client.on("connect", () => console.info("Redis connected"));
  return client;
};

// For tests or graceful shutdown
export const closeRedisClient = async (): Promise<void> => {
  if (client) {
    try {
      await client.quit();
    } catch (err) {
      client.disconnect();
    }
    client = null;
  }
};

// export const delKeysByPattern = async (pattern: string): Promise<number> => {
//   if (!client) return 0;
//   try {
//     // For small deployments keys() is OK; for larger scale use SCAN
//     const keys = await client.keys(pattern);
//     if (!keys || keys.length === 0) return 0;
//     // Use DEL with spread; ioredis handles multiple args
//     const deleted = await client.del(...keys);
//     return typeof deleted === "number" ? deleted : 0;
//   } catch (err) {
//     console.warn("delKeysByPattern error:", err);
//     return 0;
//   }
// };
