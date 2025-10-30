import { InferSelectModel, InferInsertModel, InferEnum } from "drizzle-orm";

import { projectRoleEnum, refreshTokens, users } from "../schema.js";

export type SelectUser = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type NewRefreshToken = InferInsertModel<typeof refreshTokens>;
export type SelectToken = InferSelectModel<typeof refreshTokens>;

export type ProjectRoles = InferEnum<typeof projectRoleEnum>;
