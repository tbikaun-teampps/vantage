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
import type { SectionWithSteps } from "@/types/assessment";

interface EditSectionDialogProps {
  open: boolean;
  onOpenChange: () => void;
  section: SectionWithSteps | null;
  onSectionChange: (section: SectionWithSteps) => void;
  isProcessing: boolean;
  onSave: (sectionId: number, updates: { title: string }) => void;
}

export function EditSectionDialog({
  open,
  onOpenChange,
  section,
  onSectionChange,
  isProcessing,
  onSave,
}: EditSectionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Section</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="sectionTitle">Section Title</Label>
          <Input
            id="sectionTitle"
            value={section?.title ?? ""}
            onChange={(e) =>
              section && onSectionChange({ ...section, title: e.target.value })
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
            onClick={() => section && onSave(section.id, { title: section.title })}
            disabled={isProcessing}
          >
            {isProcessing ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
