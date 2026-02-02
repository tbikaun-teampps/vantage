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
  QuestionnaireSections,
  ReorderQuestionnaireBodyData,
} from "@/types/api/questionnaire";
import type { TreeItems } from "./types";
import { SortableItem } from "./SortableItem";
import {
  sectionsToTreeItems,
  parseTreeItemId,
  type QuestionnaireTreeItem,
  type QuestionnaireEntityType,
} from "./adapters";
import {
  flattenTree,
  findItemDeep,
  getProjection,
  removeItem,
} from "./utilities";
import { useReorderQuestionnaireTree } from "@/hooks/questionnaire/useQuestions";

const INDENTATION_WIDTH = 24; // pixels per depth level

interface SortableTreeProps {
  questionnaireId: number;
  sections: QuestionnaireSections;
  expandedItems?: Set<UniqueIdentifier>;
  onToggleCollapsed?: (id: UniqueIdentifier) => void;
  onSelectItem?: (
    item: { type: "section" | "step" | "question"; id: number } | null
  ) => void;
  selectedItem?: { type: "section" | "step" | "question"; id: number } | null;
  showAddPlaceholders?: boolean; // Show "Add" placeholder items (for admin users)
  onAddItem?: (type: "section" | "step" | "question", parentId?: number) => void;
  showActions?: boolean; // Show edit/delete actions menu (for admin users)
  onEditItem?: (type: "section" | "step", id: number) => void;
  onDeleteItem?: (type: "section" | "step" | "question", id: number, title: string) => void;
}

export function SortableTree({
  questionnaireId,
  sections,
  expandedItems = new Set(),
  onToggleCollapsed,
  onSelectItem,
  selectedItem,
  showAddPlaceholders = false,
  onAddItem,
  showActions = false,
  onEditItem,
  onDeleteItem,
}: SortableTreeProps) {
  // Transform sections to TreeItems format (sections are top-level, no root wrapper)
  const initialItems = useMemo(() => sectionsToTreeItems(sections), [sections]);

  const [items, setItems] = useState<TreeItems>(initialItems);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [offsetLeft, setOffsetLeft] = useState(0);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);

  // Sync local state when sections change (e.g., after add/delete)
  useEffect(() => {
    setItems(sectionsToTreeItems(sections));
  }, [sections]);

  // Use the reorder tree mutation hook
  const { reorderTree } = useReorderQuestionnaireTree(questionnaireId);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Flatten tree for display, showing only items whose ancestors are all expanded
  // Also injects "Add" placeholder items when showAddPlaceholders is true
  // Computes hierarchical number labels (1., 1.1., 1.1.1.)
  const flattenedItems = useMemo(() => {
    const flattened = flattenTree(items);

    // Helper to check if all ancestors of an item are expanded
    const areAncestorsExpanded = (item: (typeof flattened)[0]): boolean => {
      if (!item.parentId) return true; // Root level has no parent

      // Find parent in flattened list
      const parent = flattened.find((i) => i.id === item.parentId);
      if (!parent) return true; // Shouldn't happen, but safe fallback

      // Parent must be expanded
      if (!expandedItems.has(parent.id)) return false;

      // Recursively check parent's ancestors
      return areAncestorsExpanded(parent);
    };

    // Only show items whose all ancestors are expanded
    const visibleItems = flattened.filter((item) => areAncestorsExpanded(item));

    // Compute hierarchical number labels for each item
    // Track counts at each level of the hierarchy
    let sectionCount = 0;
    const stepCountBySection = new Map<string, number>(); // sectionId -> step count
    const questionCountByStep = new Map<string, number>(); // stepId -> question count

    for (const item of visibleItems) {
      const treeItem = item as unknown as QuestionnaireTreeItem;
      if (treeItem.isPlaceholder) continue;

      if (treeItem.entityType === "section") {
        sectionCount++;
        treeItem.numberLabel = `${sectionCount}.`;
      } else if (treeItem.entityType === "step") {
        const sectionId = String(item.parentId);
        const stepCount = (stepCountBySection.get(sectionId) || 0) + 1;
        stepCountBySection.set(sectionId, stepCount);

        // Find parent section's number
        const parentSection = visibleItems.find(v => v.id === item.parentId) as unknown as QuestionnaireTreeItem;
        const sectionNum = parentSection?.numberLabel?.replace(".", "") || "?";
        treeItem.numberLabel = `${sectionNum}.${stepCount}.`;
      } else if (treeItem.entityType === "question") {
        const stepId = String(item.parentId);
        const questionCount = (questionCountByStep.get(stepId) || 0) + 1;
        questionCountByStep.set(stepId, questionCount);

        // Find parent step's number
        const parentStep = visibleItems.find(v => v.id === item.parentId) as unknown as QuestionnaireTreeItem;
        const stepNum = parentStep?.numberLabel?.replace(/\.$/, "") || "?";
        treeItem.numberLabel = `${stepNum}.${questionCount}.`;
      }
    }

    // If not showing placeholders, return just visible items
    if (!showAddPlaceholders) {
      return visibleItems;
    }

    // Two-pass approach:
    // Pass 1: Add "Add Question" placeholders after questions/empty steps
    // Pass 2: Add "Add Step" placeholders after the last step (and its children) in each section

    // Pass 1: Add question placeholders
    const withQuestionPlaceholders: typeof visibleItems = [];

    for (let i = 0; i < visibleItems.length; i++) {
      const item = visibleItems[i];
      const treeItem = item as unknown as QuestionnaireTreeItem;
      const nextItem = visibleItems[i + 1] as unknown as QuestionnaireTreeItem | undefined;

      withQuestionPlaceholders.push(item);

      // Add "Add Question" after the last question in a step
      if (treeItem.entityType === "question") {
        const isLastQuestionInStep =
          !nextItem ||
          nextItem.entityType !== "question" ||
          visibleItems[i + 1].parentId !== item.parentId;

        if (isLastQuestionInStep) {
          const parentStepId = item.parentId;
          const parentStep = findItemDeep(items, parentStepId!) as QuestionnaireTreeItem | undefined;
          if (parentStep?.entity) {
            withQuestionPlaceholders.push({
              id: `add-question_${parentStep.entity.id}`,
              depth: item.depth,
              parentId: parentStepId,
              name: "Add Question",
              entityType: "question",
              isPlaceholder: true,
              placeholderParentId: parentStep.entity.id,
              children: [],
              collapsed: false,
            } as unknown as (typeof visibleItems)[0]);
          }
        }
      }

      // Add "Add Question" for empty steps (no questions)
      if (treeItem.entityType === "step" && treeItem.entity) {
        const hasQuestions = treeItem.children && treeItem.children.length > 0;
        const nextIsChildQuestion = nextItem?.entityType === "question" && visibleItems[i + 1]?.parentId === item.id;

        if (!hasQuestions || (!nextIsChildQuestion && expandedItems.has(item.id))) {
          // Only add if we don't already have questions showing
          if (!nextIsChildQuestion) {
            withQuestionPlaceholders.push({
              id: `add-question_${treeItem.entity.id}`,
              depth: item.depth + 1,
              parentId: item.id,
              name: "Add Question",
              entityType: "question",
              isPlaceholder: true,
              placeholderParentId: treeItem.entity.id,
              children: [],
              collapsed: false,
            } as unknown as (typeof visibleItems)[0]);
          }
        }
      }

      // Add "Add Step" for empty sections (no steps)
      if (treeItem.entityType === "section" && treeItem.entity) {
        const hasSteps = treeItem.children && treeItem.children.length > 0;
        if (!hasSteps) {
          withQuestionPlaceholders.push({
            id: `add-step_${treeItem.entity.id}`,
            depth: item.depth + 1,
            parentId: item.id,
            name: "Add Step",
            entityType: "step",
            isPlaceholder: true,
            placeholderParentId: treeItem.entity.id,
            children: [],
            collapsed: false,
          } as unknown as (typeof visibleItems)[0]);
        }
      }
    }

    // Pass 2: Add "Add Step" placeholders after all children of the last step in each section
    // The key insight: "Add Step" should appear after ALL descendants of the last step,
    // and its parentId should be the SECTION (not the step), so it's visible even when steps are collapsed
    const result: typeof withQuestionPlaceholders = [];
    const addedStepPlaceholders = new Set<string>();

    for (let i = 0; i < withQuestionPlaceholders.length; i++) {
      const item = withQuestionPlaceholders[i];
      const treeItem = item as unknown as QuestionnaireTreeItem;

      result.push(item);

      // After processing each item, check if we need to add "Add Step" for any section
      // We add "Add Step" when the next item is either:
      // 1. A section (we've finished processing all steps of the current section)
      // 2. End of list
      // 3. A step from a different section

      const nextItem = withQuestionPlaceholders[i + 1] as unknown as QuestionnaireTreeItem | undefined;

      // Determine if current item is the last descendant of a section before moving to next section
      let shouldAddStepPlaceholder = false;
      let targetSectionId: UniqueIdentifier | null = null;
      let targetSection: QuestionnaireTreeItem | undefined;
      let stepDepth = 1;

      if (treeItem.entityType === "section") {
        // If this section has steps, we'll add the placeholder after processing them
        // Skip for now
      } else if (treeItem.entityType === "step" && !treeItem.isPlaceholder) {
        // Find parent section
        const parentSectionId = item.parentId;
        const parentSection = items.find((s) => s.id === parentSectionId) as QuestionnaireTreeItem | undefined;
        stepDepth = item.depth;

        if (parentSection?.entity) {
          // Check if this is the last step in the section by looking at next non-question item
          let isLastStep = false;

          if (!nextItem) {
            isLastStep = true;
          } else if (nextItem.entityType === "section") {
            isLastStep = true;
          } else if (nextItem.entityType === "step" && !nextItem.isPlaceholder) {
            // Check if next step is in same section
            isLastStep = withQuestionPlaceholders[i + 1].parentId !== parentSectionId;
          }
          // If next is a question, skip for now - check after questions are processed

          if (isLastStep) {
            shouldAddStepPlaceholder = true;
            targetSectionId = parentSectionId;
            targetSection = parentSection;
          }
        }
      } else if (treeItem.entityType === "question") {
        // Check if this question's parent step is the last step in its section
        // and if there are no more questions/placeholders after this
        const parentStepId = item.parentId;
        const parentStepInVisible = visibleItems.find(v => v.id === parentStepId);
        const parentSectionId = parentStepInVisible?.parentId;

        if (parentSectionId) {
          const parentSection = items.find((s) => s.id === parentSectionId) as QuestionnaireTreeItem | undefined;
          const parentStep = visibleItems.find(v => v.id === parentStepId);
          stepDepth = parentStep?.depth ?? 1;

          // Check what comes next
          if (!nextItem) {
            // End of list - add step placeholder
            shouldAddStepPlaceholder = true;
            targetSectionId = parentSectionId;
            targetSection = parentSection;
          } else if (nextItem.entityType === "section") {
            shouldAddStepPlaceholder = true;
            targetSectionId = parentSectionId;
            targetSection = parentSection;
          } else if (nextItem.entityType === "step" && !nextItem.isPlaceholder) {
            // Next is a step - check if it's in same section
            if (withQuestionPlaceholders[i + 1].parentId !== parentSectionId) {
              shouldAddStepPlaceholder = true;
              targetSectionId = parentSectionId;
              targetSection = parentSection;
            }
          }
          // If next is another question or question placeholder, don't add yet
        }
      }

      if (shouldAddStepPlaceholder && targetSection?.entity && targetSectionId) {
        const placeholderId = `add-step_${targetSection.entity.id}`;
        if (!addedStepPlaceholders.has(placeholderId)) {
          addedStepPlaceholders.add(placeholderId);
          result.push({
            id: placeholderId,
            depth: stepDepth,
            parentId: targetSectionId, // Parent is section, not step
            name: "Add Step",
            entityType: "step",
            isPlaceholder: true,
            placeholderParentId: targetSection.entity.id,
            children: [],
            collapsed: false,
          } as unknown as (typeof result)[0]);
        }
      }
    }

    // Add "Add Section" placeholder at the end
    result.push({
      id: "add-section",
      depth: 0,
      parentId: null,
      name: "Add Section",
      entityType: "section",
      isPlaceholder: true,
      children: [],
      collapsed: false,
    } as unknown as (typeof result)[0]);

    return result;
  }, [items, expandedItems, showAddPlaceholders]);

  // Get sorted IDs for SortableContext - exclude placeholder items from drag operations
  const sortedIds = useMemo(
    () =>
      flattenedItems
        .filter((item) => !(item as unknown as QuestionnaireTreeItem).isPlaceholder)
        .map((item) => item.id),
    [flattenedItems]
  );

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id);

    // Collapse the dragged item's children during drag for better visual feedback
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

    // Find the active item in the FULL tree to preserve its children
    const activeItem = findItemDeep(items, active.id) as
      | QuestionnaireTreeItem
      | undefined;

    if (!activeItem) {
      return;
    }

    // Enforce depth constraints based on entity type
    // Questionnaire has 3 levels: sections (0), steps (1), questions (2)
    const maxAllowedDepth: Record<QuestionnaireEntityType, number> = {
      section: 0, // Sections are top-level
      step: 1, // Steps are children of sections
      question: 2, // Questions are children of steps
    };

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
    const maxDepth = maxAllowedDepth[activeItem.entityType];

    if (depth > maxDepth) {
      depth = maxDepth;
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
      ? (findItemDeep(items, parentId) as QuestionnaireTreeItem | undefined)
      : null;

    const validParent = validateParentChild(
      activeItem.entityType,
      parentItem?.entityType
    );

    if (!validParent) {
      return;
    }

    // Step 1: Remove the item from its current location
    const itemsWithoutActive = removeItem(items, active.id);

    // Step 2: Create a deep clone of the active item with all its children preserved
    const clonedActiveItem = JSON.parse(
      JSON.stringify(activeItem)
    ) as QuestionnaireTreeItem;

    // Step 3: Recursively update the depth of the moved item and all its descendants
    function updateDepthRecursively(
      item: QuestionnaireTreeItem,
      newDepth: number
    ): QuestionnaireTreeItem {
      return {
        ...item,
        depth: newDepth,
        children: item.children.map((child) =>
          updateDepthRecursively(child as QuestionnaireTreeItem, newDepth + 1)
        ),
      };
    }

    const updatedActiveItem = updateDepthRecursively(clonedActiveItem, depth);

    // Step 4: Insert the item into the new parent
    function insertItemIntoTree(
      tree: TreeItems,
      newParentId: UniqueIdentifier | null,
      itemToInsert: QuestionnaireTreeItem,
      targetId: UniqueIdentifier,
      insertAfter: boolean
    ): TreeItems {
      // If inserting at root level (sections)
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
    const reorderPayload: ReorderQuestionnaireBodyData = [];

    // Get old parent ID from the flattened items
    const flattenedActiveItem = flattenedItems.find(
      (item) => item.id === activeItem.id
    );
    const oldParentId = flattenedActiveItem?.parentId;
    const parentChanged = oldParentId !== parentId;

    // Parse the entity ID from the tree item ID
    const { entityId: movedEntityId, entityType: movedEntityType } =
      parseTreeItemId(activeItem.id);

    // Add the moved item
    const movedItemPayload: ReorderQuestionnaireBodyData[number] = {
      id: movedEntityId,
      type: movedEntityType,
      order_index: 0, // Will be updated below
    };

    // Include parent_id if parent changed
    if (parentChanged && parentId) {
      const { entityId: newParentEntityId } = parseTreeItemId(parentId);
      movedItemPayload.parent_id = newParentEntityId;
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

      const { entityId, entityType } = parseTreeItemId(sibling.id);
      reorderPayload.push({
        id: entityId,
        type: entityType,
        order_index: index,
      });
    });

    // If parent changed, also update siblings in the OLD parent
    if (parentChanged && oldParentId) {
      const oldParent = findItemDeep(newTree, oldParentId);
      const oldSiblings = oldParent?.children || [];

      oldSiblings.forEach((sibling, index) => {
        const { entityId, entityType } = parseTreeItemId(sibling.id);
        reorderPayload.push({
          id: entityId,
          type: entityType,
          order_index: index,
        });
      });
    }

    // Call the reorder API
    reorderTree(reorderPayload).catch((error) => {
      console.error("Failed to reorder questionnaire tree:", error);
    });
  }

  // Helper function to validate parent-child relationships
  function validateParentChild(
    childType: QuestionnaireEntityType,
    parentType: QuestionnaireEntityType | undefined
  ): boolean {
    // Sections are top-level (no parent)
    if (childType === "section") return parentType === undefined;
    // Steps must be children of sections
    if (childType === "step") return parentType === "section";
    // Questions must be children of steps
    if (childType === "question") return parentType === "step";
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
    const { entityType, entityId } = parseTreeItemId(id);
    onSelectItem?.({ type: entityType, id: entityId });
  }

  function handleAddPlaceholderClick(item: QuestionnaireTreeItem) {
    if (!item.isPlaceholder || !onAddItem) return;
    onAddItem(item.entityType, item.placeholderParentId);
  }

  // Check if an item is selected by comparing tree item IDs
  const getIsSelected = (id: UniqueIdentifier): boolean => {
    if (!selectedItem) return false;
    const selectedTreeItemId = `${selectedItem.type}_${selectedItem.id}`;
    return String(id) === selectedTreeItemId;
  };

  // Determine if an item is a valid drop target during drag
  const getIsValidDropTarget = (itemId: UniqueIdentifier): boolean => {
    if (!activeId || !overId) return false;

    const draggedItem = findItemDeep(items, activeId) as
      | QuestionnaireTreeItem
      | undefined;
    const targetItem = findItemDeep(items, itemId) as
      | QuestionnaireTreeItem
      | undefined;

    if (!draggedItem || !targetItem) return false;

    // Can't drop on itself
    if (draggedItem.id === targetItem.id) return false;

    // Get the valid parent types for the dragged item
    const validParentTypes: Record<QuestionnaireEntityType, (QuestionnaireEntityType | null)[]> = {
      section: [null], // Sections are top-level (can only be reordered among sections)
      step: ["section"], // Steps must be under sections
      question: ["step"], // Questions must be under steps
    };

    const expectedParentTypes = validParentTypes[draggedItem.entityType] || [];

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
        | QuestionnaireTreeItem
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
              item={item as unknown as QuestionnaireTreeItem}
              depth={item.depth}
              indentationWidth={INDENTATION_WIDTH}
              collapsed={!expandedItems.has(item.id)}
              onToggleCollapsed={handleToggleCollapsed}
              onSelectItem={handleSelectItem}
              isSelected={getIsSelected(item.id)}
              isValidDropTarget={getIsValidDropTarget(item.id)}
              isDragging={activeId !== null}
              onAddClick={handleAddPlaceholderClick}
              showActions={showActions}
              onEditItem={onEditItem}
              onDeleteItem={onDeleteItem}
            />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeItem && (
          <div className="bg-white shadow-lg rounded p-2">{activeItem.name}</div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
