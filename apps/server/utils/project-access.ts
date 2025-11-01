import type { Context } from "hono";
import type { AuthType } from "@/types";
import { getValidProject, getUserProjectRole } from "@/services/projects";
import type { ProjectRoles } from "@workspace/types";

export const getProjectOrFail = async (
  c: Context,
  projectId: string,
  allowedRoles?: ProjectRoles[]
) => {
  const cookieUser = c.get("user") as AuthType;

  // check if project exists
  const projectRes = await getValidProject(projectId);
  if (!projectRes.success || !projectRes.data) {
    return c.json(
      { success: false, message: "Project not found", data: null },
      404
    );
  }

  // if roles are specified, check permissions
  if (allowedRoles && allowedRoles.length > 0) {
    const userRoleRes = await getUserProjectRole(projectId, cookieUser.id);
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
  return projectRes.data;
};
