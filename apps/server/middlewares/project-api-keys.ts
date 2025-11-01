import { envConfig } from "@/config";
import { db } from "@workspace/db";
import { projectApiKeys } from "@workspace/db/schema";
import { eq, or } from "drizzle-orm";
import type { MiddlewareHandler } from "hono";

export const projectApiKey: MiddlewareHandler = async (c, next) => {
  const publicKey = c.req.header("x-lettera-public-key");
  const privateKey = c.req.header("x-lettera-private-key");

  if (!publicKey && !privateKey) {
    return c.json(
      {
        message: `Unauthorized: Neither x-lettera-public-key nor x-lettera-private-key was found. See ${envConfig.CLIENT_URL}/docs/create-subs for more info.`,
        success: false,
        data: null,
      },
      401
    );
  }
  const isPublicKeyValid =
    typeof publicKey === "string" &&
    publicKey.startsWith("letr_") &&
    publicKey.length >= 16 &&
    publicKey.length <= 40;

  const isPrivateKeyValid =
    typeof privateKey === "string" &&
    privateKey.length >= 30 &&
    privateKey.length <= 60;

  if (!isPublicKeyValid && !isPrivateKeyValid) {
    return c.json(
      {
        message: "Unauthorized: Invalid API key format.",
        success: false,
        data: null,
      },
      401
    );
  }

  let keyRecord;
  let keyType: "private" | "public" = isPrivateKeyValid ? "private" : "public";

  if (isPublicKeyValid && publicKey) {
    keyRecord = await db.query.projectApiKeys.findFirst({
      where: eq(projectApiKeys.publicKey, publicKey),
      with: {
        project: true,
      },
    });
    keyType = "public";
  } else if (isPrivateKeyValid && privateKey) {
    keyRecord = await db.query.projectApiKeys.findFirst({
      where: eq(projectApiKeys.encryptedSecretKey, privateKey),
      with: {
        project: true,
      },
    });
    keyType = "private";
  }

  if (!keyRecord) {
    return c.json(
      {
        message: "Unauthorized: API key not found or revoked.",
        success: false,
        data: null,
      },
      401
    );
  }

  if (keyRecord.revokedAt) {
    return c.json(
      {
        message: "Unauthorized: This API key has been revoked.",
        success: false,
        data: null,
      },
      401
    );
  }

  c.set("project", {
    id: keyRecord.projectId,
    name: keyRecord.project.name,
    keyType: keyType,
  });

  await db
    .update(projectApiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(projectApiKeys.id, keyRecord.id));

  await next();
};
