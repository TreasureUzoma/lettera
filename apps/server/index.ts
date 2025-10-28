import { Hono } from "hono";
import { logger } from "hono/logger";
import { serve } from "bun";
import { rateLimiter } from "./middlewares/rate-limiter";
import { withAuth } from "./middlewares/session";
import authRoute from "./routes/api/v1/auth";
import { envConfig } from "./config";
import type { Context } from "hono";
import type { AuthType } from "./types";

const app = new Hono();

app.notFound((c) => {
  return c.json({ error: "Not Found " }, 404);
});

app.use(logger());

app.onError((err, c) => {
  return c.json(
    {
      success: false,
      message: err.message || "Internal server error",
      data: null,
    },
    500
  );
});

const v1 = new Hono().basePath("/api/v1");

v1.get("/health", rateLimiter(60 * 1000, 5), (c) => {
  return c.json({ message: "Server is healthy!" });
});

// Auth routes (15 req per hour for login/signup etc., no auth required)
v1.route("/auth", authRoute.use(rateLimiter(60 * 60 * 1000, 15)));

// Everything else requires authentication
v1.use("*", withAuth);

v1.get("/session", withAuth, (c: Context) => {
  const user = c.get("user") as AuthType | undefined;
  return c.json({
    success: true,
    data: user ?? null,
    message: "Fetched User Session Successfully",
  });
});

app.route("/", v1);

const server = serve({
  fetch: app.fetch,
  port: envConfig.PORT,
});

console.log(`Server running at http://localhost:${server.port}`);
