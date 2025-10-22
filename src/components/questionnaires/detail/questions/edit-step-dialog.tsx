import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditStepDialogProps {
  open: boolean;
  onOpenChange: () => void;
  step: { id: number; title: string } | null;
  onStepChange: (step: { id: number; title: string }) => void;
  isProcessing: boolean;
  onSave: (stepId: number, updates: { title: string }) => void;
}

export function EditStepDialog({
  open,
  onOpenChange,
  step,
  onStepChange,
  isProcessing,
  onSave,
}: EditStepDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Step</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="stepTitle">Step Title</Label>
          <Input
            id="stepTitle"
            value={step?.title ?? ""}
            onChange={(e) =>
              step && onStepChange({ ...step, title: e.target.value })
            }
            disabled={isProcessing}
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onOpenChange}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={() => step && onSave(step.id, { title: step.title })}
            disabled={isProcessing}
          >
            {isProcessing ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
