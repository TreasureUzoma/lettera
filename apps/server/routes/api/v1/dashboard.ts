import { getDashboardOverview } from "@/services/dashboard";
import type { AppBindings, AuthType } from "@/types";
import { routeStatus } from "@/lib/utils";
import { validationErrorResponse } from "@/utils/validation-error-response";
import { zValidator } from "@hono/zod-validator";
import { dashboardOverviewSchema } from "@workspace/validations";
import { Hono } from "hono";

const dashboardRoute = new Hono<AppBindings>();

dashboardRoute.get(
  "/overview",
  zValidator("query", dashboardOverviewSchema, (result, c) => {
    if (!result.success) return validationErrorResponse(c, result.error);
  }),
  async (c) => {
    const cookieUser = c.get("user") as AuthType;
    const { page, limit, sort } = c.req.valid("query");

    const serviceData = await getDashboardOverview(
      cookieUser.id,
      page,
      limit,
      sort
    );

    return c.json(serviceData, routeStatus(serviceData));
  }
);

export default dashboardRoute;
