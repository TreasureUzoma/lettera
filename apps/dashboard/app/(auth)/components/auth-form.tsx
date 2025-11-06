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
import { useLoginMutation, useSignupMutation } from "@/hooks/use-auth";
import { getAuthButtonLabel } from "../utils/labels";
import { ErrorParagraph } from "@workspace/ui/components/error-message";

export interface AuthProps {
  mode:
    | "login"
    | "signup"
    | "forgot-password"
    | "verify-email"
    | "reset-password";
  className?: string;
}

export function AuthForm({ mode, className }: AuthProps) {
  const { mutate: loginMutate, isPending: loginPending } = useLoginMutation();
  const { mutate: signupMutate, isPending: signupPending } =
    useSignupMutation();

  const isPending = loginPending || signupPending;

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
    name?: string;
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

  const schema = isSignup ? createAccountSchema : isLogin ? loginSchema : null;

  const handleBlur = async (
    e: React.FocusEvent<HTMLInputElement>,
    fieldName: keyof BaseFormValues
  ) => {
    if (!schema) return; // no schema for verify/reset/forgot yet
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
    if (schema) {
      const result = schema.safeParse(data);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          setError(issue.path[0] as keyof BaseFormValues, {
            type: "manual",
            message: issue.message,
          });
        });
        return; // stop submission
      }
    }

    if (mode === "login") {
      const payload = {
        email: data.email!,
        password: data.password!,
      };
      loginMutate(payload);
    } else if (mode === "signup") {
      const payload = {
        name: data.name!,
        email: data.email!,
        password: data.password!,
      };
      signupMutate(payload);
    } else if (mode === "forgot-password") {
    } else if (mode === "reset-password") {
    } else if (mode === "verify-email") {
    }
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
                  {isSignup && (
                    <Field>
                      <FieldLabel htmlFor="name">Full Name</FieldLabel>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Full Name"
                        {...register("name")}
                        onBlur={(e) => handleBlur(e, "name")}
                        required
                      />
                      {errors.name && (
                        <ErrorParagraph>{errors.name.message}</ErrorParagraph>
                      )}
                    </Field>
                  )}

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
                      <ErrorParagraph>{errors.email.message}</ErrorParagraph>
                    )}
                  </Field>

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
                        <ErrorParagraph>
                          {errors.password.message}
                        </ErrorParagraph>
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
                        <ErrorParagraph>
                          {errors.confirmPassword.message}
                        </ErrorParagraph>
                      )}
                    </Field>
                  )}
                </>
              )}

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

              {!isVerify && (
                <Field>
                  <Button type="submit" className="w-full" disabled={isPending}>
                    {getAuthButtonLabel({ mode, isPending })}
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
