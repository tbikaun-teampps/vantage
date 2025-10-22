import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  IconPaperclip,
  IconTrash,
  IconUpload,
  IconFile,
} from "@tabler/icons-react";
import { useEvidence } from "@/hooks/interview/useEvidence";
import { useIsMobile } from "@/hooks/use-mobile";

interface InterviewEvidenceProps {
  disabled?: boolean;
  responseId?: number;
}

interface InterviewEvidenceContentProps {
  disabled?: boolean;
  responseId?: number;
  onClose?: () => void;
}

interface Evidence {
  id: number;
  file_name: string;
  file_size: number;
  uploaded_at: string;
}

// Extracted content component that can be used in both Dialog and Drawer
export function InterviewEvidenceContent({
  disabled = false,
  responseId,
  onClose,
}: InterviewEvidenceContentProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    evidence,
    isLoading,
    uploadEvidence,
    deleteEvidence,
    isUploading,
    isDeleting,
  } = useEvidence(responseId);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !responseId) {
      return;
    }

    await uploadEvidence(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDeleteEvidence = async (evidenceId: number) => {
    await deleteEvidence(evidenceId);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!responseId || disabled) {
    return (
      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8">
        <div className="text-center">
          <IconPaperclip className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Evidence Upload</h3>
          <p className="text-sm text-muted-foreground">
            {!responseId
              ? "Evidence feature requires selecting a question response."
              : "Evidence upload is disabled."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
        <div className="text-center">
          <IconUpload className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-medium mb-2">Upload Evidence</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Upload supporting files, images, or documents as evidence for this
            interview question.
          </p>
          <div className="text-xs text-muted-foreground mb-4">
            Supported formats: PDF, DOC, DOCX, JPG, PNG, CSV, XLSX (Max 10MB)
          </div>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.csv,.xls,.xlsx"
            className="hidden"
            disabled={isUploading || isLoading}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isLoading}
            variant="outline"
          >
            {isUploading ? (
              <>Uploading...</>
            ) : (
              <>
                <IconPaperclip className="h-4 w-4 mr-2" />
                Choose File
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Evidence List */}
      {evidence.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Uploaded Evidence</h4>
          <div className="space-y-2">
            {evidence.map((item: Evidence) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <IconFile className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div
                      className="font-medium text-sm truncate"
                      title={item.file_name}
                    >
                      {item.file_name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatFileSize(item.file_size)} •{" "}
                      {formatDate(item.uploaded_at)}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteEvidence(item.id)}
                  disabled={isDeleting}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                >
                  {isDeleting ? (
                    "Deleting..."
                  ) : (
                    <IconTrash className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function InterviewEvidence({
  disabled = false,
  responseId,
}: InterviewEvidenceProps) {
  const [evidenceDialogOpen, setEvidenceDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  const { evidence } = useEvidence(responseId);

  return (
    <Dialog open={evidenceDialogOpen} onOpenChange={setEvidenceDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
          disabled={disabled}
        >
          <IconPaperclip className="h-4 w-4" />
          {!isMobile && <span>Evidence</span>}
          {evidence.length > 0 && (
            <Badge variant="secondary" className={isMobile ? "" : "ml-2"}>
              {evidence.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className={`max-h-[80vh] ${isMobile ? "" : "max-w-4xl"}`}>
        <DialogHeader>
          <DialogTitle>Evidence</DialogTitle>
          <DialogDescription>
            Upload and manage evidence artifacts to support your assessment.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <InterviewEvidenceContent
            responseId={responseId}
            disabled={disabled}
            onClose={() => setEvidenceDialogOpen(false)}
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setEvidenceDialogOpen(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
