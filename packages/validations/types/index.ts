import { z } from "zod";
import { createOauthUserSchema, loginSchema } from "../index";

export type CreateOauthUser = z.infer<typeof createOauthUserSchema>;
