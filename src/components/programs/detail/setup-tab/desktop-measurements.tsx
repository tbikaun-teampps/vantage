import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  IconAlertCircle,
  IconPlus,
  IconTrash,
  IconLoader2,
} from "@tabler/icons-react";
import {
  useProgramMeasurements,
  useProgramAvailableMeasurements,
  useAddMeasurementDefinitionsToProgram,
  useRemoveMeasurementDefinitionFromProgram,
} from "@/hooks/useProgram";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
// import type { ProgramMeasurementWithDefinition } from "@/types/program";

interface MeasurementsProps {
  programId: number;
}

export function Measurements({ programId }: MeasurementsProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [
    selectedMeasurementDefinitionIds,
    setSelectedMeasurementDefinitionIds,
  ] = useState<number[]>([]);

  const { data: programMeasurements, isLoading: isLoadingProgramMeasurements } =
    useProgramMeasurements(programId, true);
  const {
    data: availableMeasurements,
    isLoading: isLoadingAvailableMeasurements,
  } = useProgramAvailableMeasurements(programId);
  const addMeasurementDefinitionsMutation =
    useAddMeasurementDefinitionsToProgram();
  const removeMeasurementDefinitionMutation =
    useRemoveMeasurementDefinitionFromProgram();

  const handleMeasurementSelection = (
    measurementDefinitionId: number,
    checked: boolean
  ) => {
    if (checked) {
      setSelectedMeasurementDefinitionIds((prev) => [
        ...prev,
        measurementDefinitionId,
      ]);
    } else {
      setSelectedMeasurementDefinitionIds((prev) =>
        prev.filter((id) => id !== measurementDefinitionId)
      );
    }
  };

  const handleAddSelectedMeasurements = async () => {
    if (selectedMeasurementDefinitionIds.length === 0) {
      toast.error("Please select at least one measurement to add.");
      return;
    }

    await addMeasurementDefinitionsMutation.mutateAsync({
      programId,
      measurementDefinitionIds: selectedMeasurementDefinitionIds,
    });
    setSelectedMeasurementDefinitionIds([]);
    setIsAddDialogOpen(false);
  };

  const handleRemoveMeasurementDefinition = async (
    measurementDefinitionId: number
  ) => {
    await removeMeasurementDefinitionMutation.mutateAsync({
      programId,
      measurementDefinitionId,
    });
  };

  const isLoading = isLoadingProgramMeasurements;
  const hasMeasurements = programMeasurements && programMeasurements.length > 0;

  return (
    <Card className="shadow-none border-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Desktop Analysis Measurements</CardTitle>
            <CardDescription>
              Specify which measurements are relevant to the program's
              objectives.
            </CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <IconPlus className="h-4 w-4 mr-2" />
                Add Measurements
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Measurements to Program</DialogTitle>
                <DialogDescription>
                  Select measurements to track for this program. You can choose
                  multiple measurements at once.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {isLoadingAvailableMeasurements ? (
                  <div className="flex items-center justify-center py-8">
                    <IconLoader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">
                      Loading available measurements...
                    </span>
                  </div>
                ) : availableMeasurements &&
                  availableMeasurements.length > 0 ? (
                  <>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {availableMeasurements
                        .sort((a, b) => {
                          // First sort by active status (active first)
                          if (a.active !== b.active) {
                            return a.active ? -1 : 1;
                          }
                          // Then sort alphabetically by name
                          return a.name.localeCompare(b.name);
                        })
                        .map(
                          (measurement: {
                            id: number;
                            name: string;
                            description?: string;
                            calculation_type?: string;
                            provider?: string;
                            active: boolean;
                          }) => (
                            <div
                              key={measurement.id}
                              className={cn(
                                "flex items-start space-x-3 p-3 border rounded-lg",
                                !measurement.active && "opacity-60"
                              )}
                            >
                              <Checkbox
                                id={`measurement-${measurement.id}`}
                                checked={selectedMeasurementDefinitionIds.includes(
                                  measurement.id
                                )}
                                onCheckedChange={(checked) =>
                                  handleMeasurementSelection(
                                    measurement.id,
                                    !!checked
                                  )
                                }
                              />
                              <div className="flex-1 min-w-0">
                                <label
                                  htmlFor={`measurement-${measurement.id}`}
                                  className={cn(
                                    "block text-sm font-medium",
                                    measurement.active && "cursor-pointer"
                                  )}
                                >
                                  {measurement.name}
                                </label>
                                {measurement.description && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {measurement.description}
                                  </p>
                                )}
                                {measurement.calculation_type && (
                                  <Badge variant="secondary" className="mt-2">
                                    {measurement.calculation_type}
                                  </Badge>
                                )}
                                {measurement.provider && (
                                  <Badge className="mt-2">
                                    {measurement.provider}
                                  </Badge>
                                )}
                                {!measurement.active && (
                                  <Badge
                                    variant="outline"
                                    className="mt-2 ml-2"
                                  >
                                    Coming Soon
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )
                        )}
                    </div>
                    <div className="flex justify-end space-x-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() => setIsAddDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddSelectedMeasurements}
                        disabled={
                          selectedMeasurementDefinitionIds.length === 0 ||
                          addMeasurementDefinitionsMutation.isPending
                        }
                      >
                        {addMeasurementDefinitionsMutation.isPending ? (
                          <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <IconPlus className="h-4 w-4 mr-2" />
                        )}
                        Add{" "}
                        {selectedMeasurementDefinitionIds.length > 0
                          ? `${selectedMeasurementDefinitionIds.length} `
                          : ""}
                        Measurement
                        {selectedMeasurementDefinitionIds.length > 1 ? "s" : ""}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <IconAlertCircle className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      No additional measurements available to add.
                    </p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <IconLoader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading measurements...</span>
          </div>
        ) : hasMeasurements ? (
          <div className="space-y-3">
            {programMeasurements.map(
              (programMeasurement: {
                id: number;
                measurement_definition: {
                  id: number;
                  name: string;
                  description?: string;
                  calculation_type?: string;
                  provider?: string;
                };
              }) => (
                <div
                  key={programMeasurement.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-sm font-medium">
                        {programMeasurement.measurement_definition.name}
                      </h4>
                      {programMeasurement.measurement_definition
                        .calculation_type && (
                        <Badge variant="secondary">
                          {
                            programMeasurement.measurement_definition
                              .calculation_type
                          }
                        </Badge>
                      )}
                    </div>
                    {programMeasurement.measurement_definition.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {programMeasurement.measurement_definition.description}
                      </p>
                    )}
                    <div className="flex gap-4">
                      {programMeasurement.measurement_definition.provider && (
                        <div className="text-sm mt-2">
                          Data Provider:{" "}
                          <Badge>
                            {programMeasurement.measurement_definition.provider}
                          </Badge>
                        </div>
                      )}
                      {/* {programMeasurement.measurement_definition
                      .required_csv_columns && (
                      <div className="text-sm mt-2">
                        Required CSV Columns:{" "}
                        <div className="inline-flex flex-wrap gap-1 text-xs">
                          {Object.entries(
                            programMeasurement.measurement_definition
                              .required_csv_columns
                          ).map(([col, colType]: [string, string]) => (
                            <Badge variant="outline" key={col}>
                              {col}: {colType}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )} */}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleRemoveMeasurementDefinition(
                        programMeasurement.measurement_definition.id
                      )
                    }
                    disabled={removeMeasurementDefinitionMutation.isPending}
                    className="text-destructive hover:text-destructive"
                  >
                    {removeMeasurementDefinitionMutation.isPending ? (
                      <IconLoader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <IconTrash className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <IconAlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold">
              No measurements configured
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Add measurements relevant to this program to start tracking
              progress.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
