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

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assessmentName: string;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  assessmentName,
  onConfirm,
  isDeleting,
}: DeleteConfirmationDialogProps) {
  const [confirmationText, setConfirmationText] = useState("");

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      setConfirmationText("");
    }
  };

  const isDeleteAllowed = confirmationText.trim() === assessmentName;

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
            Are you sure you want to delete the assessment{" "}
            <strong className="select-text">{assessmentName}</strong>?
            <br />
            <br />
            <strong>This action is permanent and cannot be undone</strong>. It
            will remove all associated interviews, responses, and analytics
            data.
            <br />
            <br />
            To confirm, please type the assessment name below:
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div>
          <Label htmlFor="delete-confirmation" className="text-sm font-medium">
            Assessment name
          </Label>
          <Input
            id="delete-confirmation"
            type="text"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            placeholder={assessmentName}
            className="mt-1"
            disabled={isDeleting}
            onKeyDown={(e) => {
              if (e.key === "Enter" && isDeleteAllowed) {
                handleConfirm();
              }
            }}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!isDeleteAllowed || isDeleting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
