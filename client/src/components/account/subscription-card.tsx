import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconInfoCircle,
  IconStar,
  IconCrown,
  IconArrowRight,
} from "@tabler/icons-react";
import { routes } from "@/router/routes";
import { useProfile } from "@/hooks/useProfile";
import { useCompanyAwareNavigate } from "@/hooks/useCompanyAwareNavigate";

const getSubscriptionInfo = (tier: string) => {
  switch (tier) {
    case "demo":
      return {
        name: "Demo",
        icon: IconInfoCircle,
        color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
      };
    case "consultant":
      return {
        name: "Consultant",
        icon: IconStar,
        color:
          "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
      };
    case "enterprise":
      return {
        name: "Enterprise",
        icon: IconCrown,
        color:
          "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
      };
    default:
      return {
        name: "Demo",
        icon: IconInfoCircle,
        color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
      };
  }
};

export function SubscriptionCard() {
  const { data: profile } = useProfile();
  const navigate = useCompanyAwareNavigate();

  const subscriptionTier = profile?.subscription_tier || "demo";
  const subscriptionInfo = getSubscriptionInfo(subscriptionTier);
  const IconComponent = subscriptionInfo.icon;

  const handleManageSubscription = () => {
    navigate(routes.accountSubscription);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconComponent className="h-5 w-5" />
            <CardTitle>Subscription</CardTitle>
          </div>
          <Badge className={`text-sm px-3 py-1 ${subscriptionInfo.color}`}>
            {subscriptionInfo.name}
          </Badge>
        </div>
        <CardDescription>
          Manage your subscription plan and billing preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">
              Current Plan: {subscriptionInfo.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {subscriptionTier === "demo" &&
                "Explore Vantage with sample data"}
              {subscriptionTier === "consultant" &&
                "Professional access for consultants"}
              {subscriptionTier === "enterprise" &&
                "Full platform access with advanced features"}
            </p>
          </div>
          <Button
            onClick={handleManageSubscription}
            className="flex items-center gap-2"
          >
            Manage Plan
            <IconArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
