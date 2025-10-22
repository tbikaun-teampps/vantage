import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconCheck } from "@tabler/icons-react";
import { useProfile, useProfileActions } from "@/hooks/useProfile";
import { companyKeys } from "@/hooks/useCompany";
import type { SubscriptionTier } from "@/types";
import type { Company } from "@/types/company";
import { subscriptionPlans } from "@/components/account/subscription-data";
import { BRAND_COLORS } from "@/lib/brand";
import { companyRoutes } from "@/router/routes";
import { useCompanyAwareNavigate } from "@/hooks/useCompanyAwareNavigate";

export function SubscriptionOptions() {
  const { data: profile } = useProfile();
  const { updateProfile } = useProfileActions();
  const navigate = useCompanyAwareNavigate();
  const queryClient = useQueryClient();
  const [updatingTier, setUpdatingTier] = useState<SubscriptionTier | null>(
    null
  );

  const currentTier = profile?.subscription_tier || "demo";

  const handleSubscriptionChange = async (tier: SubscriptionTier) => {
    if (tier === currentTier || updatingTier) return;

    setUpdatingTier(tier);
    try {
      const plan = subscriptionPlans[tier];
      await updateProfile({
        subscription_tier: tier,
        subscription_features: plan.features,
      });

      // When switching to demo, refresh companies and select first demo company
      if (tier === "demo") {
        // Force refresh companies data
        await queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
        
        // Wait a moment for the data to refresh, then find and navigate to first demo company
        setTimeout(async () => {
          const updatedCompanies = queryClient.getQueryData(companyKeys.lists()) as Company[];
          const demoCompany = updatedCompanies?.find(company => company.is_demo === true);
          
          if (demoCompany) {
            navigate(companyRoutes.dashboard(demoCompany.id));
          }
        }, 100);
      }
    } catch (error) {
      console.error("Subscription update error:", error);
    } finally {
      setUpdatingTier(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(
          Object.entries(subscriptionPlans) as Array<
            [SubscriptionTier, typeof subscriptionPlans.demo]
          >
        ).map(([tier, plan]) => {
          const IconComponent = plan.icon;
          const isCurrentPlan = tier === currentTier;
          const isThisTierUpdating = updatingTier === tier;

          return (
            <Card
              key={tier}
              className={`relative transition-all duration-200 ${
                isCurrentPlan ? "shadow-lg" : "hover:shadow-md"
              }`}
              style={{
                outline: isCurrentPlan
                  ? `2px solid ${BRAND_COLORS.mediumPurple}`
                  : "none",
              }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full"
                    style={{ backgroundColor: plan.iconColor }}
                  >
                    <IconComponent className="h-4 w-4 text-white" />
                  </div>
                  {plan.name}
                  {isCurrentPlan && (
                    <Badge
                      variant="default"
                      className="bg-green-100 text-green-800 border-green-200"
                    >
                      Current Plan ✓
                    </Badge>
                  )}
                </CardTitle>
                <div className="text-sm font-medium text-muted-foreground">
                  {plan.subtitle}
                </div>
                <div
                  className="text-lg font-bold"
                  style={{ color: BRAND_COLORS.mediumPurple }}
                >
                  {plan.price}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-sm text-muted-foreground">
                  {plan.description}
                </CardDescription>
                <div className="space-y-2">
                  {plan.highlights.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <IconCheck className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4">
                  <Button
                    variant={isCurrentPlan ? "outline" : "default"}
                    onClick={() => handleSubscriptionChange(tier)}
                    disabled={isCurrentPlan || updatingTier !== null}
                    className="w-full"
                  >
                    {isThisTierUpdating
                      ? "Updating..."
                      : isCurrentPlan
                      ? "Current Plan"
                      : tier === "demo"
                      ? "Switch to Demo"
                      : "Upgrade Available"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
