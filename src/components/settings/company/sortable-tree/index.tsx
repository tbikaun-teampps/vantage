import { useState, useMemo, useEffect } from "react";
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
import type {
  CompanyTree,
  ReorderCompanyTreeBodyData,
  RoleNode,
} from "@/types/api/companies";
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
import { toast } from "sonner";

const INDENTATION_WIDTH = 24; // pixels per depth level

// Define valid parent entities for error messages
const validParentEntities: Record<string, string> = {
  business_unit: "Company",
  region: "Business Unit",
  site: "Region",
  asset_group: "Site",
  work_group: "Asset Group",
  role: "Work Group or Role",
};
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

  // Sync local state when companyTree changes (e.g., after add/delete via detail panel)
  useEffect(() => {
    setItems(companyTreeToTreeItems(companyTree));
  }, [companyTree]);

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
    // Roles can be at depth 6 (under work_group) or depth 7 (reporting to another role)
    // Only one level of role nesting is allowed (role > reporting_role, not deeper)
    const maxAllowedDepth = {
      company: 0, // Company cannot be moved
      business_unit: 1, // Business Units can only be children of Company
      region: 2, // Regions can only be children of Business Units
      site: 3, // Sites can only be children of Regions
      asset_group: 4, // Asset Groups can only be children of Sites
      work_group: 5, // Work Groups can only be children of Asset Groups
      role: 7, // Roles can be children of Work Groups (depth 6) or other Roles (depth 7, max)
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
      parentItem?.entityType,
      activeItem,
      parentItem
    );

    if (!validParent) {
      toast.error(
        `Cannot move ${activeItem.entityType} to the selected location. This item can only be moved under a ${validParentEntities[activeItem.entityType]}.`
      );
      return;
    }

    // Check for duplicate shared_role_id within the target work group
    if (activeItem.entityType === "role") {
      const targetWorkGroup = findParentWorkGroup(parentId);
      if (targetWorkGroup) {
        const draggedSharedRoleId = (activeItem.entity as RoleNode)
          .shared_role_id;
        const duplicate = findDuplicateRoleInWorkGroup(
          targetWorkGroup,
          draggedSharedRoleId,
          activeItem.id
        );

        if (duplicate) {
          toast.error(
            `Cannot move role here. "${duplicate.name}" already exists in this work group.`
          );
          return;
        }
      }
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
    // insertAfter determines if we insert before or after the target (based on drag direction)
    function insertItemIntoTree(
      tree: TreeItems,
      newParentId: UniqueIdentifier | null,
      itemToInsert: CompanyTreeItem,
      targetId: UniqueIdentifier,
      insertAfter: boolean
    ): TreeItems {
      // If inserting at root level
      if (newParentId === null) {
        const targetIndex = tree.findIndex((item) => item.id === targetId);
        const newTree = [...tree];
        const insertIndex = insertAfter ? targetIndex + 1 : targetIndex;
        newTree.splice(insertIndex, 0, itemToInsert);
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
            const insertIndex = insertAfter ? targetIndex + 1 : targetIndex;
            newChildren.splice(insertIndex, 0, itemToInsert);
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
              targetId,
              insertAfter
            ),
          };
        }

        return item;
      });
    }

    // Determine if we should insert after the target based on drag direction
    const insertAfter = overIndex > activeIndex;

    const newTree = insertItemIntoTree(
      itemsWithoutActive,
      parentId,
      updatedActiveItem,
      over.id,
      insertAfter
    );
    setItems(newTree);

    // Build the payload for the reorder API
    // We need to update: 1) the moved item, 2) new parent's siblings, 3) old parent's siblings (if parent changed)
    const reorderPayload: ReorderCompanyTreeBodyData = [];

    // Get the numeric ID from the tree item ID (e.g., "region_5" -> 5)
    const getNumericId = (treeItemId: string): number => {
      const parts = String(treeItemId).split("_");
      return parseInt(parts[parts.length - 1], 10);
    };

    // Get entity type from tree item ID (e.g., "region_5" -> "region")
    const getEntityType = (treeItemId: string): string => {
      const idStr = String(treeItemId);
      const entityTypes = [
        "business_unit",
        "asset_group",
        "work_group",
        "company",
        "region",
        "site",
        "role",
      ];
      for (const type of entityTypes) {
        if (idStr.startsWith(type + "_")) {
          return type;
        }
      }
      return "";
    };

    // Get old parent ID from the flattened items (since nested items don't have parentId)
    const flattenedActiveItem = flattenedItems.find(
      (item) => item.id === activeItem.id
    );
    const oldParentId = flattenedActiveItem?.parentId;
    const parentChanged = oldParentId !== parentId;

    // Add the moved item
    const movedItemPayload: ReorderCompanyTreeBodyData[number] = {
      id: getNumericId(String(activeItem.id)),
      type: activeItem.entityType as ReorderCompanyTreeBodyData[number]["type"],
      order_index: 0, // Will be updated below
    };

    // Include parent_id and parent_type if parent changed
    if (parentChanged && parentId) {
      movedItemPayload.parent_id = getNumericId(String(parentId));
      // parent_type is needed to disambiguate role parents (work_group vs role)
      movedItemPayload.parent_type = getEntityType(
        String(parentId)
      ) as ReorderCompanyTreeBodyData[number]["type"];
    }

    reorderPayload.push(movedItemPayload);

    // Find siblings in the NEW parent and update their order_index
    const newParent = parentId ? findItemDeep(newTree, parentId) : null;
    const newSiblings = parentId ? newParent?.children || [] : newTree;

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
      console.error("Failed to reorder tree:", error);
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
      | "role",
    parentType:
      | "company"
      | "business_unit"
      | "region"
      | "site"
      | "asset_group"
      | "work_group"
      | "role"
      | undefined,
    childItem: CompanyTreeItem,
    parentItem: CompanyTreeItem | null | undefined
  ): boolean {
    if (childType === "company") return false; // Company cannot be moved
    if (childType === "business_unit") return parentType === "company";
    if (childType === "region") return parentType === "business_unit";
    if (childType === "site") return parentType === "region";
    if (childType === "asset_group") return parentType === "site";
    if (childType === "work_group") return parentType === "asset_group";

    // Roles can be children of work_groups (top-level roles) or other roles (reporting roles)
    // But only one level of role nesting is allowed
    if (childType === "role") {
      if (parentType === "work_group") return true;

      if (parentType === "role") {
        // Check if the child role has children (it's a parent role itself)
        // If so, it cannot become a reporting role under another role
        if (childItem.children.length > 0) {
          return false; // Can't nest a role that has reporting roles under another role
        }

        // Check if the target parent role is already a reporting role (has a reports_to_role_id)
        // If so, we can't add another level of nesting
        const parentEntity = parentItem?.entity;
        if (
          parentEntity &&
          "reports_to_role_id" in parentEntity &&
          parentEntity.reports_to_role_id
        ) {
          return false; // Can't nest under a role that is already a reporting role
        }

        return true;
      }
    }
    return false;
  }

  // Helper to find the parent work group for a given target parent ID
  function findParentWorkGroup(
    targetParentId: UniqueIdentifier | null
  ): CompanyTreeItem | null {
    if (!targetParentId) return null;

    const parent = findItemDeep(items, targetParentId) as
      | CompanyTreeItem
      | undefined;
    if (!parent) return null;

    // If dropping directly under a work_group, return it
    if (parent.entityType === "work_group") return parent;

    // If dropping under a role, find its parent work_group
    if (parent.entityType === "role") {
      const findWorkGroupContaining = (
        nodes: TreeItems,
        roleId: UniqueIdentifier
      ): CompanyTreeItem | null => {
        for (const node of nodes) {
          const item = node as CompanyTreeItem;
          if (item.entityType === "work_group") {
            const containsRole = item.children.some(
              (child) =>
                child.id === roleId ||
                child.children?.some((grandchild) => grandchild.id === roleId)
            );
            if (containsRole) return item;
          }
          const found = findWorkGroupContaining(item.children, roleId);
          if (found) return found;
        }
        return null;
      };
      return findWorkGroupContaining(items, parent.id);
    }

    return null;
  }

  // Helper to check for duplicate shared_role_id in a work group
  function findDuplicateRoleInWorkGroup(
    workGroup: CompanyTreeItem,
    sharedRoleId: number,
    excludeRoleId: UniqueIdentifier
  ): CompanyTreeItem | null {
    for (const child of workGroup.children) {
      const childItem = child as CompanyTreeItem;
      if (childItem.entityType !== "role") continue;
      if (childItem.id === excludeRoleId) continue;

      if ((childItem.entity as RoleNode).shared_role_id === sharedRoleId) {
        return childItem;
      }

      // Check reporting roles (children of this role)
      for (const grandchild of childItem.children) {
        const grandchildItem = grandchild as CompanyTreeItem;
        if (grandchildItem.id === excludeRoleId) continue;
        if (
          (grandchildItem.entity as RoleNode).shared_role_id === sharedRoleId
        ) {
          return grandchildItem;
        }
      }
    }
    return null;
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

    // Get the valid parent types for the dragged item
    // Roles can be children of work_groups OR other roles
    const validParentTypes: Record<string, string[]> = {
      business_unit: ["company"],
      region: ["business_unit"],
      site: ["region"],
      asset_group: ["site"],
      work_group: ["asset_group"],
      role: ["work_group", "role"], // Roles can be under work_groups or other roles
    };

    const expectedParentTypes = validParentTypes[draggedItem.entityType] || [];

    // For roles, check if dropping would create a duplicate in the target work group
    if (draggedItem.entityType === "role") {
      // Determine the target work group based on where we're trying to drop
      let targetWorkGroup: CompanyTreeItem | null = null;

      if (targetItem.entityType === "work_group") {
        targetWorkGroup = targetItem;
      } else if (targetItem.entityType === "role") {
        // Find the work group containing this role
        targetWorkGroup = findParentWorkGroup(targetItem.id);
      }

      if (targetWorkGroup) {
        const draggedSharedRoleId = (draggedItem.entity as RoleNode)
          .shared_role_id;
        const duplicate = findDuplicateRoleInWorkGroup(
          targetWorkGroup,
          draggedSharedRoleId,
          draggedItem.id
        );

        if (duplicate) {
          return false; // Invalid - would create duplicate
        }
      }
    }

    // Highlight items of valid parent types
    if (expectedParentTypes.includes(targetItem.entityType)) {
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
