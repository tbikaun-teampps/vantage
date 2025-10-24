import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  IconLoader2,
  IconCalendar,
  IconPlus,
  IconInfoCircle,
  IconTrash,
} from "@tabler/icons-react";
import {
  useProgramPhaseCalculatedMeasurements,
  useDeleteProgramPhaseMeasurementData,
} from "@/hooks/useProgram";
import { MeasurementsDataDialog } from "@/components/measurements/measurements-data-dialog";
import { formatDistanceToNow } from "date-fns";
import { SimpleDataTable } from "@/components/simple-data-table";
// import type { CalculatedMetricWithDefinition } from "@/lib/supabase/metrics-service";
import { Card, CardHeader, CardContent } from "../ui/card";

interface CalculatedMeasurementsProps {
  programId: number;
  programPhaseId: number;
  title?: string;
  description?: string;
  showEmpty?: boolean;
}

export function CalculatedMeasurements({
  programId,
  programPhaseId,
  title = "Calculated Metrics",
  description = "Current metric values for this phase",
  showEmpty = true,
}: CalculatedMeasurementsProps) {
  const { data: calculatedMeasurements, isLoading } =
    useProgramPhaseCalculatedMeasurements(programId, programPhaseId);
  const deleteMutation = useDeleteProgramPhaseMeasurementData();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [measurementToDelete, setMeasurementToDelete] = useState(null);

  const handleDeleteClick = (measurement) => {
    setMeasurementToDelete(measurement);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!measurementToDelete) return;
    try {
      await deleteMutation.mutate({
        programId,
        programPhaseId,
        measurementId: measurementToDelete.id,
      });
      setDeleteConfirmOpen(false);
      setMeasurementToDelete(null);
    } catch (error) {
      console.error("Failed to delete calculated measurement:", error);
    }
  };

  // Create column definitions with useCallback for formatValue
  const columns: ColumnDef<CalculatedMeasurementWithDefinition>[] = [
    {
      id: "measurement_name",
      header: "Measurement Name",
      cell: ({ row }) => {
        const measurement = row.original;
        return (
          <div className="font-medium">
            {measurement.measurement_definition.name}
          </div>
        );
      },
    },
    {
      accessorKey: "calculated_value",
      header: "Value",
      cell: ({ row }) => {
        const value = row.getValue("calculated_value") as number;
        return <div className="">{value}</div>;
      },
    },
    {
      accessorKey: "data_source",
      header: "Data Source",
      cell: ({ row }) => {
        const dataSource = row.getValue("data_source") as string;
        if (!dataSource) return null;
        return (
          <Badge className="capitalize">
            {dataSource.replaceAll("_", " ")}
          </Badge>
        );
      },
    },
    {
      id: "organizational_context",
      header: "Context",
      cell: ({ row }) => {
        const measurement = row.original;
        const contexts = [
          measurement.business_unit_id && {
            label: "Business Unit",
            value: String(measurement.business_unit_id),
          },
          measurement.region_id && {
            label: "Region",
            value: String(measurement.region_id),
          },
          measurement.site_id && {
            label: "Site",
            value: String(measurement.site_id),
          },
          measurement.asset_group_id && {
            label: "Asset Group",
            value: String(measurement.asset_group_id),
          },
          measurement.work_group_id && {
            label: "Work Group",
            value: String(measurement.work_group_id),
          },
          measurement.role_id && {
            label: "Role",
            value: String(measurement.role_id),
          },
        ].filter(Boolean) as { label: string; value: string }[];

        if (contexts.length === 0) return "-";

        return (
          <div className="flex flex-wrap gap-1">
            {contexts.slice(0, 2).map((context) => (
              <Badge key={context.label} variant="outline" className="text-xs">
                {context.label}: {context.value}
              </Badge>
            ))}
            {contexts.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{contexts.length - 2} more
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      id: "metadata",
      header: "Details",
      cell: ({ row }) => {
        const measurement = row.original;
        if (!measurement.calculation_metadata) return "-";

        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <IconInfoCircle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <div className="space-y-1">
                  <div className="text-xs font-medium">Calculation Details</div>
                  <pre className="text-xs whitespace-pre-wrap">
                    {JSON.stringify(measurement.calculation_metadata, null, 2)}
                  </pre>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Last Updated",
      cell: ({ row }) => {
        const createdAt = row.getValue("created_at") as string;
        return (
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <IconCalendar className="h-4 w-4" />
            <span>
              {formatDistanceToNow(new Date(createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const measurement = row.original;
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteClick(measurement)}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          >
            <IconTrash className="h-4 w-4" />
          </Button>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <IconLoader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading calculated measurements...</span>
      </div>
    );
  }

  if (!calculatedMeasurements || calculatedMeasurements.length === 0) {
    if (!showEmpty) return null;
  }

  return (
    <Card className="shadow-none border-none">
      <CardHeader>
        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardHeader>

      <CardContent>
        <SimpleDataTable
          data={calculatedMeasurements || []}
          columns={columns}
          getRowId={(row) => row.id.toString()}
          enableSorting={true}
          enableFilters={true}
          enableColumnVisibility={true}
          filterPlaceholder="Filter measurements..."
          primaryAction={
            programId
              ? {
                  label: "Add Data",
                  icon: IconPlus,
                  onClick: () => setIsSheetOpen(true),
                }
              : undefined
          }
          defaultPageSize={20}
        />
      </CardContent>

      {programId && (
        <MeasurementsDataDialog
          open={isSheetOpen}
          onOpenChange={setIsSheetOpen}
          programId={programId}
          programPhaseId={programPhaseId}
        />
      )}

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Calculated Metric</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the calculated measurement "
              {measurementToDelete?.measurement_definition.name}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
