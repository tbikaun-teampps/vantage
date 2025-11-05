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
  IconLoader2,
  IconPlus,
  IconTrash,
  IconEdit,
} from "@tabler/icons-react";
import {
  useProgramPhaseCalculatedMeasurements,
  useDeleteProgramPhaseMeasurementData,
  useProgramAllowedMeasurementDefinitions,
} from "@/hooks/useProgram";
import { MeasurementsDataDialog } from "@/components/measurements/measurements-data-dialog";
import { EditCalculatedMeasurementDialog } from "@/components/measurements/edit-calculated-measurement-dialog";
import { formatDistanceToNow } from "date-fns";
import { SimpleDataTable } from "@/components/simple-data-table";
import { Card, CardHeader, CardContent } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";

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
  showEmpty = false,
}: CalculatedMeasurementsProps) {
  const { data: calculatedMeasurements, isLoading } =
    useProgramPhaseCalculatedMeasurements(programId, programPhaseId);
  const deleteMutation = useDeleteProgramPhaseMeasurementData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddDataDialogOpen, setIsAddDataDialogOpen] = useState(false);
  const [isEditMeasurementDialogOpen, setIsEditMeasurementDialogOpen] =
    useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [measurementToDelete, setMeasurementToDelete] = useState(null);
  const [measurementToEdit, setMeasurementToEdit] = useState(null);
  const [selectedMeasurementDefinitionId, setSelectedMeasurementDefinitionId] =
    useState<number | null>(null);

  const { data: allowedMeasurementDefinitions } =
    useProgramAllowedMeasurementDefinitions(programId);

  if (!programId || !programPhaseId) {
    return null;
  }

  const handleEditClick = (measurement) => {
    setMeasurementToEdit(measurement);
    setIsEditMeasurementDialogOpen(true);
  };

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
        return <div className="text-center">{value}</div>;
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
      id: "location_context",
      header: "Context",
      cell: ({ row }) => {
        const context = row.original.location_context;

        // Split context into lines if too long
        if (!context) return "-";

        const contextParts = context.split(">");

        const contextText =
          (contextParts.length > 3 ? "... > " : "") +
          contextParts.slice(-3).join(" > ");

        return (
          <span
            className="text-sm overflow-hidden text-ellipsis whitespace-nowrap"
            title={context}
          >
            {contextText}
          </span>
        );
      },
    },
    // {
    //   id: "metadata",
    //   header: "Details",
    //   cell: ({ row }) => {
    //     const measurement = row.original;
    //     if (!measurement.calculation_metadata) return "-";

    //     return (
    //       <TooltipProvider>
    //         <Tooltip>
    //           <TooltipTrigger>
    //             <IconInfoCircle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
    //           </TooltipTrigger>
    //           <TooltipContent className="max-w-sm">
    //             <div className="space-y-1">
    //               <div className="text-xs font-medium">Calculation Details</div>
    //               <pre className="text-xs whitespace-pre-wrap">
    //                 {JSON.stringify(measurement.calculation_metadata, null, 2)}
    //               </pre>
    //             </div>
    //           </TooltipContent>
    //         </Tooltip>
    //       </TooltipProvider>
    //     );
    //   },
    // },
    {
      accessorKey: "created_at",
      header: "Last Updated",
      cell: ({ row }) => {
        const createdAt = row.getValue("created_at") as string;
        return (
          <span>
            {formatDistanceToNow(new Date(createdAt), {
              addSuffix: true,
            })}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const measurement = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditClick(measurement)}
              className="h-8 w-8 p-0"
            >
              <IconEdit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteClick(measurement)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <IconTrash className="h-4 w-4" />
            </Button>
          </div>
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

  const handleMeasurementDefinitionSelect = (definitionId: number) => {
    setSelectedMeasurementDefinitionId(definitionId);
    setIsAddDataDialogOpen(true);
    setIsDialogOpen(false);
  };

  return (
    <>
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
                    onClick: () => setIsDialogOpen(true),
                  }
                : undefined
            }
            defaultPageSize={20}
          />
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Measurement</DialogTitle>
            <DialogDescription>
              Select the measurements you would like to add or modify data for.
            </DialogDescription>
          </DialogHeader>
          <div>
            {allowedMeasurementDefinitions ? (
              <ScrollArea style={{ height: "400px" }}>
                <div className="space-y-4">
                  {allowedMeasurementDefinitions
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((definition) => (
                      <Card key={definition.id} className="shadow-none">
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="mr-2">
                              <h3 className="text-sm font-medium">
                                {definition.name}
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                {definition.description}
                              </p>
                            </div>
                            <Button
                              className="cursor-pointer"
                              onClick={() => {
                                handleMeasurementDefinitionSelect(
                                  definition.id
                                );
                              }}
                            >
                              Select
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="p-4">
                No allowed measurement definitions found. Visit the{" "}
                <strong>Setup</strong> tab to configure.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      {programId && selectedMeasurementDefinitionId && (
        <MeasurementsDataDialog
          open={isAddDataDialogOpen}
          onOpenChange={setIsAddDataDialogOpen}
          programId={programId}
          programPhaseId={programPhaseId}
          measurementDefinitionId={selectedMeasurementDefinitionId}
        />
      )}

      {programId && programPhaseId && measurementToEdit && (
        <EditCalculatedMeasurementDialog
          open={isEditMeasurementDialogOpen}
          onOpenChange={setIsEditMeasurementDialogOpen}
          measurement={measurementToEdit}
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
    </>
  );
}
