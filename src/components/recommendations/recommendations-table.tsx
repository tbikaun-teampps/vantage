import * as React from "react";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";
import { useRecommendations } from "@/hooks/useRecommendations";
import {
  SimpleDataTable,
  type SimpleDataTableTab,
} from "@/components/simple-data-table";
import { createRecommendationsColumns } from "./columns";

export function RecommendationsTable() {
  const companyId = useCompanyFromUrl();
  const { data: recommendations = [], isLoading } = useRecommendations(
    companyId || ""
  );

  // Create columns
  const columns = React.useMemo(() => createRecommendationsColumns(), []);

  // Create tabs configuration with filtering
  const tabs: SimpleDataTableTab[] = React.useMemo(
    () => [
      {
        value: "all",
        label: "All Recommendations",
        data: recommendations,
        emptyStateTitle: "No recommendations found",
        emptyStateDescription: "No recommendations have been created yet.",
      },
      {
        value: "not_started",
        label: "Not Started",
        data: recommendations.filter((r) => r.status === "not_started"),
        emptyStateTitle: "No pending recommendations",
        emptyStateDescription:
          "All recommendations have been started or completed.",
      },
      {
        value: "in_progress",
        label: "In Progress",
        data: recommendations.filter((r) => r.status === "in_progress"),
        emptyStateTitle: "No active recommendations",
        emptyStateDescription: "No recommendations are currently in progress.",
      },
      {
        value: "completed",
        label: "Completed",
        data: recommendations.filter((r) => r.status === "completed"),
        emptyStateTitle: "No completed recommendations",
        emptyStateDescription: "No recommendations have been completed yet.",
      },
      {
        value: "high_priority",
        label: "High Priority",
        data: recommendations.filter((r) => r.priority === "high"),
        emptyStateTitle: "No high priority recommendations",
        emptyStateDescription: "No high priority recommendations found.",
      },
    ],
    [recommendations]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="text-lg font-semibold">
            Loading recommendations...
          </div>
          <div className="text-sm text-muted-foreground">
            Fetching recommendations
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-auto p-6">
      <SimpleDataTable
        data={recommendations}
        columns={columns}
        getRowId={(row) => `recommendation-${row.id}`}
        tabs={tabs}
        defaultTab="all"
        enableSorting={true}
        enableFilters={true}
        enableColumnVisibility={true}
        filterPlaceholder="Search recommendations..."
      />
    </div>
  );
}
