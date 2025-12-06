import { useQuery } from "@tanstack/react-query";
import api from "@workspace/axios";

export interface Email {
  id: string;
  subject: string;
  body: string;
  status: "published" | "draft";
  sentAt: string;
}

export function useEmails(projectId: string) {
  return useQuery({
    queryKey: ["emails", projectId],
    queryFn: async () => {
      const res = await api.get<{ data: Email[] }>(
        `/projects/${projectId}/emails`
      );
      return res.data.data;
    },
    enabled: !!projectId,
  });
}
