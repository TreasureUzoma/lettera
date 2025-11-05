"use client";

import { cn } from "@workspace/ui/lib/utils";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@workspace/ui/components/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { GithubLogo, GoogleLogo } from "@workspace/ui/components/icons";
import { useForm } from "react-hook-form";
import { loginSchema, createAccountSchema } from "@workspace/validations";

interface AuthProps {
  mode:
    | "login"
    | "signup"
    | "forgot-password"
    | "verify-email"
    | "reset-password";
  className?: string;
}

export function AuthForm({ mode, className }: AuthProps) {
  const titles = {
    login: "Welcome back",
    signup: "Create your account",
    "forgot-password": "Forgot your password?",
    "verify-email": "Verify your email",
    "reset-password": "Reset your password",
  };

  const descriptions = {
    login: "Choose your preferred method to sign in to your account.",
    signup:
      "Start your newsletter journey with your preferred authentication method.",
    "forgot-password":
      "Enter your email and we’ll send you a password reset link.",
    "verify-email":
      "We’ve sent a verification link to your email. Please check your inbox.",
    "reset-password": "Enter your new password below.",
  };
  const isLogin = mode === "login";
  const isSignup = mode === "signup";
  const isForgot = mode === "forgot-password";
  const isVerify = mode === "verify-email";
  const isReset = mode === "reset-password";

  // fallback type for all possible inputs
  type BaseFormValues = {
    email?: string;
    password?: string;
    confirmPassword?: string;
  };

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<BaseFormValues>({
    mode: "onBlur",
  });

  // pick the correct schema
  const schema = isSignup ? createAccountSchema : isLogin ? loginSchema : null;

  // manual onBlur validation
  const handleBlur = async (
    e: React.FocusEvent<HTMLInputElement>,
    fieldName: keyof BaseFormValues
  ) => {
    if (!schema) return; // no schema for verify/reset/forgot
    const value = e.target.value;
    const currentData = { [fieldName]: value };

    const result = schema.safeParse(currentData);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === fieldName);
      if (issue) {
        setError(fieldName, { type: "manual", message: issue.message });
      }
    } else {
      clearErrors(fieldName);
    }
  };

  const onSubmit = (data: BaseFormValues) => {
    console.log("Form data:", data);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Card className="w-full max-w-md md:min-w-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{titles[mode]}</CardTitle>
          <CardDescription>{descriptions[mode]}</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              {(isLogin || isSignup) && (
                <>
                  <Field>
                    <Button variant="outline" type="button">
                      <GithubLogo />
                      Continue with Github
                    </Button>
                    <Button variant="outline" type="button">
                      <GoogleLogo />
                      Continue with Google
                    </Button>
                  </Field>

                  <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                    Or continue with
                  </FieldSeparator>
                </>
              )}

              {(isLogin || isSignup || isForgot || isReset) && (
                <>
                  {/* EMAIL */}
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      {...register("email")}
                      onBlur={(e) => handleBlur(e, "email")}
                      required
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </Field>

                  {/* PASSWORD */}
                  {(isLogin || isSignup || isReset) && (
                    <Field>
                      <div className="flex items-center">
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                        {isLogin && (
                          <Link
                            href="/forgot-password"
                            className="font-medium ml-auto text-sm underline-offset-4 hover:underline"
                          >
                            Forgot your password?
                          </Link>
                        )}
                      </div>
                      <Input
                        id="password"
                        type="password"
                        {...register("password")}
                        onBlur={(e) => handleBlur(e, "password")}
                        required
                      />
                      {errors.password && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.password.message}
                        </p>
                      )}
                    </Field>
                  )}

                  {isReset && (
                    <Field>
                      <FieldLabel htmlFor="confirm-password">
                        Confirm password
                      </FieldLabel>
                      <Input
                        id="confirm-password"
                        type="password"
                        {...register("confirmPassword")}
                        onBlur={(e) => handleBlur(e, "confirmPassword")}
                        required
                      />
                      {errors.confirmPassword && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.confirmPassword.message}
                        </p>
                      )}
                    </Field>
                  )}
                </>
              )}

              {/* VERIFY EMAIL */}
              {isVerify && (
                <FieldDescription className="text-center">
                  We’ve sent you an email with a verification link.
                  <br />
                  <Button
                    variant="link"
                    className="mt-2 h-auto p-0 font-medium"
                  >
                    Resend link
                  </Button>
                </FieldDescription>
              )}

              {/* SUBMIT */}
              {!isVerify && (
                <Field>
                  <Button type="submit" className="w-full">
                    {isLogin
                      ? "Login"
                      : isSignup
                        ? "Sign up"
                        : isForgot
                          ? "Send reset link"
                          : isReset
                            ? "Update password"
                            : "Continue"}
                  </Button>

                  {(isLogin || isSignup) && (
                    <FieldDescription className="text-center">
                      {isLogin ? (
                        <>
                          Don&apos;t have an account?{" "}
                          <Link href="/signup">Sign up</Link>
                        </>
                      ) : (
                        <>
                          Already have an account?{" "}
                          <Link href="/login">Sign in</Link>
                        </>
                      )}
                    </FieldDescription>
                  )}
                </Field>
              )}
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      {(isLogin || isSignup) && (
        <FieldDescription className="px-6 text-center">
          By clicking continue, you agree to our{" "}
          <Link href="/terms">Terms of Service</Link> and{" "}
          <Link href="/privacy">Privacy Policy</Link>.
        </FieldDescription>
      )}
    </div>
  );
}
