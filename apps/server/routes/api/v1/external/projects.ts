import { routeStatus } from "@/lib/utils";
import { projectApiKey } from "@/middlewares/project-api-keys";
import { getSubscribers } from "@/services/subscribers";
import { createProjectSubscriber } from "@/services/subscriptions";
import type { ExternalProjectCreate } from "@/types";
import { Hono, type Context } from "hono";

const externalProjectRoutes = new Hono().use(projectApiKey);

externalProjectRoutes.post("/subscriber/new", async (c: Context) => {
  const projectData = c.get("project") as { id: string };
  const { email } = await c.req.json();
  const serviceData = await createProjectSubscriber({
    projectId: projectData.id,
    email,
  });
  return c.json(serviceData, routeStatus(serviceData));
});

externalProjectRoutes.get("/subscribers", async (c: Context) => {
  const projectData = c.get("project") as { id: string; keyType: string };

  if (projectData.keyType !== "private") {
    return c.json(
      { success: false, message: "Unauthorized: Private key required" },
      401
    );
  }

  const { page, limit } = c.req.query();
  const pageNumber = page ? parseInt(page) : 1;
  const limitNumber = limit ? parseInt(limit) : 10;

  const serviceData = await getSubscribers(
    projectData.id,
    pageNumber,
    limitNumber
  );
  return c.json(serviceData, routeStatus(serviceData));
});

export default externalProjectRoutes;
