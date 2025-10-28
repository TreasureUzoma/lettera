import crypto from "crypto";
import type { MiddlewareHandler } from "hono";
import { getRedis } from "../lib/redis";

export function rateLimiter(
  windowMs: number,
  maxReq: number
): MiddlewareHandler {
  return async (c, next) => {
    const userAgent = c.req.header("User-Agent") || "unknown";
    const ip =
      c.req.header("x-forwarded-for") ||
      c.req.header("cf-connecting-ip") ||
      c.req.header("x-real-ip") ||
      "unknown";
    const key = crypto
      .createHash("sha256")
      .update(userAgent + ip)
      .digest("hex");

    const redis = await getRedis();
    const now = Date.now();

    const tx = redis.multi();
    tx.zAdd(`rate:${key}`, [{ score: now, value: `${now}` }]);
    tx.zRemRangeByScore(`rate:${key}`, 0, now - windowMs);
    tx.zCard(`rate:${key}`);

    const results = await tx.exec();

    // @ts-ignore
    const reqCount = results[2] as number;

    if (reqCount > maxReq) {
      return c.json({ error: "Too many requests" }, 429);
    }

    await next();
  };
}
