import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import type { ProgramPhase } from "@/types/program";

interface DeletePhaseConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phase: ProgramPhase;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeletePhaseConfirmationDialog({
  open,
  onOpenChange,
  phase,
  onConfirm,
  isDeleting,
}: DeletePhaseConfirmationDialogProps) {
  const [confirmationText, setConfirmationText] = useState("");
  
  const phaseName = phase.name || `Assessment ${phase.sequence_number}`;

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      setConfirmationText("");
    }
  };

  const isDeleteAllowed = confirmationText.trim() === phaseName;

  const handleConfirm = () => {
    if (isDeleteAllowed) {
      onConfirm();
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Assessment</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            assessment "{phaseName}" and all associated interviews and calculated metrics.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <Label htmlFor="confirmation" className="text-sm font-medium">
            To confirm, type "{phaseName}" in the box below
          </Label>
          <Input
            id="confirmation"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            placeholder={phaseName}
            className="mt-2"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!isDeleteAllowed || isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete Assessment"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}