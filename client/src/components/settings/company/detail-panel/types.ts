import type { AnyTreeNode, CompanyTreeNodeType } from "@/types/api/companies";

export interface FormHeaderProps {
  icon: React.ComponentType<{className?: string}>;
  iconColor: string;
  title: string;
  description: string;
}

export interface FormActionsProps {
  selectedItem: AnyTreeNode;
  itemType: CompanyTreeNodeType;
  onSave?: () => void;
  onDelete?: () => void;
  onClearSelection?: () => void;
}

export interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}
