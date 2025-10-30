import type { ServiceResponse } from "@workspace/types";
import crypto from "crypto";

export function generateApiKeys() {
  const publicKey = `letr_${crypto.randomBytes(16).toString("hex")}`;
  const secretKey = `lk_${crypto.randomBytes(32).toString("hex")}`;
  return { publicKey, secretKey };
}

export const routeStatus = (serviceData: ServiceResponse) =>
  serviceData.success ? 200 : 400;
