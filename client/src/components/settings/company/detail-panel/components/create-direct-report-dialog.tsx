import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IconUser, IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";
import { RoleSelector } from "./role-selector";
import { FormSelect } from "./form-fields";
import { LEVELS } from "@/lib/library/roles";
import { useTreeNodeActions } from "@/hooks/useCompany";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";
import type { RoleNode } from "@/types/api/companies";

// Schema for direct report creation - includes reports_to_role_id
const createDirectReportSchema = z.object({
  shared_role_id: z.string().min(1, "Please select a role"),
  level: z.enum(LEVELS as [string, ...string[]]).optional(),
});

type CreateDirectReportFormData = z.infer<typeof createDirectReportSchema>;

interface CreateDirectReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentRole: RoleNode; // The role that this direct report will report to
  onSuccess?: () => void;
}

export function CreateDirectReportDialog({
  open,
  onOpenChange,
  parentRole,
  onSuccess,
}: CreateDirectReportDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { createTreeNode } = useTreeNodeActions();
  const companyId = useCompanyFromUrl();

  const form = useForm<CreateDirectReportFormData>({
    resolver: zodResolver(createDirectReportSchema),
    defaultValues: {
      shared_role_id: "",
      level: undefined,
    },
  });

  const handleSubmit = async (data: CreateDirectReportFormData) => {
    if (!companyId || !parentRole) return;

    setIsLoading(true);
    try {
      // Create FormData with role information and reports_to_role_id
      const formData = new FormData();
      formData.append("shared_role_id", data.shared_role_id);
      if (data.level) {
        formData.append("level", data.level);
      }
      // Set the reports_to_role_id to the parent role
      formData.append("reports_to_role_id", parentRole.id.toString());
      // Also include the work_group_id from the parent role
      formData.append("work_group_id", parentRole.work_group_id.toString());

      await createTreeNode({
        parentId: parentRole.work_group_id,
        nodeType: "role",
        formData,
        companyId,
      });

      toast.success("Direct report created successfully");
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create direct report"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
              <IconUser className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <DialogTitle>Add Direct Report</DialogTitle>
              <DialogDescription>
                Create a new role that reports to{" "}
                {parentRole?.name || "this role"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-4">
            <RoleSelector
              control={form.control}
              name="shared_role_id"
              label="Role"
              placeholder="Select a shared role..."
              selectOnly={false}
              disabled={isLoading}
            />

            <FormSelect
              control={form.control}
              name="level"
              label="Role Level"
              options={LEVELS.map((level) => ({
                value: level,
                label: level.charAt(0).toUpperCase() + level.slice(1),
              }))}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && (
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Direct Report
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
