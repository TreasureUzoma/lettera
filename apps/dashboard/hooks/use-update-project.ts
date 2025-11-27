import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@workspace/axios";
import type { UpdateProject } from "@workspace/validations";
import { toast } from "sonner";

export function useUpdateProject(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: UpdateProject) => {
      const res = await api.patch(`/projects/${projectId}`, values);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      toast.success("Project updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update project");
    },
  });
}
