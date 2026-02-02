import { usePageTitle } from "@/hooks/usePageTitle";
import { GridLayout } from "@/components/dashboard/grid-layout";

export function DashboardPage() {
  usePageTitle("Dashboard");
  return <GridLayout />;
}
