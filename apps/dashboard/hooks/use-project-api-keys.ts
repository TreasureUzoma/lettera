import { useQuery } from "@tanstack/react-query";
import api from "@workspace/axios";

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
      const res = await api.get<{ data: ApiKey[] }>(`/projects/api/${projectId}`);
      return res.data.data;
    },
    enabled: !!projectId,
  });
}
