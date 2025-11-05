import { useState, useMemo, useEffect } from "react";
import type { TreeNodeType } from "@/types/company";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  useProgramMeasurements,
  useProgramPhaseMeasurementData,
  useCreateProgramPhaseMeasurementData,
  useUpdateProgramPhaseMeasurementData,
  useDeleteProgramPhaseMeasurementData,
} from "@/hooks/useProgram";
import type { LocationParams } from "@/lib/api/programs";
import { LocationTreeSelect } from "../location-tree-select";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";

interface MeasurementDataAddUploadEditProps {
  programId: number;
  programPhaseId: number;
}

export function MeasurementDataAddUploadEdit({
  programId,
  programPhaseId,
}: MeasurementDataAddUploadEditProps) {
  const companyId = useCompanyFromUrl();
  const [manualValue, setManualValue] = useState<string>("");
  const [selectedMeasurementDefinitionId, setSelectedMeasurementDefinitionId] =
    useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<{
    id: string;
    type: TreeNodeType;
    name: string;
  } | null>(null);

  const { data: programMeasurements, isLoading: isLoadingProgramMeasurements } =
    useProgramMeasurements(programId, true);

  // Convert selected location to API format for querying existing measurements
  const location = useMemo(() => {
    if (!selectedLocation) return {};
    return {
      id: parseInt(selectedLocation.id),
      type: selectedLocation.type,
    };
  }, [selectedLocation]);

  // Fetch existing measurement data when both measurement and location are selected
  const measurementDefinitionId = selectedMeasurementDefinitionId
    ? parseInt(selectedMeasurementDefinitionId)
    : undefined;

  const hasSelection = !!measurementDefinitionId && !!selectedLocation;

  const {
    data: existingMeasurement,
    isLoading: isLoadingMeasurement,
    error: measurementError,
  } = useProgramPhaseMeasurementData(
    programId,
    programPhaseId,
    measurementDefinitionId,
    location
  );

  // Mutation hooks
  const createMutation = useCreateProgramPhaseMeasurementData();
  const updateMutation = useUpdateProgramPhaseMeasurementData();
  const deleteMutation = useDeleteProgramPhaseMeasurementData();

  // Update input value when existing measurement is loaded
  useEffect(() => {
    if (existingMeasurement) {
      setManualValue(existingMeasurement.calculated_value.toString());
    } else {
      setManualValue("");
    }
  }, [existingMeasurement]);

  const handleSave = () => {
    const value = parseFloat(manualValue);
    if (isNaN(value)) {
      return;
    }

    if (!measurementDefinitionId || !selectedLocation) {
      return;
    }

    // Cannot add measurement at company level
    if (selectedLocation.type === "company") {
      return;
    }

    if (existingMeasurement) {
      // Update existing measurement
      updateMutation.mutate({
        programId,
        programPhaseId,
        measurementId: existingMeasurement.id,
        calculated_value: value,
      });
    } else {
      // Create new measurement with new location format
      createMutation.mutate({
        programId,
        programPhaseId,
        data: {
          measurement_definition_id: measurementDefinitionId,
          calculated_value: value,
          location: {
            id: parseInt(selectedLocation.id),
            type: selectedLocation.type,
          },
        },
      });
    }
  };

  const handleDelete = () => {
    if (existingMeasurement) {
      deleteMutation.mutate({
        programId,
        programPhaseId,
        measurementId: existingMeasurement.id,
      });
    }
  };

  if (isLoadingProgramMeasurements) {
    return <div>Loading...</div>;
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Left Column: Company Structure */}
      <div>
        <LocationTreeSelect
          companyId={companyId}
          value={selectedLocation}
          onChange={setSelectedLocation}
          enableCollapse={false}
        />
      </div>
      <div className="space-y-6">
        {/* Measurement Selection */}
        <div className="space-y-2">
          <Label htmlFor="measurement-select">Select Measurement</Label>
          <Select
            value={selectedMeasurementDefinitionId}
            onValueChange={setSelectedMeasurementDefinitionId}
          >
            <SelectTrigger id="measurement-select">
              <SelectValue placeholder="Choose a measurement to enter or upload data for..." />
            </SelectTrigger>
            <SelectContent>
              {programMeasurements?.map(
                (pmf: {
                  id: number;
                  measurement_definition_id: number;
                  measurement_definition?: { name: string };
                }) => (
                  <SelectItem
                    key={pmf.id}
                    value={pmf.measurement_definition_id.toString()}
                  >
                    {pmf.measurement_definition?.name ||
                      `Measurement ${pmf.id}`}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Measurement Value Input */}
        {hasSelection && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="measurement-value">Measurement Value</Label>
              {isLoadingMeasurement ? (
                <div className="text-sm text-muted-foreground">
                  Loading existing data...
                </div>
              ) : (
                <>
                  <Input
                    id="measurement-value"
                    type="number"
                    step="any"
                    value={manualValue}
                    onChange={(e) => setManualValue(e.target.value)}
                    placeholder="Enter measurement value"
                  />
                  {existingMeasurement ? (
                    <p className="text-sm text-muted-foreground">
                      Existing value found. Update the value above to save
                      changes.
                    </p>
                  ) : measurementError ? (
                    <p className="text-sm text-muted-foreground">
                      No existing data. Enter a value to create new measurement
                      data.
                    </p>
                  ) : null}
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={!manualValue || isSaving || isLoadingMeasurement}
              >
                {isSaving
                  ? "Saving..."
                  : existingMeasurement
                    ? "Update"
                    : "Save"}
              </Button>
              {existingMeasurement && (
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting || isLoadingMeasurement}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              )}
            </div>
          </div>
        )}

        {!hasSelection && (
          <div className="text-sm text-muted-foreground">
            Please select a location from the tree and a measurement to view or
            enter data.
          </div>
        )}
      </div>
    </div>
  );
}
