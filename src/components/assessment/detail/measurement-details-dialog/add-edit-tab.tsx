import {
  LocationTreeSelect,
  type FlatNode,
} from "@/components/location-tree-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAssessmentMeasurementActions } from "@/hooks/use-assessment-measurements";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";
import {
  IconDeviceFloppy,
  IconFileUpload,
  IconCheck,
} from "@tabler/icons-react";
import { Loader2 } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import type {
  AssessmentMeasurement,
  EnrichedMeasurementInstance,
} from "@/types/assessment-measurements";
import type { TreeNodeType } from "@/types/company";

interface ConfigTabProps {
  assessmentId?: number;
  measurement: AssessmentMeasurement;
  onUploadData: (measurement: AssessmentMeasurement) => void;
  isDeleting: boolean;
  onDeleteInstance?: (instance: EnrichedMeasurementInstance) => void;
  instances: EnrichedMeasurementInstance[];
}

export function AddEditTab({
  assessmentId,
  measurement,
  onUploadData,
  isDeleting,
  onDeleteInstance,
  instances,
}: ConfigTabProps) {
  const companyId = useCompanyFromUrl();
  const [manualValue, setManualValue] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<{
    id: string;
    type: TreeNodeType;
    name: string;
  } | null>(null);
  const {
    addMeasurement,
    updateMeasurement,
    isUpdating,
    isAdding: isAddingMeasurement,
  } = useAssessmentMeasurementActions();
  const [mode, setMode] = useState<"add" | "edit">("add");

  // Get mapping between instances and their lowest level node for marker display
  // Use Set for O(1) lookup performance instead of O(n) with array.find()
  const instanceMap = useMemo(() => {
    const map = new Set<string>();
    instances.forEach((i) => {
      if (i.role_id) {
        map.add(`role:${i.role_id}`);
      } else if (i.work_group_id) {
        map.add(`work_group:${i.work_group_id}`);
      } else if (i.asset_group_id) {
        map.add(`asset_group:${i.asset_group_id}`);
      } else if (i.site_id) {
        map.add(`site:${i.site_id}`);
      } else if (i.region_id) {
        map.add(`region:${i.region_id}`);
      } else if (i.business_unit_id) {
        map.add(`business_unit:${i.business_unit_id}`);
      }
    });
    return map;
  }, [instances]);

  // Find the current instance based on selectedLocation
  const currentInstance = useMemo(() => {
    if (!selectedLocation) return null;

    return instances.find((i) => {
      const typeIdMatch =
        i[`${selectedLocation.type}_id`] === parseInt(selectedLocation.id);
      return typeIdMatch;
    });
  }, [selectedLocation, instances]);

  // Auto-switch between add and edit modes based on selected location
  useEffect(() => {
    if (selectedLocation) {
      if (currentInstance) {
        setMode("edit");
        // Populate form with the current instance data
        setManualValue(currentInstance.calculated_value.toString());
      } else {
        setMode("add");
        // Clear form for add mode
        setManualValue("");
      }
    }
  }, [selectedLocation, currentInstance]);

  if (!measurement) {
    return null;
  }

  const handleSaveManualValue = async () => {
    if (!assessmentId) {
      toast.error("Cannot save: missing assessment ID");
      return;
    }

    if (!currentInstance) {
      toast.error("Cannot save: no instance found for selected location");
      return;
    }

    const value = parseFloat(manualValue);
    if (isNaN(value)) {
      toast.error("Please enter a valid number");
      return;
    }

    try {
      await updateMeasurement(assessmentId, currentInstance.id, {
        calculated_value: value,
      });
      toast.success(`Updated "${measurement.name}" value to ${value}`);
    } catch (error) {
      toast.error("Failed to update measurement value");
      console.error("Error updating measurement:", error);
    }
  };

  const hasSelection = selectedLocation !== null;
  const canAddToAssessment = hasSelection && manualValue.trim() !== "";

  const handleAddToAssessment = async () => {
    if (!assessmentId || !canAddToAssessment) {
      toast.error("Cannot add: missing requirements");
      return;
    }

    const value = parseFloat(manualValue);
    if (isNaN(value)) {
      toast.error("Please enter a valid number");
      return;
    }

    // Type guard: ensure we're not adding at company level
    if (selectedLocation.type === "company") {
      toast.error("Cannot add measurement at company level");
      return;
    }

    // Send only the selected node's id and type to the server
    // Server will resolve the full location hierarchy
    const location = {
      id: parseInt(selectedLocation.id),
      type: selectedLocation.type,
    };

    try {
      await addMeasurement(assessmentId, measurement.id, value, location);
      toast.success(`Added "${measurement.name}" to assessment`);
      // Clear form after successful add
      setManualValue("");
      setSelectedLocation(null);
    } catch (error) {
      toast.error("Failed to add measurement");
      console.error("Error adding measurement:", error);
    }
  };

  const handleNodeMarkers = (node: FlatNode) => {
    const key = `${node.type}:${node.id}`;
    return instanceMap.has(key) ? (
      <IconCheck className="h-4 w-4 text-green-500" />
    ) : null;
  };

  console.log("selectedLocation: ", selectedLocation);

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Left Column: Company Structure */}
      <div>
        <LocationTreeSelect
          companyId={companyId}
          value={selectedLocation}
          onChange={setSelectedLocation}
          enableCollapse={false}
          renderNodeMarkers={handleNodeMarkers}
        />
      </div>

      {/* Right Column: Configuration Options */}
      <div className="space-y-4">
        {/* Add to Assessment section - only for add mode */}
        {mode === "add" && (
          <div>
            <h4 className="font-medium mb-3">Add to Assessment</h4>
            <p className="text-sm text-muted-foreground mb-4">
              {selectedLocation
                ? `You've selected ${selectedLocation.name} (${selectedLocation.type.replaceAll("_", " ")})`
                : "Select a location from the tree and enter a value to add this measurement to your assessment."}
            </p>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  id="initial-value"
                  type="number"
                  step="any"
                  placeholder="Enter initial value"
                  value={manualValue}
                  onChange={(e) => setManualValue(e.target.value)}
                  disabled={!hasSelection}
                />
              </div>
              {!hasSelection && (
                <p className="text-xs text-muted-foreground">
                  Select a location from the tree above to enable value entry
                </p>
              )}
              <Button
                onClick={handleAddToAssessment}
                disabled={!canAddToAssessment || isAddingMeasurement}
                className="w-full"
              >
                {isAddingMeasurement ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding to Assessment...
                  </>
                ) : (
                  <>
                    <IconCheck className="h-4 w-4 mr-2" />
                    Add to Assessment
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
        {/* Manual Value Entry - only for edit mode */}
        {mode === "edit" && (
          <div>
            <h4 className="font-medium mb-2">Update Measurement Value</h4>
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="manual-value"
                    type="number"
                    step="any"
                    placeholder="Enter value"
                    value={manualValue}
                    onChange={(e) => setManualValue(e.target.value)}
                    disabled={isUpdating}
                  />
                  <Button
                    onClick={handleSaveManualValue}
                    disabled={!manualValue || isUpdating}
                  >
                    <IconDeviceFloppy className="h-4 w-4 mr-2" />
                    {isUpdating ? "Saving..." : "Save"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Update the value for this measurement at the selected location
                </p>
              </div>
            </div>
          </div>
        )}
        <div>
          <h4 className="font-medium mb-3">Upload Data</h4>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              {/* <DataStatusBadge status={measurement.data_status} /> */}
              <div>
                <div className="text-sm font-medium">
                  {measurement.data_status === "uploaded"
                    ? "Data Ready"
                    : measurement.data_status === "partial"
                      ? "Partial Upload"
                      : "No Data Uploaded"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {measurement.data_status === "uploaded"
                    ? "All required data has been uploaded and validated"
                    : measurement.data_status === "partial"
                      ? "Some data uploaded but validation incomplete"
                      : "Upload your data file to begin analysis"}
                </div>
              </div>
            </div>
            {measurement.data_status !== "uploaded" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUploadData(measurement)}
                disabled
              >
                <IconFileUpload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            )}
          </div>
        </div>

        {/* Remove from Assessment option - only for edit mode */}
        {mode === "edit" && currentInstance && (
          <div>
            <h4 className="font-medium mb-2 text-red-600">Danger Zone</h4>
            <div className="border border-red-200 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-3">
                Delete this measurement instance from your assessment. This will
                remove the measurement and its value from this specific
                location.
              </p>
              <Button
                variant="destructive"
                onClick={() => onDeleteInstance?.(currentInstance)}
                className="w-full sm:w-auto"
                disabled={isDeleting || !onDeleteInstance}
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
      </div>
    </div>
  );
}
