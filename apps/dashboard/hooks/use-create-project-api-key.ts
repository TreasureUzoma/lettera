import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@workspace/axios";
import { toast } from "sonner";
import { ApiKey } from "./use-project-api-keys";

export function useCreateProjectApiKey(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await api.post<{ data: ApiKey & { secretKey: string } }>(
        `/projects/api/${projectId}`
      );
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["project-api-keys", projectId],
      });
      toast.success("API key created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create API key");
    },
  });
}
