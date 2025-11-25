import { useState, useMemo } from "react";
import type { UniqueIdentifier } from "@dnd-kit/core";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import type {
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { CompanyTree, ReorderCompanyTreeBodyData } from "@/types/api/companies";
import type { TreeItems } from "./types";
import { SortableItem } from "./SortableItem";
import { companyTreeToTreeItems, type CompanyTreeItem } from "./adapters";
import {
  flattenTree,
  findItemDeep,
  getProjection,
  removeItem,
} from "./utilities";
import { useReorderTree } from "@/hooks/useCompany";

const INDENTATION_WIDTH = 24; // pixels per depth level

interface SortableTreeProps {
  companyTree: CompanyTree;
  expandedItems?: Set<UniqueIdentifier>;
  onToggleCollapsed?: (id: UniqueIdentifier) => void;
  onSelectItem?: (
    item: import("@/types/api/companies").AnyTreeNode | null
  ) => void;
  selectedItem?: import("@/types/api/companies").AnyTreeNode | null;
}

export function SortableTree({
  companyTree,
  expandedItems = new Set(),
  onToggleCollapsed,
  onSelectItem,
  selectedItem,
}: SortableTreeProps) {
  // Transform company tree to TreeItems format
  const initialItems = useMemo(
    () => companyTreeToTreeItems(companyTree),
    [companyTree]
  );

  const [items, setItems] = useState<TreeItems>(initialItems);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [offsetLeft, setOffsetLeft] = useState(0);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);

  // Use the reorder tree mutation hook
  const { reorderTree } = useReorderTree(companyTree.id);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Flatten tree for display, showing only items whose ancestors are all expanded
  const flattenedItems = useMemo(() => {
    const flattened = flattenTree(items);

    // Helper to check if all ancestors of an item are expanded
    const areAncestorsExpanded = (item: (typeof flattened)[0]): boolean => {
      if (!item.parentId) return true; // Root has no parent

      // Find parent in flattened list
      const parent = flattened.find((i) => i.id === item.parentId);
      if (!parent) return true; // Shouldn't happen, but safe fallback

      // Parent must be expanded
      if (!expandedItems.has(parent.id)) return false;

      // Recursively check parent's ancestors
      return areAncestorsExpanded(parent);
    };

    // Only show items whose all ancestors are expanded
    return flattened.filter((item) => areAncestorsExpanded(item));
  }, [items, expandedItems]);

  // Get sorted IDs for SortableContext
  const sortedIds = useMemo(
    () => flattenedItems.map((item) => item.id),
    [flattenedItems]
  );

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id);

    // Collapse the dragged item's children during drag for better visual feedback
    // This makes it clear the entire subtree is being moved as one unit
    if (onToggleCollapsed && expandedItems.has(active.id)) {
      onToggleCollapsed(active.id);
    }
  }

  function handleDragMove({ delta }: DragOverEvent) {
    setOffsetLeft(delta.x);
  }

  function handleDragOver({ over }: DragOverEvent) {
    setOverId(over?.id ?? null);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    resetState();

    if (!over || active.id === over.id) {
      return;
    }

    const activeIndex = flattenedItems.findIndex(
      (item) => item.id === active.id
    );
    const overIndex = flattenedItems.findIndex((item) => item.id === over.id);

    if (activeIndex === -1 || overIndex === -1) {
      return;
    }

    // Find the active item in the FULL tree (not flattenedItems) to preserve its children
    const activeItem = findItemDeep(items, active.id) as
      | CompanyTreeItem
      | undefined;

    if (!activeItem) {
      return;
    }

    // Enforce depth constraints based on entity type
    const maxAllowedDepth = {
      company: 0, // Company cannot be moved
      business_unit: 1, // Business Units can only be children of Company
      region: 2, // Regions can only be children of Business Units
      site: 3, // Sites can only be children of Regions
      asset_group: 4, // Asset Groups can only be children of Sites
      work_group: 5, // Work Groups can only be children of Asset Groups
      role: 6, // Roles can only be children of Work Groups
      reporting_role: 7, // Reporting Roles can only be children of Roles (max depth)
    }[activeItem.entityType];

    // Use getProjection to calculate new position
    const projection = getProjection(
      flattenedItems,
      active.id,
      over.id,
      offsetLeft,
      INDENTATION_WIDTH
    );

    // Apply depth constraints
    let { depth, parentId } = projection;

    if (depth > maxAllowedDepth) {
      depth = maxAllowedDepth;
      // Recalculate parentId based on constrained depth
      const previousItem = flattenedItems[overIndex - 1];
      if (depth === 0) {
        parentId = null;
      } else if (previousItem && depth === previousItem.depth) {
        parentId = previousItem.parentId;
      } else if (previousItem && depth > previousItem.depth) {
        parentId = previousItem.id;
      }
    }

    // Ensure entity types can only have valid parents
    const parentItem = parentId
      ? (findItemDeep(items, parentId) as CompanyTreeItem | undefined)
      : null;

    const validParent = validateParentChild(
      activeItem.entityType,
      parentItem?.entityType
    );

    if (!validParent) {
      window.alert("Invalid parent-child relationship detected");
      return;
    }

    // Step 1: Remove the item from its current location (preserving its children)
    const itemsWithoutActive = removeItem(items, active.id);

    // Step 2: Create a deep clone of the active item with all its children preserved
    const clonedActiveItem = JSON.parse(
      JSON.stringify(activeItem)
    ) as CompanyTreeItem;

    // Step 3: Insert the item at its new location
    // We need to recursively update the depth of the moved item and all its descendants
    function updateDepthRecursively(
      item: CompanyTreeItem,
      newDepth: number
    ): CompanyTreeItem {
      return {
        ...item,
        depth: newDepth,
        children: item.children.map((child) =>
          updateDepthRecursively(child as CompanyTreeItem, newDepth + 1)
        ),
      };
    }

    const updatedActiveItem = updateDepthRecursively(clonedActiveItem, depth);

    // Step 4: Insert the item into the new parent
    function insertItemIntoTree(
      tree: TreeItems,
      newParentId: UniqueIdentifier | null,
      itemToInsert: CompanyTreeItem,
      targetId: UniqueIdentifier
    ): TreeItems {
      // If inserting at root level
      if (newParentId === null) {
        const targetIndex = tree.findIndex((item) => item.id === targetId);
        const newTree = [...tree];
        newTree.splice(targetIndex, 0, itemToInsert);
        return newTree;
      }

      // Otherwise, find the parent and insert into its children
      return tree.map((item) => {
        if (item.id === newParentId) {
          // Find the position to insert relative to the target
          const targetIndex = item.children.findIndex(
            (child) => child.id === targetId
          );
          const newChildren = [...item.children];
          if (targetIndex !== -1) {
            newChildren.splice(targetIndex, 0, itemToInsert);
          } else {
            newChildren.push(itemToInsert);
          }
          return { ...item, children: newChildren };
        }

        if (item.children.length) {
          return {
            ...item,
            children: insertItemIntoTree(
              item.children,
              newParentId,
              itemToInsert,
              targetId
            ),
          };
        }

        return item;
      });
    }

    const newTree = insertItemIntoTree(
      itemsWithoutActive,
      parentId,
      updatedActiveItem,
      over.id
    );
    setItems(newTree);

    // Build the payload for the reorder API
    // We need to update: 1) the moved item, 2) new parent's siblings, 3) old parent's siblings (if parent changed)
    const reorderPayload: ReorderCompanyTreeBodyData = [];

    // Get the numeric ID from the tree item ID (e.g., "region_5" -> 5)
    const getNumericId = (treeItemId: string): number => {
      const parts = String(treeItemId).split('_');
      return parseInt(parts[parts.length - 1], 10);
    };

    // Get old parent ID from the flattened items (since nested items don't have parentId)
    const flattenedActiveItem = flattenedItems.find((item) => item.id === activeItem.id);
    const oldParentId = flattenedActiveItem?.parentId;
    const parentChanged = oldParentId !== parentId;

    // Add the moved item
    const movedItemPayload: ReorderCompanyTreeBodyData[number] = {
      id: getNumericId(String(activeItem.id)),
      type: activeItem.entityType as ReorderCompanyTreeBodyData[number]["type"],
      order_index: 0, // Will be updated below
    };

    // Only include parent_id if it changed
    if (parentChanged && parentId) {
      movedItemPayload.parent_id = getNumericId(String(parentId));
    }

    reorderPayload.push(movedItemPayload);

    // Find siblings in the NEW parent and update their order_index
    const newParent = parentId ? findItemDeep(newTree, parentId) : null;
    const newSiblings = parentId ? (newParent?.children || []) : newTree;

    newSiblings.forEach((sibling, index) => {
      if (sibling.id === activeItem.id) {
        // Update the moved item's order_index to its actual position
        reorderPayload[0].order_index = index;
        return;
      }

      const siblingItem = sibling as CompanyTreeItem;
      reorderPayload.push({
        id: getNumericId(String(sibling.id)),
        type: siblingItem.entityType as ReorderCompanyTreeBodyData[number]["type"],
        order_index: index,
      });
    });

    // If parent changed, also update siblings in the OLD parent
    if (parentChanged && oldParentId) {
      const oldParent = findItemDeep(newTree, oldParentId);
      const oldSiblings = oldParent?.children || [];

      oldSiblings.forEach((sibling, index) => {
        const siblingItem = sibling as CompanyTreeItem;
        reorderPayload.push({
          id: getNumericId(String(sibling.id)),
          type: siblingItem.entityType as ReorderCompanyTreeBodyData[number]["type"],
          order_index: index,
        });
      });
    }

    // Call the reorder API
    reorderTree(reorderPayload).catch((error) => {
      console.error('Failed to reorder tree:', error);
    });
  }

  // Helper function to validate parent-child relationships
  function validateParentChild(
    childType:
      | "company"
      | "business_unit"
      | "region"
      | "site"
      | "asset_group"
      | "work_group"
      | "role"
      | "reporting_role",
    parentType?:
      | "company"
      | "business_unit"
      | "region"
      | "site"
      | "asset_group"
      | "work_group"
      | "role"
      | "reporting_role"
  ): boolean {
    if (childType === "company") return false; // Company cannot be moved
    if (childType === "business_unit") return parentType === "company";
    if (childType === "region") return parentType === "business_unit";
    if (childType === "site") return parentType === "region";
    if (childType === "asset_group") return parentType === "site";
    if (childType === "work_group") return parentType === "asset_group";
    if (childType === "role") return parentType === "work_group";
    if (childType === "reporting_role") return parentType === "role";
    return false;
  }

  function handleDragCancel() {
    resetState();
  }

  function resetState() {
    setActiveId(null);
    setOffsetLeft(0);
    setOverId(null);
  }

  function handleToggleCollapsed(id: UniqueIdentifier) {
    onToggleCollapsed?.(id);
  }

  function handleSelectItem(id: UniqueIdentifier) {
    // Find the item in the full tree
    const item = findItemDeep(items, id) as CompanyTreeItem | undefined;

    if (item && onSelectItem) {
      // Convert CompanyTreeItem back to AnyTreeNode by using the entity property
      onSelectItem(item.entity);
    }
  }

  // Check if an item is selected by comparing tree item IDs
  const getIsSelected = (id: UniqueIdentifier): boolean => {
    if (!selectedItem) return false;

    // Generate the tree item ID from the selected entity
    const selectedTreeItemId = `${selectedItem.type}_${selectedItem.id}`;
    return String(id) === selectedTreeItemId;
  };

  // Determine if an item is a valid drop target during drag
  const getIsValidDropTarget = (itemId: UniqueIdentifier): boolean => {
    if (!activeId || !overId) return false;

    const draggedItem = findItemDeep(items, activeId) as
      | CompanyTreeItem
      | undefined;
    const targetItem = findItemDeep(items, itemId) as
      | CompanyTreeItem
      | undefined;

    if (!draggedItem || !targetItem) return false;

    // Can't drop on itself
    if (draggedItem.id === targetItem.id) return false;

    // Company cannot be moved
    if (draggedItem.entityType === "company") return false;

    // Get the valid parent type for the dragged item
    const validParentType: Record<string, string> = {
      business_unit: "company",
      region: "business_unit",
      site: "region",
      asset_group: "site",
      work_group: "asset_group",
      role: "work_group",
      reporting_role: "role",
    };

    const expectedParentType = validParentType[draggedItem.entityType];

    // Highlight items of the valid parent type
    if (expectedParentType && targetItem.entityType === expectedParentType) {
      return true;
    }

    // Also highlight siblings (same entity type, indicating can be reordered with them)
    if (targetItem.entityType === draggedItem.entityType) {
      return true;
    }

    return false;
  };

  const activeItem = activeId
    ? (flattenedItems.find((item) => item.id === activeId) as unknown as
        | CompanyTreeItem
        | undefined)
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-1">
          {flattenedItems.map((item) => (
            <SortableItem
              key={item.id}
              item={item as unknown as CompanyTreeItem}
              depth={item.depth}
              indentationWidth={INDENTATION_WIDTH}
              collapsed={!expandedItems.has(item.id)}
              onToggleCollapsed={handleToggleCollapsed}
              onSelectItem={handleSelectItem}
              isSelected={getIsSelected(item.id)}
              isValidDropTarget={getIsValidDropTarget(item.id)}
              isDragging={activeId !== null}
            />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeItem && (
          <div className="bg-white shadow-lg rounded p-2">
            {activeItem.name}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
