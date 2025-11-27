import { useQuery } from "@tanstack/react-query";
import api from "@workspace/axios";
import type { Project } from "@workspace/constants/types/projects";

type PaginatedResponse<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await api.get<{ data: PaginatedResponse<Project> }>("/projects");
      return res.data.data.data;
    },
  });
}
