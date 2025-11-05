import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useUpdateProgramPhaseMeasurementData } from "@/hooks/useProgram";

interface CalculatedMeasurementWithDefinition {
  id: number;
  calculated_value: number;
  measurement_definition_id: number;
  measurement_definition: {
    id: number;
    name: string;
    description?: string;
    min_value?: number;
    max_value?: number;
  };
  business_unit_id?: number | null;
  region_id?: number | null;
  site_id?: number | null;
  asset_group_id?: number | null;
  work_group_id?: number | null;
  role_id?: number | null;
  location_context: string;
}

interface EditCalculatedMeasurementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  measurement: CalculatedMeasurementWithDefinition | null;
  programId: number;
  programPhaseId: number;
}

export function EditCalculatedMeasurementDialog({
  open,
  onOpenChange,
  measurement,
  programId,
  programPhaseId,
}: EditCalculatedMeasurementDialogProps) {
  const [value, setValue] = useState<string>("");
  const updateMutation = useUpdateProgramPhaseMeasurementData();

  // Initialize value when measurement changes
  useEffect(() => {
    if (measurement) {
      setValue(measurement.calculated_value.toString());
    }
  }, [measurement]);

  const handleSave = async () => {
    if (!measurement) return;

    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) {
      toast.error("Please enter a valid number");
      return;
    }

    // Validate min/max if provided
    const minValue = measurement.measurement_definition.min_value;
    const maxValue = measurement.measurement_definition.max_value;

    if (minValue !== undefined && numericValue < minValue) {
      toast.error(`Value must be at least ${minValue}`);
      return;
    }

    if (maxValue !== undefined && numericValue > maxValue) {
      toast.error(`Value must be at most ${maxValue}`);
      return;
    }

    try {
      await updateMutation.mutateAsync({
        programId,
        programPhaseId,
        measurementId: measurement.id,
        calculated_value: numericValue,
      });

      toast.success(
        `Updated "${measurement.measurement_definition.name}" value to ${numericValue}`
      );
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update measurement:", error);
      toast.error("Failed to update measurement value");
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    // Reset to original value
    if (measurement) {
      setValue(measurement.calculated_value.toString());
    }
  };

  if (!measurement) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Measurement Value</DialogTitle>
          <DialogDescription>
            Update the value for this measurement instance.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Measurement Name (Read-only) */}
          <div className="grid gap-2">
            <Label className="text-sm font-medium">Measurement</Label>
            <div className="text-sm text-muted-foreground">
              {measurement.measurement_definition.name}
            </div>
            {measurement.measurement_definition.description && (
              <div className="text-xs text-muted-foreground">
                {measurement.measurement_definition.description}
              </div>
            )}
          </div>

          {/* Location (Read-only) */}
          <div className="grid gap-2">
            <Label className="text-sm font-medium">Location</Label>
            <div className="text-sm text-muted-foreground">
              {measurement.location_context}
            </div>
          </div>

          {/* Value Input (Editable) */}
          <div className="grid gap-2">
            <Label htmlFor="value">Value</Label>
            <Input
              id="value"
              type="number"
              step="any"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={updateMutation.isPending}
              placeholder="Enter measurement value"
              min={measurement.measurement_definition.min_value}
              max={measurement.measurement_definition.max_value}
            />
            {(measurement.measurement_definition.min_value !== undefined ||
              measurement.measurement_definition.max_value !== undefined) && (
              <div className="text-xs text-muted-foreground">
                {measurement.measurement_definition.min_value !== undefined &&
                measurement.measurement_definition.max_value !== undefined
                  ? `Valid range: ${measurement.measurement_definition.min_value} - ${measurement.measurement_definition.max_value}`
                  : measurement.measurement_definition.min_value !== undefined
                    ? `Minimum: ${measurement.measurement_definition.min_value}`
                    : `Maximum: ${measurement.measurement_definition.max_value}`}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={updateMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending || !value}
          >
            {updateMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
