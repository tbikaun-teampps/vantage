import { CompanyStructureSelectionTree } from "@/components/company-structure-selection-tree";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAssessmentMeasurementActions } from "@/hooks/use-assessment-measurements";
import {
  IconDeviceFloppy,
  IconFileUpload,
  IconCheck,
} from "@tabler/icons-react";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type {
  AssessmentMeasurement,
  EnrichedMeasurementInstance,
} from "../../../../types/assessment-measurements";
import type { TreeNodeType } from "@/types/company";

interface ConfigTabProps {
  assessmentId?: number;
  measurement: AssessmentMeasurement;
  onUploadData: (measurement: AssessmentMeasurement) => void;
  isDeleting: boolean;
  onToggleSelection: (measurement: AssessmentMeasurement) => void;
  mode?: "add" | "edit";
  instanceId?: number | null;
  instance?: EnrichedMeasurementInstance | null;
}

export function AddEditTab({
  assessmentId,
  measurement,
  onUploadData,
  isDeleting,
  onToggleSelection,
  mode = "add",
  instanceId = null,
  instance = null,
}: ConfigTabProps) {
  const [manualValue, setManualValue] = useState<string>("");
  const [selectedNodes, setSelectedNodes] = useState<Map<string, TreeNodeType>>(
    new Map()
  );
  const {
    addMeasurement,
    updateMeasurement,
    isUpdating,
    isAdding: isAddingMeasurement,
  } = useAssessmentMeasurementActions();

  // Initialize form based on mode (add vs edit)
  useEffect(() => {
    if (mode === "edit" && instance) {
      // Pre-populate value from instance
      setManualValue(instance.calculated_value.toString());

      // Pre-populate location selection from instance
      const initialNodes = new Map<string, TreeNodeType>();
      if (instance.business_unit_id) {
        initialNodes.set(instance.business_unit_id.toString(), "business_unit");
      }
      if (instance.region_id) {
        initialNodes.set(instance.region_id.toString(), "region");
      }
      if (instance.site_id) {
        initialNodes.set(instance.site_id.toString(), "site");
      }
      if (instance.asset_group_id) {
        initialNodes.set(instance.asset_group_id.toString(), "asset_group");
      }
      if (instance.work_group_id) {
        initialNodes.set(instance.work_group_id.toString(), "work_group");
      }
      if (instance.role_id) {
        initialNodes.set(instance.role_id.toString(), "role");
      }
      setSelectedNodes(initialNodes);
    } else {
      // Reset for add mode
      setManualValue("");
      setSelectedNodes(new Map());
    }
  }, [mode, instance]);

  if (!measurement) {
    return null;
  }

  const handleSaveManualValue = async () => {
    if (!assessmentId || !instanceId) {
      toast.error("Cannot save: missing assessment or instance ID");
      return;
    }

    const value = parseFloat(manualValue);
    if (isNaN(value)) {
      toast.error("Please enter a valid number");
      return;
    }

    try {
      await updateMeasurement(assessmentId, instanceId, {
        calculated_value: value,
      });
      toast.success(`Updated "${measurement.name}" value to ${value}`);
    } catch (error) {
      toast.error("Failed to update measurement value");
      console.error("Error updating measurement:", error);
    }
  };

  const hasSelection = selectedNodes.size > 0;
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

    // Build location object from selectedNodes Map
    const location: {
      business_unit_id?: number;
      region_id?: number;
      site_id?: number;
      asset_group_id?: number;
      work_group_id?: number;
      role_id?: number;
    } = {};

    selectedNodes.forEach((type, id) => {
      const numericId = parseInt(id);
      switch (type) {
        case "business_unit":
          location.business_unit_id = numericId;
          break;
        case "region":
          location.region_id = numericId;
          break;
        case "site":
          location.site_id = numericId;
          break;
        case "asset_group":
          location.asset_group_id = numericId;
          break;
        case "work_group":
          location.work_group_id = numericId;
          break;
        case "role":
          location.role_id = numericId;
          break;
        // company type is not included in location
      }
    });

    try {
      await addMeasurement(assessmentId, measurement.id, value, location);
      toast.success(`Added "${measurement.name}" to assessment`);
      // Clear form after successful add
      setManualValue("");
      setSelectedNodes(new Map());
    } catch (error) {
      toast.error("Failed to add measurement");
      console.error("Error adding measurement:", error);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Left Column: Company Structure */}
      <div>
        <CompanyStructureSelectionTree
          selectionMode="branches"
          enableCollapse={false}
          onSelectionChange={setSelectedNodes}
          initialSelection={selectedNodes}
          // maxHeight="300px"
        />
      </div>

      {/* Right Column: Configuration Options */}
      <div className="space-y-4">
        {/* Add to Assessment section - only for add mode */}
        {mode === "add" && (
          <div>
            <h4 className="font-medium mb-3">Add to Assessment</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Select a location from the tree and enter a value to add this
              measurement to your assessment.
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

        {/* <div>
                        <h4 className="font-medium mb-3">Configuration Actions</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Button
                            variant="outline"
                            onClick={() => onConfigure(measurement)}
                            className="justify-start"
                          >
                            <IconSettings className="h-4 w-4 mr-2" />
                            Measurement Settings
                          </Button>
                          <Button
                            variant="outline"
                            disabled
                            className="justify-start"
                          >
                            <IconDatabase className="h-4 w-4 mr-2" />
                            Data Mapping
                          </Button>
                          <Button
                            variant="outline"
                            disabled
                            className="justify-start"
                          >
                            <IconCheck className="h-4 w-4 mr-2" />
                            Validation Rules
                          </Button>
                          <Button
                            variant="outline"
                            disabled
                            className="justify-start"
                          >
                            <IconMath className="h-4 w-4 mr-2" />
                            Formula Editor
                          </Button>
                        </div>
                      </div> */}

        {/* Remove from Assessment option - only for edit mode */}
        {mode === "edit" && instance && (
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
                onClick={() => onToggleSelection(measurement)}
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
      </div>
    </div>
  );
}
