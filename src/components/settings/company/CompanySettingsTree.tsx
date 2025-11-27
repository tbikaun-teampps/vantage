import { useMemo, useState } from "react";
import type { UniqueIdentifier } from "@dnd-kit/core";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { CompanyTree, AnyTreeNode, CompanyTreeNodeType, WorkGroupNode, RoleNode } from "@/types/api/companies";
import { SortableTree, type CompanyTreeItem } from "./sortable-tree";
import { useTreeNodeActions } from "@/hooks/useCompany";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogOverlay,
  AlertDialogPortal,
} from "@/components/ui/alert-dialog";
import { CreateRoleDialog } from "./detail-panel/components/create-role-dialog";
import { CreateDirectReportDialog } from "./detail-panel/components/create-direct-report-dialog";

// Maps entity type to the child type it can create
const CHILD_TYPE_MAP: Record<string, CompanyTreeNodeType> = {
  company: "business_unit",
  business_unit: "region",
  region: "site",
  site: "asset_group",
  asset_group: "work_group",
  work_group: "role",
  role: "role", // Reporting role
};

interface CompanySettingsTreeProps {
  tree: CompanyTree;
  expandedNodes: Set<string>;
  toggleExpanded: (nodeId: string) => void;
  handleBulkToggleExpanded: (nodeIds: string[], expand: boolean) => void;
  onSelectItem: (item: AnyTreeNode | null) => void;
  selectedItem: AnyTreeNode | null;
}

export function CompanySettingsTree({
  tree,
  expandedNodes,
  toggleExpanded,
  onSelectItem,
  selectedItem,
}: CompanySettingsTreeProps) {
  const { createTreeNode, deleteTreeNode } = useTreeNodeActions();
  const companyId = useCompanyFromUrl();
  const [deleteDialogItem, setDeleteDialogItem] = useState<CompanyTreeItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // State for role creation dialogs
  const [createRoleDialogWorkGroup, setCreateRoleDialogWorkGroup] = useState<WorkGroupNode | null>(null);
  const [createDirectReportDialogRole, setCreateDirectReportDialogRole] = useState<RoleNode | null>(null);

  // expandedNodes now contains full tree item IDs (e.g., "work_group_1", "business_unit_2")
  // Just convert to Set<UniqueIdentifier> for SortableTree
  const expandedItems = useMemo(() => {
    return new Set<UniqueIdentifier>(expandedNodes);
  }, [expandedNodes]);

  const handleToggleCollapsed = (id: UniqueIdentifier) => {
    // Use the full tree item ID (e.g., "work_group_1") instead of just the numeric ID
    // This avoids conflicts between entities with the same numeric ID across different tables
    toggleExpanded(String(id));
  };

  const handleAddChild = async (parentItem: CompanyTreeItem) => {
    if (!companyId) return;

    const childType = CHILD_TYPE_MAP[parentItem.entityType];
    if (!childType) return;

    // For work_group → role, show the CreateRoleDialog
    if (parentItem.entityType === "work_group") {
      setCreateRoleDialogWorkGroup(parentItem.entity as WorkGroupNode);
      return;
    }

    // For role → reporting role, show the CreateDirectReportDialog
    if (parentItem.entityType === "role") {
      setCreateDirectReportDialogRole(parentItem.entity as RoleNode);
      return;
    }

    // For other entity types, create directly with default values
    const childTypeName = childType.replace("_", " ");
    const capitalizedChildTypeName = childTypeName
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    try {
      const formData = new FormData();
      formData.append("name", `New ${capitalizedChildTypeName}`);
      formData.append("code", "");
      formData.append("description", "");

      await createTreeNode({
        parentId: Number(parentItem.entity.id),
        nodeType: childType,
        formData,
        companyId,
      });

      toast.success(`${capitalizedChildTypeName} created successfully`);

      // Expand the parent to show the new child
      if (!expandedNodes.has(String(parentItem.id))) {
        toggleExpanded(String(parentItem.id));
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `Failed to create ${childTypeName}`;
      toast.error(errorMessage);
    }
  };

  const handleDeleteItem = (item: CompanyTreeItem) => {
    setDeleteDialogItem(item);
  };

  const confirmDelete = async () => {
    if (!deleteDialogItem || !companyId) return;

    setIsDeleting(true);
    try {
      await deleteTreeNode({
        nodeType: deleteDialogItem.entityType,
        nodeId: deleteDialogItem.entity.id,
        companyId,
      });

      const typeName = deleteDialogItem.entityType.replace("_", " ");
      toast.success(
        `${typeName.charAt(0).toUpperCase() + typeName.slice(1)} "${deleteDialogItem.name}" deleted successfully`
      );

      // Clear selection if the deleted item was selected
      if (selectedItem && selectedItem.id === deleteDialogItem.entity.id) {
        onSelectItem(null);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete item";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
      setDeleteDialogItem(null);
    }
  };

  const getItemTypeLabel = (entityType: string) => {
    return entityType
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  };

  return (
    <>
      <div className="border-r flex flex-col h-full" data-tour="company-tree">
        <ScrollArea className="flex-1 h-full">
          <div className="p-6">
            <SortableTree
              companyTree={tree}
              expandedItems={expandedItems}
              onToggleCollapsed={handleToggleCollapsed}
              onSelectItem={onSelectItem}
              selectedItem={selectedItem}
              onAddChild={handleAddChild}
              onDeleteItem={handleDeleteItem}
            />
          </div>
        </ScrollArea>
      </div>

      <AlertDialog
        open={deleteDialogItem !== null}
        onOpenChange={(open) => !open && setDeleteDialogItem(null)}
      >
        <AlertDialogPortal>
          <AlertDialogOverlay className="z-[9998]" />
          <AlertDialogContent className="z-[9999]">
            <AlertDialogHeader>
              <AlertDialogTitle>
                Delete {deleteDialogItem && getItemTypeLabel(deleteDialogItem.entityType)}
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the{" "}
                {deleteDialogItem && getItemTypeLabel(deleteDialogItem.entityType).toLowerCase()}{" "}
                &quot;{deleteDialogItem?.name}&quot;?
                <br />
                <br />
                <strong>This action is permanent and cannot be undone</strong>.
                It will remove all associated data, including any child nodes.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialog>

      {/* Create Role Dialog - for adding roles to work groups */}
      {createRoleDialogWorkGroup && (
        <CreateRoleDialog
          open={true}
          onOpenChange={(open) => !open && setCreateRoleDialogWorkGroup(null)}
          parentWorkGroup={createRoleDialogWorkGroup}
          onSuccess={() => {
            // Expand the work group to show the new role
            const workGroupTreeId = `work_group_${createRoleDialogWorkGroup.id}`;
            if (!expandedNodes.has(workGroupTreeId)) {
              toggleExpanded(workGroupTreeId);
            }
          }}
        />
      )}

      {/* Create Direct Report Dialog - for adding reporting roles to roles */}
      {createDirectReportDialogRole && (
        <CreateDirectReportDialog
          open={true}
          onOpenChange={(open) => !open && setCreateDirectReportDialogRole(null)}
          parentRole={createDirectReportDialogRole}
          onSuccess={() => {
            // Expand the parent role to show the new direct report
            const roleTreeId = `role_${createDirectReportDialogRole.id}`;
            if (!expandedNodes.has(roleTreeId)) {
              toggleExpanded(roleTreeId);
            }
          }}
        />
      )}
    </>
  );
}
