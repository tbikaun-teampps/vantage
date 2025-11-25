import { useMemo } from "react";
import type { UniqueIdentifier } from "@dnd-kit/core";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { CompanyTree, AnyTreeNode } from "@/types/api/companies";
import { SortableTree } from "./sortable-tree";

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

  return (
    <div className="border-r flex flex-col h-full" data-tour="company-tree">
      <ScrollArea className="flex-1 h-full">
        <div className="p-6">
          <SortableTree
            companyTree={tree}
            expandedItems={expandedItems}
            onToggleCollapsed={handleToggleCollapsed}
            onSelectItem={onSelectItem}
            selectedItem={selectedItem}
          />
        </div>
      </ScrollArea>
    </div>
  );
}
