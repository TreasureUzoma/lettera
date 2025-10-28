import { envConfig } from "@/config";
import { createClient } from "redis";
import type { RedisClientType } from "redis";

let redisClient: RedisClientType;

export async function getRedis() {
  if (!envConfig.REDIS_URL) {
    throw new Error("REDIS ENV url is missing in .env");
  }
  if (!redisClient) {
    redisClient = createClient({
      url: envConfig.REDIS_URL,
    });

    redisClient.on("error", (err) => console.error("Redis Client Error", err));

    await redisClient.connect();
    console.log("connected to redis");
  }
  return redisClient;
}
