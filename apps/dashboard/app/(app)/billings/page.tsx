"use client";

import { plans } from "@workspace/constants/plans";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Check } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

export default function BillingsPage() {
  return (
    <div className="container max-w-6xl py-10 space-y-10">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Simple, usage-based pricing
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Choose the plan that's right for your audience. All plans include our
          core features.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.slug}
            className={cn(
              "flex flex-col relative",
              plan.slug === "professional" &&
                "border-primary shadow-lg scale-105 z-10"
            )}
          >
            {plan.slug === "professional" && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                Most Popular
              </div>
            )}
            <CardHeader>
              <CardTitle className="capitalize">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-6">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">{plan.priceLabel}</span>
                {plan.price !== null && (
                  <span className="text-muted-foreground">/month</span>
                )}
              </div>

              <ul className="space-y-2 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={plan.slug === "professional" ? "default" : "outline"}
              >
                {plan.price === 0 ? "Current Plan" : "Upgrade"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/50 border-dashed">
        <CardContent className="py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Looking for something else?{" "}
            <Button variant="link" className="p-0 h-auto">
              Contact us for custom requirements
            </Button>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
