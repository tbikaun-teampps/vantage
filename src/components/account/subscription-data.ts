import { IconCrown, IconInfoCircle, IconStar } from "@tabler/icons-react";
import { BRAND_COLORS } from "@/lib/brand";
import type { SubscriptionPlan, SubscriptionTier } from "@/types/auth";

export const subscriptionPlans: Record<
  Exclude<SubscriptionTier, "interviewee">,
  SubscriptionPlan
> = {
  demo: {
    name: "Demo",
    icon: IconInfoCircle,
    iconColor: BRAND_COLORS.royalBlue,
    price: "Free",
    subtitle: "Exploring Vantage",
    description: "Read-only access with sample data",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    features: {
      maxCompanies: 1,
    },
    highlights: ["Full platform exploration", "All features available to test"],
  },
  consultant: {
    name: "Consultant",
    icon: IconStar,
    iconColor: BRAND_COLORS.mediumPurple,
    price: "Custom",
    subtitle: "Work with Your Own Data",
    description: "Perfect for consultants and agencies",
    color:
      "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    features: {
      maxCompanies: 999,
    },
    highlights: [
      "Upload and analyze your own data",
      "Manage multiple client companies",
      "Create and distribute interviews",
      "Conduct onsite and desktop assessments",
      "Full feature access",
    ],
  },
  enterprise: {
    name: "Enterprise",
    icon: IconCrown,
    iconColor: BRAND_COLORS.pinkFlamingo,
    price: "Custom",
    subtitle: "For Your Organization",
    description: "Perfect for large organizations and internal teams",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    features: {
      maxCompanies: 1,
    },
    highlights: [
      "Your company data with unlimited users",
      "Real-time database connections",
      "All assessment types (onsite, desktop, database-connected)",
      "Complete organizational deployment",
      "Dedicated company environment",
    ],
  },
};
