import React from "react";
import { Separator } from "@/components/ui/separator";
import { SaveChangesButton } from "../../save-changes-button";
import { DeleteButton } from "../../delete-button";
import { type FormActionsProps } from "../types";
import { toast } from "sonner";
import { useCanAdmin } from "@/hooks/useUserCompanyRole";

export const FormActions: React.FC<
  FormActionsProps & {
    compact?: boolean;
    isDirty?: boolean;
  }
> = ({
  selectedItem,
  itemType,
  onSave,
  onDelete,
  onClearSelection,
  compact = false,
  isDirty = true,
}) => {
  const userCanAdmin = useCanAdmin();
  if (!userCanAdmin) return null;

  const handleError = (error: string) => {
    toast.error(error);
  };

  if (compact) {
    return (
      <div className="flex gap-2">
        {onSave && (
          <SaveChangesButton
            item={selectedItem}
            itemType={itemType}
            onSuccess={onSave}
            onError={handleError}
            disabled={!isDirty}
          />
        )}
        {onDelete && (
          <DeleteButton
            item={selectedItem}
            itemType={itemType}
            onSuccess={onDelete}
            onError={handleError}
            onClearSelection={onClearSelection}
          />
        )}
      </div>
    );
  }

  return (
    <div>
      <Separator />
      <div className="flex gap-3 mt-6">
        {onSave && (
          <SaveChangesButton
            item={selectedItem}
            itemType={itemType}
            onSuccess={onSave}
            onError={handleError}
            disabled={!isDirty}
          />
        )}
        {onDelete && (
          <DeleteButton
            item={selectedItem}
            itemType={itemType}
            onSuccess={onDelete}
            onError={handleError}
            onClearSelection={onClearSelection}
          />
        )}
      </div>
    </div>
  );
};
