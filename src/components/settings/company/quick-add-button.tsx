import type {
  CreateableTreeNodeType,
  TreeNodeType,
  AnyTreeNode,
} from "@/types/company";
import { AddItemButton } from "./add-item-button";
import { AddRoleButton } from "./detail-panel/components/add-role-button";
import { AddDirectReportButton } from "./detail-panel/components/add-direct-report-button";

interface QuickAddButtonProps {
  parentItem: AnyTreeNode;
  parentType: TreeNodeType;
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
        <AddDirectReportButton parentRole={parentItem} onSuccess={onSuccess} />
      );
    } else {
      return (
        <AddRoleButton parentWorkGroup={parentItem} onSuccess={onSuccess} />
      );
    }
  }

  return (
    <AddItemButton
      parentItem={parentItem}
      parentType={parentType}
      newItemType={addType as TreeNodeType}
      newItemName={config.name}
      onSuccess={onSuccess}
      onError={onError}
    />
  );
}
