import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@workspace/axios";
import type {
  Login,
  Signup,
  VerifyResetPassword,
} from "@workspace/validations";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { OauthType } from "@workspace/types/auth";

export const useLoginMutation = () => {
  const queryClint = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (body: Login) => api.post("/auth/login", body),
    onSuccess: () => {
      queryClint.invalidateQueries({ queryKey: ["session"] });
      toast.success("Logged in successfully");
      router.push("/dashboard");
    },
    onError: (err) => {
      toast.error(err?.message ?? "Failed to login");
    },
  });
};

export const useSignupMutation = () => {
  const queryClint = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (body: Signup) => api.post("/auth/signup", body),
    onSuccess: () => {
      queryClint.invalidateQueries({ queryKey: ["session"] });
      toast.success("Verify your email address");
      router.push("/verify-email");
    },
    onError: (err) => {
      toast.error(err?.message ?? "Failed to create account");
    },
  });
};

export const useOauthSigninMutation = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (method: OauthType) => api(`/auth/${method}/url`),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
      router.push(res.data.url);
    },
    onError: (err) => {
      toast.error(err?.message ?? "Something went wrong");
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (email: string) =>
      api.post("/auth/forgotten-password", { email }),
    onError: (err) => {
      toast.error(err?.message ?? "Failed to send password reset link");
    },
  });
};

export const useResetPassowrd = () => {
  return useMutation({
    mutationFn: (body: VerifyResetPassword) =>
      api.post("/auth/reset-password", body),
    onError: (err) => {
      toast.error(err?.message ?? "Failed to reset password.");
    },
  });
};
