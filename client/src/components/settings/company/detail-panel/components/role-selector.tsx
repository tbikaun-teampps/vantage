import React, { useState, useMemo, useEffect } from "react";
import {
  type Control,
  Controller,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
  IconCheck,
  IconChevronDown,
  IconPlus,
  IconUser,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import {
  useAllSharedRoles,
  useUserSharedRoles,
  useSharedRoleActions,
} from "@/hooks/useSharedRoles";
import { toast } from "sonner";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";
import type {
  CreateSharedRoleBodyData,
  CreateSharedRoleResponseData,
} from "@/types/api/shared";

// Convert SharedRole to RoleOption format for consistency
interface RoleOption {
  id: string;
  title: string;
  description?: string;
  isUserRole?: boolean; // Track if user created this role
}

const convertSharedRoleToOption = (
  role: CreateSharedRoleResponseData,
  isUserRole = false
): RoleOption => ({
  id: role.id.toString(),
  title: role.name,
  description: role.description || undefined,
  isUserRole,
});

interface RoleSelectorProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  placeholder?: string;
  className?: string;
  onSharedRoleSelected?: (sharedRoleId: string | null) => void;
  selectOnly?: boolean; // If true, only allows selection, no creation
  disabled: boolean; // If true, the selector is disabled
}

interface CreateRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoleCreated: (role: RoleOption) => void;
}

interface EditRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: RoleOption | null;
  onRoleUpdated: (role: RoleOption) => void;
}

// Dialog for creating new roles
function CreateRoleDialog({
  open,
  onOpenChange,
  onRoleCreated,
}: CreateRoleDialogProps) {
  const companyId = useCompanyFromUrl();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const { createRole, isCreating } = useSharedRoleActions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      const roleData: CreateSharedRoleBodyData = {
        name: formData.title,
        description: formData.description || undefined,
        companyId: companyId!, // Assume companyId is always available here
      };

      const newRole = await createRole(roleData);
      const newRoleOption = convertSharedRoleToOption(newRole, true);
      onRoleCreated(newRoleOption);
      onOpenChange(false);
      setFormData({ title: "", description: "" });
      toast.success("Role created successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create role"
      );
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setFormData({ title: "", description: "" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconUser className="h-4 w-4" />
            Create New Role
          </DialogTitle>
          <DialogDescription>
            Add a custom role that's not in the preset list.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Role Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="e.g., Maintenance Engineer, Safety Officer"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Brief description of the role (optional)"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating || !formData.title.trim()}
            >
              {isCreating ? "Creating..." : "Create Role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Dialog for editing existing roles (only user-created roles)
function EditRoleDialog({
  open,
  onOpenChange,
  role,
  onRoleUpdated,
}: EditRoleDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const { updateRole, isUpdating } = useSharedRoleActions();

  // Initialize form data when role changes
  useEffect(() => {
    if (role) {
      setFormData({
        title: role.title,
        description: role.description || "",
      });
    }
  }, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !role) return;

    try {
      const roleData = {
        name: formData.title,
        description: formData.description || undefined,
      };

      const updatedRole = await updateRole(parseInt(role.id), roleData);
      const updatedRoleOption = convertSharedRoleToOption(updatedRole, true);
      onRoleUpdated(updatedRoleOption);
      onOpenChange(false);
      toast.success("Role updated successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update role"
      );
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconEdit className="h-4 w-4" />
            Edit Role
          </DialogTitle>
          <DialogDescription>Update the role details.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Role Title *</Label>
            <Input
              id="edit-title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="e.g., Senior Maintenance Engineer"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Input
              id="edit-description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Brief description of the role"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUpdating || !formData.title.trim()}
            >
              {isUpdating ? "Updating..." : "Update Role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function RoleSelector<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder = "Search or select a role...",
  className = "",
  onSharedRoleSelected,
  selectOnly = false,
  disabled = false,
}: RoleSelectorProps<TFieldValues>) {
  const [open, setOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleOption | null>(null);
  const [searchValue, setSearchValue] = useState("");

  const { data: sharedRoles = [], isLoading: isLoadingAll } =
    useAllSharedRoles();
  const { data: userRoles = [] } = useUserSharedRoles();
  const { deleteRole } = useSharedRoleActions();

  // Convert shared roles to role options
  const allRoles = useMemo(() => {
    return sharedRoles.map((role) =>
      convertSharedRoleToOption(
        role,
        userRoles.some((userRole) => userRole.id === role.id)
      )
    );
  }, [sharedRoles, userRoles]);

  // Filter roles based on search
  const filteredRoles = useMemo(() => {
    if (!searchValue) return allRoles;

    return allRoles.filter(
      (role) =>
        role.title.toLowerCase().includes(searchValue.toLowerCase()) ||
        (role.description &&
          role.description.toLowerCase().includes(searchValue.toLowerCase()))
    );
  }, [allRoles, searchValue]);

  const handleRoleCreated = () => {
    // The store will automatically update the allRoles when a new role is created
    // No need to manually update local state
    // When a new role is created, it's a custom role (not associated with shared role)
    onSharedRoleSelected?.(null);
  };

  const handleRoleUpdated = () => {
    // The store will automatically update the allRoles when a role is updated
    // No need to manually update local state
  };

  const handleEditRole = (role: RoleOption) => {
    setEditingRole(role);
    setEditDialogOpen(true);
  };

  const handleDeleteRole = async (role: RoleOption) => {
    if (!role.isUserRole) {
      toast.error("You can only delete roles you created");
      return;
    }

    if (confirm(`Are you sure you want to delete "${role.title}"?`)) {
      try {
        await deleteRole(parseInt(role.id));
        toast.success("Role deleted successfully!");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to delete role"
        );
      }
    }
  };

  if (isLoadingAll) {
    return <div>Loading roles...</div>;
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium">{label}</Label>

      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          const selectedRole = allRoles.find((role) => role.id === field.value);

          return (
            <>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild disabled={disabled}>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between h-10"
                    disabled={disabled}
                  >
                    {selectedRole ? (
                      <div className="flex items-center gap-2">
                        <span className="truncate">{selectedRole.title}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">
                        {placeholder}
                      </span>
                    )}
                    <IconChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent
                  className="w-[400px] p-0"
                  align="start"
                  sideOffset={4}
                >
                  <Command className="max-h-[300px]">
                    <CommandInput
                      placeholder="Search roles..."
                      value={searchValue}
                      onValueChange={setSearchValue}
                    />
                    {filteredRoles.length > 0 && !selectOnly && (
                      <div className="border-t p-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setOpen(false);
                            setCreateDialogOpen(true);
                          }}
                          className="w-full justify-start h-8"
                        >
                          <IconPlus className="h-3 w-3 mr-2" />
                          Create new role
                        </Button>
                      </div>
                    )}
                    <CommandList className="max-h-[200px] overflow-y-auto scroll-smooth">
                      <CommandEmpty className="py-3">
                        <div className="text-center space-y-2">
                          <p className="text-sm text-muted-foreground">
                            No roles found.
                          </p>
                          {!selectOnly && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setOpen(false);
                                setCreateDialogOpen(true);
                              }}
                              className="h-8"
                            >
                              <IconPlus className="h-3 w-3 mr-1" />
                              Create "{searchValue || "New Role"}"
                            </Button>
                          )}
                        </div>
                      </CommandEmpty>

                      <CommandGroup
                        onWheel={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        {filteredRoles.map((role) => (
                          <CommandItem
                            key={role.id}
                            value={role.title}
                            onSelect={() => {
                              field.onChange(role.id);
                              onSharedRoleSelected?.(role.id);
                              setOpen(false);
                              setSearchValue("");
                            }}
                            className="flex items-center justify-between py-2"
                          >
                            <div className="flex items-center gap-2">
                              <IconCheck
                                className={cn(
                                  "h-4 w-4",
                                  field.value === role.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">
                                    {role.title}
                                  </span>
                                  {role.isUserRole && (
                                    <Badge
                                      variant="default"
                                      className="text-xs"
                                    >
                                      Your Role
                                    </Badge>
                                  )}
                                </div>
                                {role.description && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {role.description}
                                  </div>
                                )}
                              </div>
                            </div>
                            {role.isUserRole && (
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpen(false);
                                    handleEditRole(role);
                                  }}
                                  className="h-6 w-6 p-0"
                                >
                                  <IconEdit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpen(false);
                                    handleDeleteRole(role);
                                  }}
                                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                >
                                  <IconTrash className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {!selectOnly && (
                <>
                  <CreateRoleDialog
                    open={createDialogOpen}
                    onOpenChange={setCreateDialogOpen}
                    onRoleCreated={handleRoleCreated}
                  />

                  <EditRoleDialog
                    open={editDialogOpen}
                    onOpenChange={setEditDialogOpen}
                    role={editingRole}
                    onRoleUpdated={handleRoleUpdated}
                  />
                </>
              )}
            </>
          );
        }}
      />
    </div>
  );
}
