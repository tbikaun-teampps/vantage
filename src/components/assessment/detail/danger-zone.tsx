import { Button } from "@/components/ui/button";
import { IconTrash } from "@tabler/icons-react";

interface DangerZoneProps {
  onDeleteClick: () => void;
  isDeleting: boolean;
}

export function DangerZone({ onDeleteClick, isDeleting }: DangerZoneProps) {
  return (
    <div
      className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-lg p-4"
      data-tour="assessment-danger-zone"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-red-700 dark:text-red-300">
            Danger Zone
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
            Permanently delete this assessment and all its data.
          </p>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={onDeleteClick}
          disabled={isDeleting}
        >
          <IconTrash className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>
  );
}
