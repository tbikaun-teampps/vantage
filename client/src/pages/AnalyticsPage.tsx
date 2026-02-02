import { usePageTitle } from "@/hooks/usePageTitle";
import { DashboardPage } from "@/components/dashboard";
import { TabSwitcher } from "@/components/analytics/page-components/tab-switcher";
import { GeographyView } from "@/components/analytics/page-components/geography-view";
import AssessmentHeatmap from "@/components/analytics/heatmap";
import { AnalyticsProvider, useAnalytics } from "@/contexts/AnalyticsContext";

function AnalyticsPageContent() {
  const { activeView } = useAnalytics();

  return (
    <DashboardPage
      title="Analytics"
      description="Performance metrics and geographic distribution analysis"
      headerActions={<TabSwitcher />}
      tourId="analytics-main"
    >
      {activeView === "metrics" ? <AssessmentHeatmap /> : <GeographyView />}
    </DashboardPage>
  );
}

export function AnalyticsPage() {
  usePageTitle("Analytics");

  return (
    <AnalyticsProvider>
      <AnalyticsPageContent />
    </AnalyticsProvider>
  );
}
