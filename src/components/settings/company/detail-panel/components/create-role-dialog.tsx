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
import type { WorkGroupNode } from "@/types/api/companies";

// Schema for role creation - only requires shared_role_id
const createRoleSchema = z.object({
  shared_role_id: z.string().min(1, "Please select a role"),
  level: z.enum(LEVELS as [string, ...string[]]).optional(),
});

type CreateRoleFormData = z.infer<typeof createRoleSchema>;

interface CreateRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentWorkGroup: WorkGroupNode; // The work group where the role will be created
  onSuccess?: () => void;
}

export function CreateRoleDialog({
  open,
  onOpenChange,
  parentWorkGroup,
  onSuccess,
}: CreateRoleDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { createTreeNode } = useTreeNodeActions();
  const companyId = useCompanyFromUrl();

  const form = useForm<CreateRoleFormData>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      shared_role_id: "",
      level: undefined,
    },
  });

  // Helper to check for duplicate roles in the target work group
  const checkForDuplicateRole = (sharedRoleId: string): string | null => {
    const existingRole = parentWorkGroup.roles?.find(
      (role) => role.shared_role_id.toString() === sharedRoleId
    );

    if (existingRole) {
      return `This role already exists in the work group: "${existingRole.name}"`;
    }

    return null;
  };

  const handleSubmit = async (data: CreateRoleFormData) => {
    setIsLoading(true);

    try {
      // Check for duplicate roles
      const duplicateError = checkForDuplicateRole(data.shared_role_id);
      if (duplicateError) {
        toast.error(duplicateError);
        return;
      }

      // Convert to FormData for the store
      const formData = new FormData();
      formData.append("shared_role_id", data.shared_role_id);
      if (data.level) formData.append("level", data.level);

      await createTreeNode({
        parentId: parentWorkGroup.id,
        nodeType: "role",
        formData,
        companyId: companyId!,
      });

      toast.success("Role created successfully!");
      onSuccess?.();
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Role creation error:", error);
      toast.error("An error occurred while creating the role");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    form.reset();
  };

  const roleLevelOptions = LEVELS.map((level) => ({
    value: level,
    label: level.charAt(0).toUpperCase() + level.slice(1),
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconUser className="h-4 w-4" />
            Add New Role
          </DialogTitle>
          <DialogDescription>
            Select a role and configure its details for this work group.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <RoleSelector
                control={form.control}
                name="shared_role_id"
                label="Role *"
                placeholder="Select a role..."
                selectOnly={false}
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormSelect
                control={form.control}
                name="level"
                label="Level"
                options={roleLevelOptions}
                placeholder="Select level..."
                required
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !form.watch("shared_role_id") || !form.watch("level")}
            >
              {isLoading ? (
                <>
                  <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Add Role"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
