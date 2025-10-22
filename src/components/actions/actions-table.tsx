import * as React from "react";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";
import { useActions } from "@/hooks/useActions";
import { useCompanyRoutes } from "@/hooks/useCompanyRoutes";
import {
  SimpleDataTable,
  type SimpleDataTableTab,
} from "@/components/simple-data-table";
import { createActionsColumns } from "./columns";

export function ActionsTable() {
  const companyId = useCompanyFromUrl();
  const { data: actions = [], isLoading } = useActions(companyId || "");
  const routes = useCompanyRoutes();

  // Create columns with routes
  const columns = React.useMemo(() => createActionsColumns(routes), [routes]);

  // Create tabs configuration
  const tabs: SimpleDataTableTab[] = React.useMemo(
    () => [
      {
        value: "all",
        label: "All Actions",
        data: actions,
        emptyStateTitle: "No actions found",
        emptyStateDescription: "No action items have been created yet.",
      },
    ],
    [actions]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="text-lg font-semibold">Loading actions...</div>
          <div className="text-sm text-muted-foreground">
            Fetching action items
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-auto p-6">
      <SimpleDataTable
        data={actions}
        columns={columns}
        getRowId={(row) => `action-${row.id}`}
        tabs={tabs}
        defaultTab="all"
        enableSorting={true}
        enableFilters={true}
        enableColumnVisibility={true}
        filterPlaceholder="Search actions..."
      />
    </div>
  );
}
