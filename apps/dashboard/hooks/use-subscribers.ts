import { useQuery } from "@tanstack/react-query";
import api from "@workspace/axios";

export interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  status: "subscribed" | "unsubscribed" | "pending" | "bounced";
  createdAt: string;
}

export function useSubscribers(projectId: string) {
  return useQuery({
    queryKey: ["subscribers", projectId],
    queryFn: async () => {
      const res = await api.get<{ data: Subscriber[] }>(
        `/projects/${projectId}/subscribers`
      );
      return res.data.data;
    },
    enabled: !!projectId,
  });
}
