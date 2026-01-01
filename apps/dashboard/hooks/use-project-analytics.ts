import { useQuery } from "@tanstack/react-query";
import api from "@workspace/axios";
import type { ServiceResponse } from "@workspace/types";

export interface ProjectAnalytics {
  stats: {
    totalSubscribers: number;
    growth7d: number;
    growth30d: number;
    lastPostSent: string | null;
    openRate: number;
  };
  chartData: Array<{
    date: string;
    count: number;
  }>;
  activity: Array<{
    id: string;
    type: "subscriber" | "email";
    name?: string;
    email?: string;
    subject?: string;
    createdAt: string;
  }>;
  lastPost: {
    id: string;
    subject: string;
    sentAt: string;
    openRate: number;
    clickRate: number;
  } | null;
}

export function useProjectAnalytics(id: string) {
  return useQuery({
    queryKey: ["project-analytics", id],
    queryFn: async () => {
      const res = await api.get<ServiceResponse<ProjectAnalytics>>(
        `/projects/${id}/analytics`
      );
      return res.data.data;
    },
    enabled: !!id,
  });
}
