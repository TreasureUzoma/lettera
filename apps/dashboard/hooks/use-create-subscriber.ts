import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@workspace/axios";
import { toast } from "sonner";
import { Subscriber } from "./use-subscribers";

interface CreateSubscriberData {
  email: string;
  name?: string;
}

export function useCreateSubscriber(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSubscriberData) => {
      const res = await api.post<{ data: Subscriber }>(
        `/projects/${projectId}/subscribers`,
        data
      );
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscribers", projectId] });
      toast.success("Subscriber added successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to add subscriber");
    },
  });
}
