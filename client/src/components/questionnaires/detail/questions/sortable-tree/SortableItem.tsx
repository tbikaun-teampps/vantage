import React from "react";
import type { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronRight,
  GripVertical,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react";
import type { QuestionnaireTreeItem } from "./adapters";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface SortableItemProps {
  item: QuestionnaireTreeItem;
  depth: number;
  indentationWidth: number;
  collapsed?: boolean;
  onToggleCollapsed?: (id: UniqueIdentifier) => void;
  onSelectItem?: (id: UniqueIdentifier) => void;
  isSelected?: boolean;
  isValidDropTarget?: boolean;
  isDragging?: boolean;
  onAddClick?: (item: QuestionnaireTreeItem) => void;
  showActions?: boolean;
  onEditItem?: (type: "section" | "step", id: number) => void;
  onDeleteItem?: (
    type: "section" | "step" | "question",
    id: number,
    title: string
  ) => void;
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
  onAddClick,
  showActions = false,
  onEditItem,
  onDeleteItem,
}: SortableItemProps) {
  // Placeholders don't use sortable hook
  const sortable = useSortable({
    id: item.id,
    disabled: item.isPlaceholder,
  });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isThisItemDragging,
  } = sortable;

  const style = {
    transform: item.isPlaceholder
      ? undefined
      : CSS.Transform.toString(transform),
    transition: item.isPlaceholder ? undefined : transition,
    paddingLeft: `${depth * indentationWidth}px`,
  };

  const hasChildren = item.children && item.children.length > 0;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleCollapsed?.(item.id);
  };

  const handleClick = () => {
    if (item.isPlaceholder) {
      onAddClick?.(item);
    } else {
      onSelectItem?.(item.id);
    }
  };

  // Render placeholder item differently
  if (item.isPlaceholder) {
    return (
      <div style={{ marginLeft: `${depth * indentationWidth}px` }}>
        <div
          onClick={handleClick}
          className={cn(
            "flex items-center gap-2 py-2 px-3 rounded transition-all cursor-pointer",
            "border border-dashed border-muted-foreground/30",
            "hover:bg-accent/30 hover:border-muted-foreground/50",
            "text-muted-foreground"
          )}
        >
          {/* Spacer for alignment with tree items */}
          <div className="w-5" />

          {/* Plus icon */}
          <Plus className="h-4 w-4 flex-shrink-0" />

          {/* Add text */}
          <span className="text-sm">{item.name}</span>
        </div>
      </div>
    );
  }

  // Regular draggable item
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

      {/* Hierarchical Number Label */}
      <span className="text-sm text-muted-foreground flex-shrink-0">
        {item.numberLabel}
      </span>

      {/* Entity Name */}
      <span className="truncate flex-1">{item.name}</span>

      {/* Entity Type Badge */}
      <span className="text-xs text-muted-foreground capitalize">
        {item.entityType}
      </span>

      {/* Actions Dropdown Menu */}
      {showActions && item.entity && (
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
            {/* Edit option for sections and steps only */}
            {(item.entityType === "section" || item.entityType === "step") && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEditItem?.(
                    item.entityType as "section" | "step",
                    item.entity!.id
                  );
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit {item.entityType}
              </DropdownMenuItem>
            )}
            {/* Delete option for all types */}
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDeleteItem?.(item.entityType, item.entity!.id, item.name);
              }}
              className="text-red-600 dark:text-red-400"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete {item.entityType}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Drag Handle - all items are draggable */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing hover:text-foreground text-muted-foreground ml-2"
      >
        <GripVertical className="h-4 w-4" />
      </div>
    </div>
  );
}
