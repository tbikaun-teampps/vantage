import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import type { SubscriptionTier } from "@/types/auth";
import { subscriptionPlans } from "@/pages/account/subscription/components/data";
import { BRAND_COLORS } from "@/lib/brand";
import { useCompanyAwareNavigate } from "@/hooks/useCompanyAwareNavigate";

interface SubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubscriptionModal({
  open,
  onOpenChange,
}: SubscriptionModalProps) {
  const { data: profile } = useProfile();
  const { updateProfile } = useProfileActions();
  const navigate = useCompanyAwareNavigate();
  const [updatingTier, setUpdatingTier] = useState<SubscriptionTier | null>(
    null
  );

  const currentTier = profile?.subscription_tier || "demo";

  const handleSubscriptionChange = async (tier: SubscriptionTier) => {
    if (tier === currentTier || updatingTier) return;

    setUpdatingTier(tier);
    try {
      const plan = subscriptionPlans[tier];
      // updateProfile now handles session refetch internally
      await updateProfile({
        subscription_tier: tier,
        subscription_features: plan.features,
      });

      // Redirect to select-company page after any subscription change
      navigate("/select-company");

      // Close modal after successful update
      onOpenChange(false);
    } catch (error) {
      console.error("Subscription update error:", error);
    } finally {
      setUpdatingTier(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Subscription</DialogTitle>
          <DialogDescription>
            Choose the plan that best fits your needs
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
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
                        Current ✓
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
      </DialogContent>
    </Dialog>
  );
}
