import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@workspace/axios";
import { toast } from "sonner";
import type { ServiceResponse } from "@workspace/types";

type UpdateEmailValues = {
  emailId: string;
  subject?: string;
  body?: string;
  status?: "published" | "draft";
};

export function useUpdateEmail(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: UpdateEmailValues) => {
      const { emailId, ...data } = values;
      const res = await api.patch<ServiceResponse<any>>(
        `/projects/${projectId}/emails/${emailId}`,
        data
      );
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Post updated successfully");
        queryClient.invalidateQueries({ queryKey: ["emails", projectId] });
      } else {
        toast.error(data.message || "Failed to update post");
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Something went wrong"
      );
    },
  });
}
