"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Check } from "lucide-react";
import { plans } from "@workspace/constants/plans";
import type { PricingResult } from "@workspace/constants/plans";
import Link from "next/link";
import { meta } from "@workspace/constants/meta";

function calculatePricing(subscriberCount: number): PricingResult {
  if (subscriberCount <= 100)
    return { plan: plans[0]!, totalPrice: 0, overageCount: 0, overagePrice: 0 };

  if (subscriberCount <= 2500) {
    const overage = Math.max(0, subscriberCount - 2500);
    const overagePrice = (overage / 1000) * plans[1]!.overage!;
    return {
      plan: plans[1]!,
      totalPrice: plans[1]!.price! + overagePrice,
      overageCount: overage,
      overagePrice,
    };
  }

  if (subscriberCount <= 10000) {
    const overage = Math.max(0, subscriberCount - 10000);
    const overagePrice = (overage / 1000) * plans[2]!.overage!;
    return {
      plan: plans[2]!,
      totalPrice: plans[2]!.price! + overagePrice,
      overageCount: overage,
      overagePrice,
    };
  }

  return {
    plan: plans[3]!,
    totalPrice: null,
    overageCount: 0,
    overagePrice: 0,
  };
}

export function Pricings() {
  const [subscriberCount, setSubscriberCount] = useState(1000);
  const [inputValue, setInputValue] = useState("1000");

  const pricing = calculatePricing(subscriberCount);
  const plan = pricing.plan;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    if (value.length > 1 && value.startsWith("0")) {
      value = value.replace(/^0+/, "");
    } else if (value.length === 0) {
      value = "0";
    }

    setInputValue(value);

    const numValue = Number(value);
    setSubscriberCount(Math.max(0, numValue));
  };

  return (
    <section
      className="w-full max-w-3xl mx-auto p-4 md:py-5 space-y-8"
      id="pricing"
    >
      <div className="text-center space-y-4">
        <h3 className="text-3xl md:text-4xl font-bold text-balance">
          simple, transparent pricing
        </h3>
        <p className="text-lg text-muted-foreground text-balance">
          enter your subscriber count to see your pricing
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="subscribers" className="text-sm font-medium">
          about how many subscribers do you have?
        </label>
        <Input
          id="subscribers"
          type="number"
          min={0}
          value={inputValue}
          onChange={handleInputChange}
          placeholder="enter subscriber count"
          className="text-lg h-12"
        />
      </div>

      <Card className="border-2 border-primary shadow-lg">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl">{plan.name}</CardTitle>
              <CardDescription className="text-base mt-2">
                {plan.description}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-xl md:text-4xl font-bold">
                {pricing.totalPrice !== null
                  ? `$${pricing.totalPrice.toFixed(2)}`
                  : "custom"}
              </div>
              {pricing.totalPrice !== null && (
                <div className="text-sm text-muted-foreground">per month</div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {pricing.overageCount > 0 && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  base price ({plan.subscribers!.toLocaleString()} subscribers)
                </span>
                <span className="font-medium">${plan.price!}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>
                  extra subscribers ({pricing.overageCount.toLocaleString()} × $
                  {plan.overage!.toFixed(2)}/1k)
                </span>
                <span className="font-medium md:text-sm">
                  ${pricing.overagePrice.toFixed(2)}
                </span>
              </div>
              <div className="pt-2 border-t flex justify-between font-medium">
                <span>total</span>
                <span>${pricing.totalPrice!.toFixed(2)}/month</span>
              </div>
            </div>
          )}

          {plan.overage !== null && pricing.overageCount === 0 && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium">
                + ${plan.overage.toFixed(2)} per 1,000 extra subscribers
              </p>
            </div>
          )}

          <div className="space-y-3">
            {plan.features.map((feature, i) => (
              <div key={i} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>

        <CardFooter>
          <Button asChild className="w-full" size="lg">
            <Link
              href={
                plan.name === "enterprise"
                  ? `mailto:${meta.salesEmail}?subject=Enterprise Inquiry`
                  : `/billings/subscribe?plan=${plan.name}`
              }
            >
              {pricing.totalPrice === null ? "contact sales" : "get started"}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
}
