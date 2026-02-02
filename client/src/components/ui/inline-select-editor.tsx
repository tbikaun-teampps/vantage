import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconPencil, IconCheck, IconX } from "@tabler/icons-react";
import { toast } from "sonner";
import { useCanAdmin } from "@/hooks/useUserCompanyRole";

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface InlineSelectEditorProps {
  label: string;
  value: string;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  onSave: (newValue: string) => Promise<void>;
  renderValue?: (value: string) => React.ReactNode;
}

export function InlineSelectEditor({
  label,
  value,
  options,
  placeholder = "Select an option",
  disabled = false,
  onSave,
  renderValue,
}: InlineSelectEditorProps) {
  const userCanAdmin = useCanAdmin();

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);

  // Update editValue when value prop changes
  useEffect(() => {
    if (!isEditing) {
      setEditValue(value);
    }
  }, [value, isEditing]);

  const handleEdit = () => {
    if (disabled) return;
    setIsEditing(true);
    setEditValue(value);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(value);
  };

  const handleSave = async () => {
    if (disabled || isLoading) return;

    // Don't save if value hasn't changed
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);

    try {
      await onSave(editValue);
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

  const getDisplayValue = () => {
    if (renderValue) {
      return renderValue(value);
    }
    const option = options.find((opt) => opt.value === value);
    return option ? (
      <div className="flex items-center gap-2">
        {option.icon}
        <span>{option.label}</span>
      </div>
    ) : (
      value
    );
  };

  if (!isEditing) {
    return (
      <div className="flex flex-col w-full gap-2">
        <div className="grid w-full gap-2">
          <Label htmlFor={label.toLowerCase().replace(/\s+/g, "-")}>
            {label}
          </Label>
          <div className="flex h-10 w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm">
            {getDisplayValue()}
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
        <Select
          value={editValue}
          onValueChange={setEditValue}
          disabled={isLoading}
        >
          <SelectTrigger
            id={label.toLowerCase().replace(/\s+/g, "-")}
            className="w-full"
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                <div className="flex items-center gap-2">
                  {option.icon}
                  <span>{option.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
