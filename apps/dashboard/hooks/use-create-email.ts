import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@workspace/axios";
import { toast } from "sonner";
import { Email } from "./use-emails";

interface CreateEmailData {
  subject: string;
  body: string;
}

export function useCreateEmail(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateEmailData) => {
      const res = await api.post<{ data: Email }>(
        `/projects/${projectId}/emails`,
        data
      );
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails", projectId] });
      toast.success("Post created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create post");
    },
  });
}
