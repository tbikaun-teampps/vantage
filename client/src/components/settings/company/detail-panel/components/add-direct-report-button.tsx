import { useState } from "react";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@tabler/icons-react";
import { CreateDirectReportDialog } from "./create-direct-report-dialog";
import type { RoleNode } from "@/types/api/companies";

interface AddDirectReportButtonProps {
  parentRole: RoleNode;
  onSuccess?: () => void;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost";
  className?: string;
}

export function AddDirectReportButton({
  parentRole,
  onSuccess,
  size = "sm",
  variant = "outline",
  className = "",
}: AddDirectReportButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSuccess = () => {
    onSuccess?.();
    setDialogOpen(false);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setDialogOpen(true)}
        className={`h-8 ${className}`}
        type='button'
      >
        <IconPlus className="h-3 w-3 mr-2" />
        Add Direct Report
      </Button>

      <CreateDirectReportDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        parentRole={parentRole}
        onSuccess={handleSuccess}
      />
    </>
  );
}