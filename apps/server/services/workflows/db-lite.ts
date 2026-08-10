import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./local-schema";

/**
 * A standalone drizzle client, deliberately NOT going through
 * `@workspace/db`. See `local-schema.ts` for why: queued workflow steps get
 * bundled into a standalone artifact that can't resolve unbuilt workspace
 * packages, so this file and its schema need to be local to `apps/server`.
 */
const sql = neon(process.env.DB_URL!);
export const dbLite = drizzle(sql, { schema });

export { schema };
