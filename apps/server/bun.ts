import { serve } from "bun";
import app from "./index.ts";
import { envConfig } from "./config.ts";

const PORT = Number(envConfig.PORT);

serve({
  port: PORT,
  fetch: app.fetch,
});

console.log(`Hono running on http://localhost:${PORT}`);
