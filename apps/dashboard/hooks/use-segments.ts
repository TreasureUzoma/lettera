import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@workspace/axios";
import { toast } from "sonner";

export interface Segment {
  id: string;
  name: string;
  description: string | null;
  criteria: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  subscriberCount: number;
}

export function useSegments(projectId: string) {
  return useQuery({
    queryKey: ["segments", projectId],
    queryFn: async () => {
      const res = await api.get<{ data: Segment[] }>(`/segments/${projectId}`);
      return res.data.data;
    },
    enabled: !!projectId,
  });
}

interface CreateSegmentData {
  name: string;
  description?: string;
}

export function useCreateSegment(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSegmentData) => {
      const res = await api.post<{ data: Segment }>(
        `/segments/${projectId}`,
        data
      );
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["segments", projectId] });
      toast.success("Segment created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create segment");
    },
  });
}

export function useDeleteSegment(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (segmentId: string) => {
      const res = await api.delete(`/segments/${projectId}/${segmentId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["segments", projectId] });
      toast.success("Segment deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete segment");
    },
  });
}

export interface SegmentSubscriber {
  id: string;
  email: string;
}

export function useSegmentSubscribers(projectId: string, segmentId: string) {
  return useQuery({
    queryKey: ["segments", projectId, segmentId, "subscribers"],
    queryFn: async () => {
      const res = await api.get<{ data: SegmentSubscriber[] }>(
        `/segments/${projectId}/${segmentId}/subscribers`
      );
      return res.data.data;
    },
    enabled: !!projectId && !!segmentId,
  });
}

export function useAddSubscriberToSegment(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      segmentId,
      subscriberId,
    }: {
      segmentId: string;
      subscriberId: string;
    }) => {
      const res = await api.post(
        `/segments/${projectId}/${segmentId}/subscribers/${subscriberId}`
      );
      return res.data;
    },
    onSuccess: (_data, { segmentId }) => {
      queryClient.invalidateQueries({ queryKey: ["segments", projectId] });
      queryClient.invalidateQueries({
        queryKey: ["segments", projectId, segmentId, "subscribers"],
      });
      toast.success("Subscriber added to segment");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add subscriber to segment");
    },
  });
}

export function useRemoveSubscriberFromSegment(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      segmentId,
      subscriberId,
    }: {
      segmentId: string;
      subscriberId: string;
    }) => {
      const res = await api.delete(
        `/segments/${projectId}/${segmentId}/subscribers/${subscriberId}`
      );
      return res.data;
    },
    onSuccess: (_data, { segmentId }) => {
      queryClient.invalidateQueries({ queryKey: ["segments", projectId] });
      queryClient.invalidateQueries({
        queryKey: ["segments", projectId, segmentId, "subscribers"],
      });
      toast.success("Subscriber removed from segment");
    },
    onError: (error: any) => {
      toast.error(
        error.message || "Failed to remove subscriber from segment"
      );
    },
  });
}
