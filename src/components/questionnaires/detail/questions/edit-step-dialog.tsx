import { useState, useEffect } from "react";
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
import type { QuestionnaireSteps } from "@/types/api/questionnaire";

interface EditStepDialogProps {
  open: boolean;
  onOpenChange: () => void;
  step: QuestionnaireSteps[number] | null;
  isProcessing: boolean;
  onSave: (stepId: number, updates: { title: string }) => void;
}

export function EditStepDialog({
  open,
  onOpenChange,
  step,
  isProcessing,
  onSave,
}: EditStepDialogProps) {
  // Local state for smoother input handling
  const [title, setTitle] = useState(step?.title ?? "");

  // Sync local state when step changes (dialog opens with new step)
  useEffect(() => {
    if (step) {
      setTitle(step.title);
    }
  }, [step]);

  const handleSave = () => {
    if (step && title.trim()) {
      onSave(step.id, { title: title.trim() });
    }
  };

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
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isProcessing}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
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
            onClick={handleSave}
            disabled={isProcessing || !title.trim()}
          >
            {isProcessing ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
