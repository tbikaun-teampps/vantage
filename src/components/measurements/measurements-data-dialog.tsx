import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MeasurementDataAddUploadEdit } from "./measurement-data-add-upload-edit";

interface MetricsDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programId: number;
  programPhaseId: number;
  measurementDefinitionId: number;
}

export function MeasurementsDataDialog({
  open,
  onOpenChange,
  programId,
  programPhaseId,
  measurementDefinitionId,
}: MetricsDataDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add or Edit Measurement Data</DialogTitle>
          <DialogDescription>
            Add, upload or edit calculated measurements for this program's
            assessment.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          <MeasurementDataAddUploadEdit
            programId={programId}
            programPhaseId={programPhaseId}
            measurementDefinitionId={measurementDefinitionId}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
