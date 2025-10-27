import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { IconPencil, IconCheck, IconX } from "@tabler/icons-react";
import { toast } from "sonner";
import { useCanAdmin } from "@/hooks/useUserCompanyRole";

interface InlineFieldEditorProps {
  label: string;
  value: string;
  placeholder?: string;
  type?: "input" | "textarea";
  disabled?: boolean;
  onSave: (newValue: string) => Promise<void>;
  validation?: (value: string) => string | null; // Returns error message or null
  maxLength?: number;
  minRows?: number;
  required?: boolean;
}

export function InlineFieldEditor({
  label,
  value,
  placeholder = "",
  type = "input",
  disabled = false,
  onSave,
  validation,
  maxLength,
  minRows = 3,
  required = false,
}: InlineFieldEditorProps) {
  const userCanAdmin = useCanAdmin();

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(value);
    setError(null);
  };

  const handleSave = async () => {
    if (disabled || isLoading) return;

    // Validate the input
    if (validation) {
      const validationError = validation(editValue);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    // Don't save if value hasn't changed
    if (editValue.trim() === value.trim()) {
      setIsEditing(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onSave(editValue.trim());
      setIsEditing(false);
      toast.success(`${label} updated successfully`);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : `Failed to update ${label.toLowerCase()}`;
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleCancel();
    } else if (e.key === "Enter" && type === "input" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  if (!isEditing) {
    return (
      <div className="flex flex-col w-full gap-2">
        <div className="grid w-full gap-2">
          <Label htmlFor={label.toLowerCase().replace(/\s+/g, "-")}>
            {label}
            {required && <span className="text-red-500">*</span>}
          </Label>
          {type === "textarea" ? (
            <Textarea
              id={label.toLowerCase().replace(/\s+/g, "-")}
              readOnly
              placeholder={placeholder}
              value={value}
              className="min-h-[80px] resize-none bg-muted/30"
            />
          ) : (
            <Input
              id={label.toLowerCase().replace(/\s+/g, "-")}
              readOnly
              placeholder={placeholder}
              value={value}
              className="bg-muted/30"
            />
          )}
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
        {type === "textarea" ? (
          <Textarea
            id={label.toLowerCase().replace(/\s+/g, "-")}
            placeholder={placeholder}
            value={editValue}
            onChange={(e) => {
              setEditValue(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            maxLength={maxLength}
            className={`min-h-[80px] ${error ? "border-red-500 focus:border-red-500" : ""}`}
            rows={minRows}
            autoFocus
          />
        ) : (
          <Input
            id={label.toLowerCase().replace(/\s+/g, "-")}
            placeholder={placeholder}
            value={editValue}
            onChange={(e) => {
              setEditValue(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            maxLength={maxLength}
            className={error ? "border-red-500 focus:border-red-500" : ""}
            autoFocus
          />
        )}
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        {maxLength && (
          <p className="text-xs text-muted-foreground text-right">
            {editValue.length}/{maxLength}
          </p>
        )}
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
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isLoading || (validation && !!validation(editValue))}
        >
          <IconCheck className="h-3 w-3 mr-1" />
          {isLoading ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
