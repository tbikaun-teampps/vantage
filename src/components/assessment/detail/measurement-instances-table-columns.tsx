import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import type { EnrichedMeasurementInstance } from "../../../types/assessment-measurements";
import { formatDistance } from "date-fns";

// Create measurement instances table columns
export function createMeasurementInstancesColumns(
  onEdit: (instance: EnrichedMeasurementInstance) => void,
  onDelete: (instance: EnrichedMeasurementInstance) => void,
  showActions: boolean = true
): ColumnDef<EnrichedMeasurementInstance>[] {
  const baseColumns: ColumnDef<EnrichedMeasurementInstance>[] = [
    {
      accessorKey: "measurement_name",
      header: "Measurement",
      cell: ({ row }) => (
        <div className="capitalize font-medium" key={row.original.id}>
          {row.original.measurement_name.replaceAll("_", " ")}
        </div>
      ),
    },
    {
      id: "business_unit",
      header: "Business Unit",
      cell: ({ row }) => (
        <div className="text-sm" key={row.original.id}>
          {row.original.business_unit?.name || "-"}
        </div>
      ),
    },
    {
      id: "region",
      header: "Region",
      cell: ({ row }) => (
        <div className="text-sm" key={row.original.id}>
          {row.original.region?.name || "-"}
        </div>
      ),
    },
    {
      id: "site",
      header: "Site",
      cell: ({ row }) => (
        <div className="text-sm" key={row.original.id}>
          {row.original.site?.name || "-"}
        </div>
      ),
    },
    {
      id: "asset_group",
      header: "Asset Group",
      cell: ({ row }) => (
        <div className="text-sm" key={row.original.id}>
          {row.original.asset_group?.name || "-"}
        </div>
      ),
    },
    {
      id: "work_group",
      header: "Work Group",
      cell: ({ row }) => (
        <div className="text-sm" key={row.original.id}>
          {row.original.work_group?.name || "-"}
        </div>
      ),
    },
    {
      id: "role",
      header: "Role",
      cell: ({ row }) => (
        <div className="text-sm" key={row.original.id}>
          {row.original.role?.name || "-"}
        </div>
      ),
    },
    {
      accessorKey: "calculated_value",
      header: () => <div className="text-center">Value</div>,
      cell: ({ row }) => (
        <div className="text-sm text-center font-medium" key={row.original.id}>
          {row.original.calculated_value}
        </div>
      ),
    },
    {
      accessorKey: "updated_at",
      header: () => <div>Last Updated</div>,
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground" key={row.original.id}>
          {formatDistance(new Date(row.original.updated_at), new Date(), {
            addSuffix: true,
          })}
        </div>
      ),
    },
  ];

  if (!showActions) {
    return baseColumns;
  }

  return [
    ...baseColumns,
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div
          className="flex items-center justify-end gap-2"
          key={row.original.id}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(row.original);
            }}
          >
            <IconEdit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(row.original);
            }}
          >
            <IconTrash className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];
}
