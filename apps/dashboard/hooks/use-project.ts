import { useQuery } from "@tanstack/react-query";
import api from "@workspace/axios";
import type { ServiceResponse } from "@workspace/types";

export function useProject(id: string) {
  return useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const res = await api.get<{ project: any }>(`/projects/${id}`);
      return res.data.project;
    },
    enabled: !!id,
  });
}
