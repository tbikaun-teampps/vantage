import { DataTable } from "@/components/data-table/data-table";
import { createMeasurementInstancesColumns } from "./measurement-instances-table-columns";
import { Loader2 } from "lucide-react";
import { useCanAdmin } from "@/hooks/useUserCompanyRole";
import type {
  AssessmentMeasurementInstance,
  GetAssessmentMeasurementsResponseData,
} from "@/types/api/assessments";

interface MeasurementInstancesTableProps {
  instances: GetAssessmentMeasurementsResponseData | null;
  isLoading: boolean;
  onEdit: (instance: AssessmentMeasurementInstance) => void;
  onDelete: (instance: AssessmentMeasurementInstance) => void;
  onRowClick?: (instance: AssessmentMeasurementInstance) => void;
}

export function MeasurementInstancesTable({
  instances,
  isLoading,
  onEdit,
  onDelete,
  onRowClick,
}: MeasurementInstancesTableProps) {
  const userCanAdmin = useCanAdmin();
  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  const columns = createMeasurementInstancesColumns(
    onEdit,
    onDelete,
    userCanAdmin
  );

  return (
    <div className="w-full">
      <DataTable
        data={instances || []}
        columns={columns}
        getRowId={(instance) => instance.id.toString()}
        enableRowSelection={false}
        tabs={[{ value: "all", label: "All Measurements" }]}
        defaultTab="all"
        enableSorting={true}
        defaultPageSize={10}
        showFiltersButton={false}
        onRowClick={onRowClick}
        getEmptyStateContent={() => ({
          title: "No Measurements Configured",
          description:
            "Add measurements from the 'Browse Available' tab to start tracking data for this assessment",
        })}
      />
    </div>
  );
}
