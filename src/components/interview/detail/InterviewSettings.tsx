import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IconDeviceFloppy, IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";
import { DatePicker } from "@/components/ui/date-picker";

interface InterviewSettingsProps {
  currentInterview: {
    id: number;
    name: string;
    status?: string;
    notes?: string;
    due_at?: string | null;
  };
  roles?: { id: number; name: string }[];
  onSave: (updates: {
    name?: string;
    status?: string;
    notes?: string;
    due_at?: string | null;
  }) => Promise<void>;
  onDelete?: () => void;
  onExport?: () => void;
  isSaving: boolean;
  isProcessing?: boolean;
  showDelete?: boolean;
}

export function InterviewSettings({
  currentInterview,
  roles = [],
  onSave,
  onDelete,
  onExport,
  isSaving,
  isProcessing = false,
  showDelete = true,
}: InterviewSettingsProps) {
  const [name, setName] = useState(currentInterview.name);
  const [status, setStatus] = useState(currentInterview.status || "pending");
  const [notes, setNotes] = useState(currentInterview.notes || "");
  const [dueAt, setDueAt] = useState<Date | undefined>(
    currentInterview.due_at ? new Date(currentInterview.due_at) : undefined
  );

  // Sync with prop changes
  useEffect(() => {
    setName(currentInterview.name);
    setStatus(currentInterview.status || "pending");
    setNotes(currentInterview.notes || "");
    setDueAt(currentInterview.due_at ? new Date(currentInterview.due_at) : undefined);
  }, [currentInterview]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Interview name cannot be empty");
      return;
    }

    const updates: { name?: string; status?: string; notes?: string; due_at?: string | null } = {};

    if (name.trim() !== currentInterview.name) {
      updates.name = name.trim();
    }

    if (notes !== currentInterview.notes) {
      updates.notes = notes;
    }

    const dueAtString = dueAt ? dueAt.toISOString() : null;
    const currentDueAt = currentInterview.due_at;
    if (dueAtString !== currentDueAt) {
      updates.due_at = dueAtString;
    }

    if (Object.keys(updates).length === 0) {
      toast.info("No changes to save");
      return;
    }

    try {
      await onSave(updates);
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const hasUnsavedChanges =
    name.trim() !== currentInterview.name ||
    status !== currentInterview.status ||
    notes !== currentInterview.notes ||
    (dueAt ? dueAt.toISOString() : null) !== currentInterview.due_at;

  const isValid = name.trim().length > 0;

  return (
    <div
      data-tour="interview-general-settings"
      className="flex flex-col h-full min-h-0"
    >
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="space-y-6">
          {/* Main Settings Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="interview-name">Interview Name</Label>
              <Input
                id="interview-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter interview name..."
                disabled={isProcessing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interview-notes">Notes</Label>
              <Textarea
                id="interview-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes or comments about this interview..."
                disabled={isProcessing}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interview-due-date">Due Date</Label>
              <DatePicker
                date={dueAt}
                setDate={setDueAt}
                disabled={isProcessing}
                disablePastDates={true}
              />
            </div>

            {/* <div className="space-y-2">
              <Label>Scoped Roles</Label>
              {roles.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {roles.map((role) => (
                    <Badge key={role.id} variant="secondary">
                      {role.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No specific roles assigned to this interview
                </p>
              )}
            </div> */}
          </div>

          {/* Export Section */}
          {/* {onExport && (
            <div className="border-t pt-6 space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-1">
                  Export Interview Data
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Download this interview's data including all responses and
                  follow-up actions.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onExport}
                    disabled={isProcessing}
                  >
                    <IconDownload className="h-4 w-4 mr-2" />
                    Export as JSON
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="opacity-50"
                  >
                    <IconFileTypeCsv className="h-4 w-4 mr-2" />
                    Export as CSV
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Coming Soon
                    </Badge>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="opacity-50"
                  >
                    <IconFileTypePdf className="h-4 w-4 mr-2" />
                    Export as PDF
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Coming Soon
                    </Badge>
                  </Button>
                </div>
              </div>
            </div>
          )} */}

          {showDelete && onDelete && (
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-lg p-4">
              <div className="space-y-2 flex items-center">
                <p className="text-sm text-red-700 dark:text-red-300">
                  Permanently delete this interview and all its responses.
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onDelete}
                  disabled={isProcessing}
                >
                  <IconTrash className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed footer with save button */}
      <div className="flex-shrink-0 bg-background/95 backdrop-blur pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Unsaved changes indicator */}
            {hasUnsavedChanges && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                <span>Unsaved changes</span>
              </div>
            )}
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={isProcessing || !hasUnsavedChanges || !isValid}
            variant={hasUnsavedChanges ? "default" : "outline"}
            size="sm"
          >
            <IconDeviceFloppy className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
