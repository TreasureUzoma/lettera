export type Plan = {
  tier: number;
  name: string;
  subscribers: number | null;
  price: number | null;
  priceLabel: string;
  overage: number | null;
  description: string;
  features: string[];
};

export type PricingResult = {
  plan: Plan;
  totalPrice: number | null;
  overageCount: number;
  overagePrice: number;
};

export const plans: Plan[] = [
  {
    tier: 0,
    name: "hobby",
    subscribers: 100,
    price: 0,
    priceLabel: "free",
    overage: null,
    description: "perfect for getting started",
    features: [
      "up to 100 subscribers",
      "unlimited emails",
      "basic analytics",
      "email support",
    ],
  },
  {
    tier: 1,
    name: "professional",
    subscribers: 2500,
    price: 9,
    priceLabel: "$9",
    overage: 0.1,
    description: "for growing newsletters",
    features: [
      "up to 2,500 subscribers",
      "unlimited emails",
      "advanced analytics",
      "priority support",
      "custom domain",
      "remove branding",
    ],
  },
  {
    tier: 2,
    name: "business",
    subscribers: 10000,
    price: 29,
    priceLabel: "$29",
    overage: 0.08,
    description: "for established creators",
    features: [
      "up to 10,000 subscribers",
      "unlimited emails",
      "advanced analytics",
      "priority support",
      "custom domain",
      "remove branding",
      "api access",
      "team collaboration",
    ],
  },
  {
    tier: 3,
    name: "enterprise",
    subscribers: null,
    price: null,
    priceLabel: "custom",
    overage: null,
    description: "for large organizations",
    features: [
      "unlimited subscribers",
      "unlimited emails",
      "advanced analytics",
      "dedicated support",
      "custom domain",
      "remove branding",
      "api access",
      "team collaboration",
      "sla guarantee",
      "custom integrations",
    ],
  },
];
