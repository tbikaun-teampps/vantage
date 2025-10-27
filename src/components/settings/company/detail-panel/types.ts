import type { TreeNodeType } from "@/types/company";

export interface DetailPanelProps {
  selectedItem: any; // Replace with actual type
  setSelectedItem: (item: any) => void; // Replace with actual type
}

export interface FormHeaderProps {
  icon: React.ComponentType<any>;
  iconColor: string;
  title: string;
  description: string;
}

export interface FormActionsProps {
  selectedItem: any;
  itemType: string;
  onSave?: () => void;
  onDelete?: () => void;
  onClearSelection?: () => void;
}

export interface EntityBadgesProps {
  entities: any[];
  icon: React.ComponentType<any>;
  parentItem: any;
  parentType: TreeNodeType;
  addType: string;
  onAddSuccess: () => void;
}

export interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}