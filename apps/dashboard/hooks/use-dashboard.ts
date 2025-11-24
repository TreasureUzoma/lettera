import { useQuery } from "@tanstack/react-query";
import api from "@workspace/axios";
import type { DashboardOverview } from "@workspace/validations";
import type { ServiceResponse } from "@workspace/types";

// Define the response type based on the service return
interface DashboardData {
  stats: {
    totalProjects: number;
    totalSubscribers: number;
    totalRevenue: number;
    totalPosts: number;
  };
  projects: {
    data: any[]; // Replace with actual Project type if available
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export function useDashboardOverview(params: DashboardOverview) {
  return useQuery({
    queryKey: ["dashboard-overview", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set("page", params.page.toString());
      if (params.limit) searchParams.set("limit", params.limit.toString());
      if (params.sort) searchParams.set("sort", params.sort);

      const res = await api.get<ServiceResponse<DashboardData>>(
        `/dashboard/overview?${searchParams.toString()}`
      );
      return res.data;
    },
  });
}
