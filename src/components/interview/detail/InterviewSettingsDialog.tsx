import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InterviewSettings } from "@/components/interview/detail/InterviewSettings";
import type { UpdateInterviewBodyData } from "@/types/api/interviews";

interface InterviewSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interviewData: any;
  onSave: (updates: UpdateInterviewBodyData) => Promise<void>;
  onDelete?: () => void;
  onExport?: () => void;
  isSaving: boolean;
  isProcessing?: boolean;
  showDelete?: boolean;
}

export function InterviewSettingsDialog({
  open,
  onOpenChange,
  interviewData,
  onSave,
  onDelete,
  onExport,
  isSaving,
  isProcessing = false,
  showDelete = true,
}: InterviewSettingsDialogProps) {
  if (!interviewData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Interview Settings</DialogTitle>
          <DialogDescription>
            Configure the basic interview information
          </DialogDescription>
        </DialogHeader>
        <InterviewSettings
          currentInterview={{
            id: interviewData.id,
            name: interviewData.name,
            status: interviewData.status,
            notes: interviewData.notes,
            due_at: interviewData.due_at,
          }}
          onSave={onSave}
          onDelete={onDelete}
          onExport={onExport}
          isSaving={isSaving}
          isProcessing={isProcessing}
          showDelete={showDelete}
        />
      </DialogContent>
    </Dialog>
  );
}
