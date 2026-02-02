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
import type { QuestionnaireSections } from "@/types/api/questionnaire";

interface EditSectionDialogProps {
  open: boolean;
  onOpenChange: () => void;
  section: QuestionnaireSections[number] | null;
  isProcessing: boolean;
  onSave: (sectionId: number, updates: { title: string }) => void;
}

export function EditSectionDialog({
  open,
  onOpenChange,
  section,
  isProcessing,
  onSave,
}: EditSectionDialogProps) {
  // Local state for smoother input handling
  const [title, setTitle] = useState(section?.title ?? "");

  // Sync local state when section changes (dialog opens with new section)
  useEffect(() => {
    if (section) {
      setTitle(section.title);
    }
  }, [section]);

  const handleSave = () => {
    if (section && title.trim()) {
      onSave(section.id, { title: title.trim() });
    }
  };

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
