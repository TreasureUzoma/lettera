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
import subscriptionRoutes from "./routes/api/v1/subscriptions";
import { success } from "zod/v4";
import unsubscribeRoutes from "./routes/api/v1/unsubscribe";

const app = new Hono();

app.notFound((c) => {
  return c.json({ message: "Not Found" }, 404);
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

// unsubscribe route, no auth needed too
v1.route("/unsubscribe", unsubscribeRoutes.use(rateLimiter(60 * 1000, 5)));

// Everything else requires authentication
v1.use("*", withAuth);

// 80 req per hour, /session
v1.get("/session", rateLimiter(60 * 60 * 1000, 80), (c: Context) => {
  const user = c.get("user") as AuthType | undefined;
  return c.json({
    success: true,
    data: user ?? null,
    message: "Fetched User Session Successfully",
  });
});

// projects, 70 req per hour
v1.route("/projects", projectsRoute.use(rateLimiter(60 * 60 * 1000, 70)));

// projects, 70 req per hour
v1.route(
  "/subscribers",
  subscriptionRoutes.use(rateLimiter(60 * 60 * 1000, 70))
);

app.route("/", v1);

const server = serve({
  fetch: app.fetch,
  port: envConfig.PORT,
});

console.log(`Server running at http://localhost:${server.port}`);
