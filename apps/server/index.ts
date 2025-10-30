import { Hono } from "hono";
import { logger } from "hono/logger";
import { serve } from "bun";
import { rateLimiter } from "./middlewares/rate-limiter";
import { withAuth } from "./middlewares/session";
import authRoute from "./routes/api/v1/auth";
import { envConfig } from "./config";
import type { Context } from "hono";
import type { AuthType } from "./types";
import projectsRoute from "./routes/api/v1/projects";

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

// 80 req per hour, /session
v1.get("/session", rateLimiter(60 * 60 * 1000, 80), withAuth, (c: Context) => {
  const user = c.get("user") as AuthType | undefined;
  return c.json({
    success: true,
    data: user ?? null,
    message: "Fetched User Session Successfully",
  });
});

// Everything else requires authentication
v1.use("*", withAuth);

// projects, 70 req per hour
v1.route("/projects", projectsRoute.use(rateLimiter(60 * 60 * 1000, 70)));

app.route("/", v1);

const server = serve({
  fetch: app.fetch,
  port: envConfig.PORT,
});

console.log(`Server running at http://localhost:${server.port}`);
