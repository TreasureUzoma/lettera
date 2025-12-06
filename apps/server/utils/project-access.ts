import type { Context } from "hono";
import type { AuthType } from "@/types";
import {
  getValidProject,
  getUserProjectRole,
  getProjectBySlug,
} from "@/services/projects";
import type { ProjectRoles } from "@workspace/types";

export const getProjectOrFail = async (
  c: Context,
  projectIdOrSlug: string,
  allowedRoles?: ProjectRoles[]
) => {
  const cookieUser = c.get("user") as AuthType;

  // check if project exists
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      projectIdOrSlug
    );

  let projectRes;
  if (isUuid) {
    projectRes = await getValidProject(projectIdOrSlug);
  } else {
    projectRes = await getProjectBySlug(projectIdOrSlug);
  }

  if (!projectRes.success || !projectRes.data) {
    return c.json(
      { success: false, message: "Project not found", data: null },
      404
    );
  }

  const project = projectRes.data;

  // if roles are specified, check permissions
  if (allowedRoles && allowedRoles.length > 0) {
    const userRoleRes = await getUserProjectRole(project.id, cookieUser.id);
    const role = userRoleRes.data?.role;
    if (!role || !allowedRoles.includes(role)) {
      return c.json(
        {
          success: false,
          message: "You don't have enough permissions",
          data: null,
        },
        403
      );
    }
  }

  // if everything passes, return the project
  return project;
};
