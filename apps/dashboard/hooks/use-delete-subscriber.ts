import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@workspace/axios";
import { toast } from "sonner";

export function useDeleteSubscriber(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subscriberId: string) => {
      const res = await api.delete(
        `/projects/${projectId}/subscribers/${subscriberId}`
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscribers", projectId] });
      toast.success("Subscriber removed successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to remove subscriber"
      );
    },
  });
}
