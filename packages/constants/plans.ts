export type Plan = {
  tier: number;
  slug: string;
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
    slug: "hobby",
    name: "hobby",
    subscribers: 100,
    price: 0,
    priceLabel: "free",
    overage: null,
    description: "perfect for getting started or testing your first newsletter",
    features: ["up to 100 subscribers", "basic analytics", "email support"],
  },
  {
    tier: 1,
    slug: "professional",
    name: "professional",
    subscribers: 2500,
    price: 9,
    priceLabel: "$9",
    overage: 0.1,
    description: "for creators growing a serious audience",
    features: [
      "up to 2,500 subscribers",
      "advanced analytics",
      "priority support",
      "custom domain",
      "remove branding",
      "add members to project",
    ],
  },
  {
    tier: 2,
    slug: "business",
    name: "business",
    subscribers: 10000,
    price: 29,
    priceLabel: "$29",
    overage: 0.08,
    description: "for established newsletters and small teams",
    features: [
      "up to 10,000 subscribers",
      "advanced analytics",
      "priority support",
      "custom domain",
      "remove branding",
      "api access",
      "team collaboration",
      "add members to project",
      "project transfer between teams",
    ],
  },
  {
    tier: 3,
    slug: "enterprise",
    name: "enterprise",
    subscribers: null,
    price: null,
    priceLabel: "custom",
    overage: null,
    description: "for large organizations with advanced requirements",
    features: [
      "unlimited subscribers",
      "advanced analytics",
      "dedicated support",
      "custom domain",
      "remove branding",
      "api access",
      "team collaboration",
      "add members to project",
      "project transfer between teams",
      "sla guarantee",
      "custom integrations",
    ],
  },
];
