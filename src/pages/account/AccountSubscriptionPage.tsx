import { usePageTitle } from "@/hooks/usePageTitle";
import { SubscriptionOptions } from "@/components/account/subscription-options";
import { DashboardPage } from "@/components/dashboard";

export function AccountSubscriptionPage() {
  usePageTitle("Subscription");
  return (
    <DashboardPage
      title="Subscription"
      description="Manage your subscription"
      backHref="/account"
      showBack
    >
      <SubscriptionOptions />
    </DashboardPage>
  );
}
