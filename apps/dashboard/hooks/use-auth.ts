import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@workspace/axios";
import type { Login, Signup } from "@workspace/validations";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
