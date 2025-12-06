import { useQuery } from "@tanstack/react-query";
import api from "@workspace/axios";
import type { ServiceResponse } from "@workspace/types";

export function useProject(slug: string) {
  return useQuery({
    queryKey: ["project", slug],
    queryFn: async () => {
      const res = await api.get<{ project: any }>(`/projects/slug/${slug}`);
      return res.data.project;
    },
    enabled: !!slug,
  });
}
