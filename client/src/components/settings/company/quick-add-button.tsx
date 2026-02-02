import { AddItemButton } from "./add-item-button";
import { AddRoleButton } from "./detail-panel/components/add-role-button";
import { AddDirectReportButton } from "./detail-panel/components/add-direct-report-button";
import type {
  CreateableTreeNode,
  CreateableTreeNodeType,
  RoleNode,
  WorkGroupNode,
} from "@/types/api/companies";

interface QuickAddButtonProps {
  parentItem: CreateableTreeNode;
  parentType: CreateableTreeNodeType;
  addType: CreateableTreeNodeType;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function QuickAddButton({
  parentItem,
  parentType,
  addType,
  onSuccess,
  onError,
}: QuickAddButtonProps) {
  const typeConfig = {
    business_unit: {
      name: "Business Unit",
    },
    region: { name: "Region", defaults: {} },
    site: {
      name: "Site",
    },
    asset_group: {
      name: "Asset Group",
    },
    work_group: { name: "Work Group", defaults: {} },
    role: {
      name: "Role",
    },
  };

  const config = typeConfig[addType];

  // Special handling for role creation
  if (addType === "role") {
    // If parent is a role, use AddDirectReportButton, otherwise use AddRoleButton
    if (parentType === "role") {
      return (
        <AddDirectReportButton
          parentRole={parentItem as RoleNode}
          onSuccess={onSuccess}
        />
      );
    } else {
      return (
        <AddRoleButton
          parentWorkGroup={parentItem as WorkGroupNode}
          onSuccess={onSuccess}
        />
      );
    }
  }

  return (
    <AddItemButton
      parentItem={parentItem}
      newItemType={addType}
      newItemName={config.name}
      onSuccess={onSuccess}
      onError={onError}
    />
  );
}
