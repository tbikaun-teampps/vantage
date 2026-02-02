import { usePageTitle } from "@/hooks/usePageTitle";
import { ActionsTable } from "@/components/actions/actions-table";
import { DashboardPage } from "@/components/dashboard";

export function ActionsPage() {
  usePageTitle("Actions");
  return (
    <DashboardPage
      title="Actions"
      description="Review and manage action items"
      showBack
    >
      <ActionsTable />
    </DashboardPage>
  );
}
