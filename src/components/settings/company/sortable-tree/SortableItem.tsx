import React from "react";
import type { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronRight, GripVertical, MoreVertical, Plus, Trash2 } from "lucide-react";
import type { CompanyTreeItem } from "./adapters";
import { cn } from "@/lib/utils";
import {
  IconBuilding,
  IconBuildingFactory2,
  IconCube,
  IconMapPin,
  IconUserCircle,
  IconUsersGroup,
  IconWorld,
} from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

// Maps entity type to the child type it can create
const CHILD_TYPE_MAP: Record<string, { type: string; label: string }> = {
  company: { type: "business_unit", label: "Business Unit" },
  business_unit: { type: "region", label: "Region" },
  region: { type: "site", label: "Site" },
  site: { type: "asset_group", label: "Asset Group" },
  asset_group: { type: "work_group", label: "Work Group" },
  work_group: { type: "role", label: "Role" },
  role: { type: "role", label: "Reporting Role" },
};

interface SortableItemProps {
  item: CompanyTreeItem;
  depth: number;
  indentationWidth: number;
  collapsed?: boolean;
  onToggleCollapsed?: (id: UniqueIdentifier) => void;
  onSelectItem?: (id: UniqueIdentifier) => void;
  isSelected?: boolean;
  isValidDropTarget?: boolean;
  isDragging?: boolean;
  onAddChild?: (parentItem: CompanyTreeItem) => void;
  onDeleteItem?: (item: CompanyTreeItem) => void;
}

export function SortableItem({
  item,
  depth,
  indentationWidth,
  collapsed = false,
  onToggleCollapsed,
  onSelectItem,
  isSelected = false,
  isValidDropTarget = false,
  isDragging: isAnyItemDragging = false,
  onAddChild,
  onDeleteItem,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isThisItemDragging,
  } = useSortable({
    id: item.id,
    disabled: item.entityType === "company", // Company root is not draggable
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    paddingLeft: `${depth * indentationWidth}px`,
  };

  const hasChildren = item.children && item.children.length > 0;
  const isCompany = item.entityType === "company";

  // Get icon based on entity type
  const Icon = {
    company: <IconBuilding className="h-4 w-4 text-blue-600 flex-shrink-0" />,
    business_unit: (
      <IconWorld className="h-4 w-4 text-emerald-600 flex-shrink-0" />
    ),
    region: <IconMapPin className="h-4 w-4 text-orange-600 flex-shrink-0" />,
    site: (
      <IconBuildingFactory2 className="h-4 w-4 text-purple-600 flex-shrink-0" />
    ),
    asset_group: <IconCube className="h-4 w-4 text-amber-600 flex-shrink-0" />,
    work_group: (
      <IconUsersGroup className="h-4 w-4 text-teal-600 flex-shrink-0" />
    ),
    role: <IconUserCircle className="h-4 w-4 text-indigo-600 flex-shrink-0" />,
  }[item.entityType];

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleCollapsed?.(item.id);
  };

  const handleClick = () => {
    onSelectItem?.(item.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={handleClick}
      className={cn(
        "flex items-center gap-2 py-2 px-3 rounded transition-all cursor-pointer",
        "hover:bg-accent/50",
        isThisItemDragging && "opacity-50",
        isSelected && "bg-accent",
        // Highlight valid drop targets during drag
        isAnyItemDragging &&
          !isThisItemDragging &&
          isValidDropTarget &&
          "bg-green-500/10",
        // Dim invalid drop targets during drag
        isAnyItemDragging &&
          !isThisItemDragging &&
          !isValidDropTarget &&
          "opacity-40"
      )}
    >
      {/* Expand/Collapse Button */}
      {hasChildren ? (
        <button
          onClick={handleToggle}
          className="p-0.5 hover:bg-primary/10 rounded transition-colors cursor-pointer"
        >
          <ChevronRight
            className={cn(
              "h-4 w-4 transition-transform",
              !collapsed && "rotate-90"
            )}
          />
        </button>
      ) : (
        <div className="w-5" /> // Spacer for alignment
      )}

      {/* Entity Icon */}
      {Icon}

      {/* Entity Name */}
      <span className="truncate flex-1">{item.name}</span>

      {/* Entity Type Badge */}
      <span className="text-xs text-muted-foreground capitalize">
        {item.entityType.replace("_", " ")}
      </span>

      {/* Actions Dropdown Menu */}
      {(onAddChild || onDeleteItem) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onAddChild && CHILD_TYPE_MAP[item.entityType] && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onAddChild(item);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add {CHILD_TYPE_MAP[item.entityType].label}
              </DropdownMenuItem>
            )}
            {onDeleteItem && !isCompany && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteItem(item);
                }}
                className="text-red-600 dark:text-red-400"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete {item.entityType.replace("_", " ")}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Drag Handle - hidden for company root, positioned on the right */}
      {!isCompany ? (
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing hover:text-foreground text-muted-foreground ml-2"
        >
          <GripVertical className="h-4 w-4" />
        </div>
      ) : (
        <div className="w-6" /> // Spacer for company to align with other items
      )}
    </div>
  );
}
