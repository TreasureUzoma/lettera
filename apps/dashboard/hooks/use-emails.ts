import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@workspace/axios";
import { toast } from "sonner";
import type { ServiceResponse } from "@workspace/types";

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

export function useEmail(projectId: string, emailId: string) {
  return useQuery({
    queryKey: ["email", projectId, emailId],
    queryFn: async () => {
      const res = await api.get<{ data: Email }>(
        `/projects/${projectId}/emails/${emailId}`
      );
      return res.data.data;
    },
    enabled: !!projectId && !!emailId,
  });
}

interface CreateEmailData {
  subject: string;
  body: string;
  sentAt?: string;
  status?: "published" | "draft";
}

export function useCreateEmail(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateEmailData) => {
      const res = await api.post<{ data: Email }>(
        `/projects/${projectId}/emails`,
        data
      );
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails", projectId] });
      toast.success("Post created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create post");
    },
  });
}

type UpdateEmailValues = {
  emailId: string;
  subject?: string;
  body?: string;
  status?: "published" | "draft";
  sentAt?: string;
};

export function useUpdateEmail(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: UpdateEmailValues) => {
      const { emailId, ...data } = values;
      const res = await api.patch<ServiceResponse<any>>(
        `/projects/${projectId}/emails/${emailId}`,
        data
      );
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Post updated successfully");
        queryClient.invalidateQueries({ queryKey: ["emails", projectId] });
      } else {
        toast.error(data.message || "Failed to update post");
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Something went wrong"
      );
    },
  });
}

export function useDeleteEmail(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (emailId: string) => {
      const res = await api.delete(`/projects/${projectId}/emails/${emailId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails", projectId] });
      toast.success("Post deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete post");
    },
  });
}
