import { useState, useMemo, useEffect } from "react";
import type { TreeNodeType } from "@/types/company";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { IconCheck, IconFileUpload, IconDeviceFloppy } from "@tabler/icons-react";
import {
  useProgramPhaseMeasurementData,
  useCreateProgramPhaseMeasurementData,
  useUpdateProgramPhaseMeasurementData,
  useDeleteProgramPhaseMeasurementData,
  useMeasurementDefinition,
  useProgramPhaseCalculatedMeasurements,
} from "@/hooks/useProgram";
import { LocationTreeSelect } from "../location-tree-select";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";

interface MeasurementDataAddUploadEditProps {
  programId: number;
  programPhaseId: number;
  measurementDefinitionId: number;
}

export function MeasurementDataAddUploadEdit({
  programId,
  programPhaseId,
  measurementDefinitionId,
}: MeasurementDataAddUploadEditProps) {
  const companyId = useCompanyFromUrl();
  const [manualValue, setManualValue] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<{
    id: string;
    type: TreeNodeType;
    name: string;
  } | null>(null);
  const [mode, setMode] = useState<"add" | "edit">("add");

  // Fetch measurement definition details
  const {
    data: measurementDefinition,
    isLoading: isLoadingMeasurementDefinition,
  } = useMeasurementDefinition(measurementDefinitionId);

  // Fetch instances of this measurement for this program phase
  const { data: instances } = useProgramPhaseCalculatedMeasurements(
    programId,
    programPhaseId,
    measurementDefinitionId ? { measurementDefinitionId } : undefined
  );

  // Convert selected location to API format for querying existing measurements
  const location = useMemo(() => {
    if (!selectedLocation) return undefined;
    return {
      id: parseInt(selectedLocation.id),
      type: selectedLocation.type,
    };
  }, [selectedLocation]);

  const hasSelection = !!measurementDefinitionId && !!selectedLocation;

  const {
    data: existingMeasurement,
    isLoading: isLoadingMeasurement,
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

  // Update input value and mode when existing measurement is loaded
  useEffect(() => {
    if (existingMeasurement) {
      setMode("edit");
      setManualValue(existingMeasurement.calculated_value.toString());
    } else {
      setMode("add");
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

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  // Convert instances into a set of location identifiers for easy lookup
  const instanceLocations = useMemo(() => {
    const locations = new Set<string>();
    instances?.forEach(
      (i: {
        role_id?: number | null;
        work_group_id?: number | null;
        asset_group_id?: number | null;
        site_id?: number | null;
        region_id?: number | null;
        business_unit_id?: number | null;
      }) => {
        if (i.role_id) {
          locations.add(`role:${i.role_id}`);
        } else if (i.work_group_id) {
          locations.add(`work_group:${i.work_group_id}`);
        } else if (i.asset_group_id) {
          locations.add(`asset_group:${i.asset_group_id}`);
        } else if (i.site_id) {
          locations.add(`site:${i.site_id}`);
        } else if (i.region_id) {
          locations.add(`region:${i.region_id}`);
        } else if (i.business_unit_id) {
          locations.add(`business_unit:${i.business_unit_id}`);
        }
      }
    );
    return locations;
  }, [instances]);

  const handleNodeMarkers = (node: { id: string; type: TreeNodeType }) => {
    const key = `${node.type}:${node.id}`;
    return instanceLocations.has(key) ? (
      <IconCheck className="h-4 w-4 text-green-500" />
    ) : null;
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Left Column: Company Structure */}
      <div>
        <LocationTreeSelect
          companyId={companyId}
          value={selectedLocation}
          onChange={setSelectedLocation}
          enableCollapse={false}
          maxHeight="400px"
          renderNodeMarkers={handleNodeMarkers}
        />
      </div>
      <div className="space-y-6">
        {/* Measurement Details */}
        <div>
          <h2 className="text-lg font-medium">
            {measurementDefinition
              ? measurementDefinition.name
              : isLoadingMeasurementDefinition
                ? "Loading measurement..."
                : "Select a measurement"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {measurementDefinition
              ? measurementDefinition.description
              : "Please select a measurement to see details."}
          </p>
        </div>

        {/* Add Mode Section */}
        {hasSelection && mode === "add" && (
          <div className="space-y-4">
            <h4 className="font-medium">Add New Measurement Value</h4>
            {isLoadingMeasurement ? (
              <div className="text-sm text-muted-foreground">
                Loading existing data...
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="measurement-value">Measurement Value</Label>
                  <div className="flex gap-2">
                    <Input
                      id="measurement-value"
                      type="number"
                      step="any"
                      value={manualValue}
                      onChange={(e) => setManualValue(e.target.value)}
                      placeholder="Enter measurement value"
                      min={measurementDefinition?.min_value}
                      max={measurementDefinition?.max_value}
                      disabled={isSaving}
                    />
                    <Button
                      onClick={handleSave}
                      disabled={!manualValue || isSaving}
                    >
                      <IconDeviceFloppy className="h-4 w-4 mr-2" />
                      {isSaving ? "Saving..." : "Save"}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No existing data. Enter a value to create new measurement
                    data.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Edit Mode Section */}
        {hasSelection && mode === "edit" && existingMeasurement && (
          <div className="space-y-4">
            <h4 className="font-medium">Update Measurement Value</h4>
            {isLoadingMeasurement ? (
              <div className="text-sm text-muted-foreground">
                Loading existing data...
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="measurement-value">Measurement Value</Label>
                  <div className="flex gap-2">
                    <Input
                      id="measurement-value"
                      type="number"
                      step="any"
                      value={manualValue}
                      onChange={(e) => setManualValue(e.target.value)}
                      placeholder="Enter measurement value"
                      min={measurementDefinition?.min_value}
                      max={measurementDefinition?.max_value}
                      disabled={isSaving}
                    />
                    <Button
                      onClick={handleSave}
                      disabled={!manualValue || isSaving}
                    >
                      <IconDeviceFloppy className="h-4 w-4 mr-2" />
                      {isSaving ? "Saving..." : "Save"}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Current value: {existingMeasurement.calculated_value}. Update
                    the value above to save changes.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Danger Zone - Delete Section */}
        {hasSelection && mode === "edit" && existingMeasurement && (
          <div className="space-y-4">
            <h4 className="font-medium text-red-600">Danger Zone</h4>
            <div className="border border-red-200 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-3">
                Delete this measurement instance. This will remove the
                measurement and its value from this specific location.
              </p>
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="w-full sm:w-auto"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>Delete Measurement</>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Upload Data Placeholder */}
        {hasSelection && (
          <div className="space-y-4">
            <h4 className="font-medium">Upload Data</h4>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div>
                  <div className="text-sm font-medium">No Data Uploaded</div>
                  <div className="text-xs text-muted-foreground">
                    Upload your data file to begin analysis
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" disabled>
                <IconFileUpload className="h-4 w-4 mr-2" />
                Upload
              </Button>
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
