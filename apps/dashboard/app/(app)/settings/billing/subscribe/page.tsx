"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { plans } from "@workspace/constants/plans";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useGetProfile } from "@/hooks/use-auth";
import { SettingsLayout } from "../../components/settings-layout";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";

export default function SubscribePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planSlug = searchParams.get("plan");
  const { data: profile, isLoading: profileLoading } = useGetProfile();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const selectedPlan = plans.find((p) => p.slug === planSlug);
  const currentPlan = plans.find((p) => p.slug === profile?.plan) || plans[0];

  // Redirect if no plan selected or invalid plan
  useEffect(() => {
    if (!planSlug || !selectedPlan) {
      router.push("/settings/billing");
    }
  }, [planSlug, selectedPlan, router]);

  // Redirect if already on this plan
  useEffect(() => {
    if (profile && selectedPlan && profile.plan === selectedPlan.slug) {
      router.push("/settings/billing");
    }
  }, [profile, selectedPlan, router]);

  const handleSubscribe = async () => {
    if (!selectedPlan) return;

    setIsProcessing(true);
    setError(null);

    try {
      // TODO: Integrate with Stripe
      // For now, this is a placeholder
      console.log("Subscribing to plan:", selectedPlan.slug);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setSuccess(true);

      // Redirect after success
      setTimeout(() => {
        router.push("/settings/billing");
        router.refresh();
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to process subscription"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (profileLoading || !selectedPlan) {
    return (
      <SettingsLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </SettingsLayout>
    );
  }

  const isUpgrade = selectedPlan.tier > (currentPlan?.tier || 0);
  const isDowngrade = selectedPlan.tier < (currentPlan?.tier || 0);

  return (
    <SettingsLayout>
      <div className="max-w-2xl space-y-6">
        {/* Plan Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Confirm Subscription</CardTitle>
            <CardDescription>
              Review your subscription details before proceeding
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Plan */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Current Plan
              </p>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="capitalize font-medium">{currentPlan.name}</span>
                <span className="text-sm text-muted-foreground">
                  {currentPlan.price === 0
                    ? "Free"
                    : `$${currentPlan.price}/month`}
                </span>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <div className="text-muted-foreground">↓</div>
            </div>

            {/* New Plan */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                New Plan
              </p>
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
                <span className="capitalize font-medium">{selectedPlan.name}</span>
                <span className="text-sm font-semibold">
                  {selectedPlan.price === 0
                    ? "Free"
                    : `$${selectedPlan.price}/month`}
                </span>
              </div>
            </div>

            {/* Plan Features */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Features
              </p>
              <ul className="space-y-2">
                {selectedPlan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Billing Info */}
            {selectedPlan.price !== 0 && (
              <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                <p className="text-sm">
                  <span className="text-muted-foreground">Billing: </span>
                  <span className="font-medium">Monthly</span>
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Amount: </span>
                  <span className="font-medium">${selectedPlan.price}/month</span>
                </p>
                {selectedPlan.overage && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Overage: </span>
                    <span className="font-medium">
                      ${selectedPlan.overage} per subscriber
                    </span>
                  </p>
                )}
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Success Alert */}
            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Subscription updated successfully! Redirecting...
                </AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => router.back()}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubscribe}
                disabled={isProcessing || success}
                className="flex-1"
              >
                {isProcessing && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {success
                  ? "Subscription Updated"
                  : isUpgrade
                    ? "Upgrade Now"
                    : isDowngrade
                      ? "Downgrade"
                      : "Subscribe"}
              </Button>
            </div>

            {/* Info Text */}
            <p className="text-xs text-muted-foreground text-center">
              {isUpgrade && "Your new plan will be active immediately."}
              {isDowngrade &&
                "Your plan will be downgraded at the end of your current billing cycle."}
              {!isUpgrade &&
                !isDowngrade &&
                "Your subscription will be updated immediately."}
            </p>
          </CardContent>
        </Card>

        {/* TODO Notice */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Stripe integration coming soon. This is a preview of the subscription flow.
          </AlertDescription>
        </Alert>
      </div>
    </SettingsLayout>
  );
}
