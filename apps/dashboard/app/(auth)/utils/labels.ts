import { AuthProps } from "../components/auth-form";

interface GetAuthButtonLabelOptions {
  mode: AuthProps["mode"];
  isPending?: boolean;
}

export function getAuthButtonLabel({
  mode,
  isPending,
}: GetAuthButtonLabelOptions): string {
  const baseLabels: Record<GetAuthButtonLabelOptions["mode"], string> = {
    login: "Login",
    signup: "Sign up",
    "forgot-password": "Send reset link",
    "verify-email": "Continue",
    "reset-password": "Update password",
  };

  const pendingLabels: Record<GetAuthButtonLabelOptions["mode"], string> = {
    login: "Logging in...",
    signup: "Creating account...",
    "forgot-password": "Sending link...",
    "verify-email": "Please wait...",
    "reset-password": "Updating password...",
  };

  return isPending ? pendingLabels[mode] : baseLabels[mode];
}
