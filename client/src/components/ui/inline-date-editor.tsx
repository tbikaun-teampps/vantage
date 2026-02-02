import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { IconPencil, IconCheck, IconX } from "@tabler/icons-react";
import { toast } from "sonner";
import { useCanAdmin } from "@/hooks/useUserCompanyRole";

interface InlineDateEditorProps {
  label: string;
  value: string | null;
  placeholder?: string;
  disabled?: boolean;
  onSave: (newValue: string | null) => Promise<void>;
  disablePastDates?: boolean;
}

export function InlineDateEditor({
  label,
  value,
  placeholder = "Pick a date",
  disabled = false,
  onSave,
  disablePastDates = false,
}: InlineDateEditorProps) {
  const userCanAdmin = useCanAdmin();

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<Date | undefined>(
    value ? new Date(value) : undefined
  );
  const [isLoading, setIsLoading] = useState(false);

  // Update editValue when value prop changes
  useEffect(() => {
    if (!isEditing) {
      setEditValue(value ? new Date(value) : undefined);
    }
  }, [value, isEditing]);

  const handleEdit = () => {
    if (disabled) return;
    setIsEditing(true);
    setEditValue(value ? new Date(value) : undefined);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(value ? new Date(value) : undefined);
  };

  const handleSave = async () => {
    if (disabled || isLoading) return;

    // Convert Date to ISO string for comparison
    const newValueString = editValue ? editValue.toISOString() : null;

    // Don't save if value hasn't changed
    if (newValueString === value) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);

    try {
      await onSave(newValueString);
      setIsEditing(false);
      toast.success(`${label} updated successfully`);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : `Failed to update ${label.toLowerCase()}`;
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDisplayDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString();
  };

  if (!isEditing) {
    return (
      <div className="flex flex-col w-full gap-2">
        <div className="grid w-full gap-2">
          <Label htmlFor={label.toLowerCase().replace(/\s+/g, "-")}>
            {label}
          </Label>
          <div className="flex h-10 w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm items-center">
            {formatDisplayDate(value)}
          </div>
        </div>
        {userCanAdmin && (
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="ghost"
              className="cursor-pointer"
              onClick={handleEdit}
              disabled={disabled}
            >
              <IconPencil className="h-3 w-3 mr-1" />
              Edit
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full gap-2">
      <div className="grid w-full gap-2">
        <Label htmlFor={label.toLowerCase().replace(/\s+/g, "-")}>
          {label}
        </Label>
        <DatePicker
          date={editValue}
          onDateChange={setEditValue}
          placeholder={placeholder}
          disabled={isLoading}
          disablePastDates={disablePastDates}
          className="w-full"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleCancel}
          disabled={isLoading}
        >
          <IconX className="h-3 w-3 mr-1" />
          Cancel
        </Button>
        <Button size="sm" onClick={handleSave} disabled={isLoading}>
          <IconCheck className="h-3 w-3 mr-1" />
          {isLoading ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
