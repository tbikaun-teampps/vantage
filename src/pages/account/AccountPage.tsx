import { DashboardPage } from "@/components/dashboard";
import { AccountContent } from "@/components/account";
import { usePageTitle } from "@/hooks/usePageTitle";

export function AccountPage() {
  usePageTitle("Account Settings");
  return (
    <DashboardPage
      title="Account Settings"
      description="Manage your account preferences and settings"
      showBack
      tourId="account-settings"
    >
      <AccountContent />
    </DashboardPage>
  );
}
