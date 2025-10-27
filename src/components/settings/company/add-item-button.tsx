import { useState } from "react";
import { toast } from "sonner";
import { useTreeNodeActions } from "@/hooks/useCompany";
import { Button } from "@/components/ui/button";
import { IconLoader2, IconPlus } from "@tabler/icons-react";
import type { TreeNodeType } from "@/types/company";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";

interface AddItemButtonProps {
  parentItem: any;
  parentType: TreeNodeType;
  newItemType: TreeNodeType;
  newItemName: string;
  defaultValues?: Record<string, any>;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost";
  className?: string;
}

export function AddItemButton({
  parentItem,
  parentType,
  newItemType,
  newItemName,
  onSuccess,
  onError,
  size = "sm",
  variant = "outline",
  className = "",
}: AddItemButtonProps) {
  const [loading, setLoading] = useState(false);
  const { createTreeNode } = useTreeNodeActions();
  const companyId = useCompanyFromUrl();

  const handleCreate = async () => {
    setLoading(true);

    try {
      const formData = new FormData();

      // Add default values
      formData.append("name", `New ${newItemName}`);
      formData.append("code", "");
      formData.append("description", "");

      await createTreeNode({
        parentType: parentType,
        parentId: parseInt(parentItem.id),
        nodeType: newItemType,
        formData,
        companyId: companyId!,
      });

      toast.success(`${newItemName} created successfully`);
      onSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `Failed to create ${newItemName.toLowerCase()}`;

      toast.error(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCreate}
      disabled={loading}
      className={`h-8 ${className}`}
    >
      {loading ? (
        <IconLoader2 className="h-3 w-3 mr-2 animate-spin" />
      ) : (
        <IconPlus className="h-3 w-3 mr-2" />
      )}
      {loading ? "Adding..." : `Add ${newItemName}`}
    </Button>
  );
}
