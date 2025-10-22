import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type?: "section" | "step" | "question";
  title?: string;
  isProcessing: boolean;
  handleDeleteItem: () => void;
}

export function DeleteDialog({
  open,
  onOpenChange,
  type,
  title,
  isProcessing,
  handleDeleteItem,
}: DeleteDialogProps) {
  const capitalizedType = type
    ? type.charAt(0).toUpperCase() + type.slice(1)
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {capitalizedType}</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{title ?? "this item"}
            &quot;?
            {type === "section" &&
              " This will also delete all steps and questions in this section."}
            {type === "step" &&
              " This will also delete all questions in this step."}
            {type === "question" && " This action cannot be undone."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteItem}
            disabled={isProcessing}
          >
            {isProcessing ? "Deleting..." : `Delete ${capitalizedType}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
