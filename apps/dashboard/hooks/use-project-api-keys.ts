import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@workspace/axios";
import { toast } from "sonner";

export interface ApiKey {
  id: string;
  publicKey: string;
  createdAt: string;
  lastUsedAt: string | null;
}

export function useProjectApiKeys(projectId: string) {
  return useQuery({
    queryKey: ["project-api-keys", projectId],
    queryFn: async () => {
      const res = await api.get<{ data: ApiKey[] }>(
        `/projects/api/${projectId}`
      );
      return res.data.data;
    },
    enabled: !!projectId,
  });
}

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

export function useDeleteProjectApiKey(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (keyId: string) => {
      const res = await api.delete(`/projects/api/${projectId}/${keyId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["project-api-keys", projectId],
      });
      toast.success("API key deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete API key");
    },
  });
}
