import { routeStatus } from "@/lib/utils";
import { createProjectSubscriber } from "@/services/subscriptions";
import type { ExternalProjectCreate } from "@/types";
import { Hono, type Context } from "hono";

const externalProjectRoutes = new Hono();

externalProjectRoutes.post("/subscriber/new", async (c: Context) => {
  const projectData = c.get("project") as ExternalProjectCreate;
  const serviceData = await createProjectSubscriber({
    projectId: projectData.id,
    email: projectData.email,
  });
  return c.json(serviceData, routeStatus(serviceData));
});

export default externalProjectRoutes;
