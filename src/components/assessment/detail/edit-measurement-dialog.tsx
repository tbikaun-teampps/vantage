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
import { useAssessmentMeasurementActions } from "@/hooks/use-assessment-measurements";
import type { EnrichedMeasurementInstance } from "@/types/assessment-measurements";

interface EditMeasurementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instance: EnrichedMeasurementInstance | null;
  assessmentId: number;
  onSuccess?: () => void;
}

export function EditMeasurementDialog({
  open,
  onOpenChange,
  instance,
  assessmentId,
  onSuccess,
}: EditMeasurementDialogProps) {
  const [value, setValue] = useState<string>("");
  const { updateMeasurement, isUpdating } = useAssessmentMeasurementActions();

  // Initialize value when instance changes
  useEffect(() => {
    if (instance) {
      setValue(instance.calculated_value.toString());
    }
  }, [instance]);

  const handleSave = async () => {
    if (!instance) return;

    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) {
      toast.error("Please enter a valid number");
      return;
    }

    try {
      await updateMeasurement(assessmentId, instance.id, {
        calculated_value: numericValue,
      });

      toast.success(
        `Updated "${instance.measurement_name}" value to ${numericValue}`
      );
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to update measurement:", error);
      toast.error("Failed to update measurement value");
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    // Reset to original value
    if (instance) {
      setValue(instance.calculated_value.toString());
    }
  };

  if (!instance) return null;

  // Build location display string
  const locationParts: string[] = [];
  if (instance.business_unit?.name) locationParts.push(instance.business_unit.name);
  if (instance.region?.name) locationParts.push(instance.region.name);
  if (instance.site?.name) locationParts.push(instance.site.name);
  if (instance.asset_group?.name) locationParts.push(instance.asset_group.name);
  if (instance.work_group?.name) locationParts.push(instance.work_group.name);
  if (instance.role?.name) locationParts.push(instance.role.name);
  const locationDisplay = locationParts.length > 0 ? locationParts.join(" > ") : "No location specified";

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
              {instance.measurement_name}
            </div>
          </div>

          {/* Location (Read-only) */}
          <div className="grid gap-2">
            <Label className="text-sm font-medium">Location</Label>
            <div className="text-sm text-muted-foreground">
              {locationDisplay}
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
              disabled={isUpdating}
              placeholder="Enter measurement value"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isUpdating || !value}
          >
            {isUpdating ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
