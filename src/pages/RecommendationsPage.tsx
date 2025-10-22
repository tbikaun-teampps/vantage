import { usePageTitle } from "@/hooks/usePageTitle";
import { RecommendationsTable } from "@/components/recommendations/recommendations-table";
import { DashboardPage } from "@/components/dashboard";

export function RecommendationsPage() {
  usePageTitle("Recommendations");

  return (
    <DashboardPage
      title="Recommendations"
      description="Review and manage recommendations"
      showBack
    >
      <RecommendationsTable />
    </DashboardPage>
  );
}
