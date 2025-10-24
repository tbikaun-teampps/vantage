import { useState, useMemo, useEffect } from "react";
import { CompanyStructureSelectionTree } from "../company-structure-selection-tree";
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

interface MeasurementDataAddUploadEditProps {
  programId: number;
  programPhaseId: number;
}

// Helper function to convert selected tree nodes to location params
function convertNodesToLocation(
  selectedNodes: Map<string, TreeNodeType>
): LocationParams {
  const location: LocationParams = {};

  selectedNodes.forEach((type, id) => {
    const nodeId = parseInt(id);
    switch (type) {
      case "business_unit":
        location.business_unit_id = nodeId;
        break;
      case "region":
        location.region_id = nodeId;
        break;
      case "site":
        location.site_id = nodeId;
        break;
      case "asset_group":
        location.asset_group_id = nodeId;
        break;
      case "work_group":
        location.work_group_id = nodeId;
        break;
      case "role":
        location.role_id = nodeId;
        break;
    }
  });

  return location;
}

export function MeasurementDataAddUploadEdit({
  programId,
  programPhaseId,
}: MeasurementDataAddUploadEditProps) {
  const [manualValue, setManualValue] = useState<string>("");
  const [selectedMeasurementDefinitionId, setSelectedMeasurementDefinitionId] =
    useState<string>("");
  const [selectedNodes, setSelectedNodes] = useState<Map<string, TreeNodeType>>(
    new Map()
  );

  const { data: programMeasurements, isLoading: isLoadingProgramMeasurements } =
    useProgramMeasurements(programId, true);

  // Convert selected nodes to location params
  const location = useMemo(
    () => convertNodesToLocation(selectedNodes),
    [selectedNodes]
  );

  // Fetch existing measurement data when both measurement and location are selected
  const measurementDefinitionId = selectedMeasurementDefinitionId
    ? parseInt(selectedMeasurementDefinitionId)
    : undefined;

  const hasSelection =
    !!measurementDefinitionId && selectedNodes.size > 0;

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

    if (!measurementDefinitionId) {
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
      // Create new measurement
      createMutation.mutate({
        programId,
        programPhaseId,
        data: {
          measurement_definition_id: measurementDefinitionId,
          calculated_value: value,
          ...location,
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
        <CompanyStructureSelectionTree
          selectionMode="branches"
          enableCollapse={false}
          onSelectionChange={setSelectedNodes}
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
              {programMeasurements?.map((pmf: {
                id: number;
                measurement_definition_id: number;
                measurement_definition?: { name: string };
              }) => (
                <SelectItem
                  key={pmf.id}
                  value={pmf.measurement_definition_id.toString()}
                >
                  {pmf.measurement_definition?.name || `Measurement ${pmf.id}`}
                </SelectItem>
              ))}
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
                      Existing value found. Update the value above to save changes.
                    </p>
                  ) : measurementError ? (
                    <p className="text-sm text-muted-foreground">
                      No existing data. Enter a value to create new measurement data.
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
            Please select a location from the tree and a measurement to view or enter data.
          </div>
        )}
      </div>
    </div>
  );
}
