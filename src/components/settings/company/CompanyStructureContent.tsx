import { useState, useEffect, useRef, useMemo } from "react";
import { useCompanyTree } from "@/hooks/useCompany";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";
import { DashboardPage } from "@/components/dashboard";
import {
  CompanySettingsTree,
  HeaderActions,
  DetailPanel,
} from "@/components/settings/company";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import type { TreeNodeType, Company } from "@/types/company";

// Helper function to find a node in the tree by ID and type
function findNodeInTree(
  tree: Company | null,
  nodeId: string,
  nodeType: TreeNodeType
): any {
  if (!tree) return null;

  // If we're looking for the company itself
  if (nodeType === "company" && tree.id === nodeId) {
    return { ...tree, type: "company" };
  }

  // Helper to search through an array of nodes
  const searchArray = (
    items: any[] | undefined,
    childrenKey?: string
  ): any => {
    if (!items) return null;

    for (const item of items) {
      if (item.id === nodeId) {
        return item;
      }
      // Recursively search children if they exist
      if (childrenKey && item[childrenKey]) {
        const found = searchArray(item[childrenKey]);
        if (found) return found;
      }
    }
    return null;
  };

  // Search through the tree hierarchy based on node type
  switch (nodeType) {
    case "business_unit":
      return searchArray(tree.business_units);

    case "region":
      for (const bu of tree.business_units || []) {
        const found = searchArray(bu.regions);
        if (found) return found;
      }
      return null;

    case "site":
      for (const bu of tree.business_units || []) {
        for (const region of bu.regions || []) {
          const found = searchArray(region.sites);
          if (found) return found;
        }
      }
      return null;

    case "asset_group":
      for (const bu of tree.business_units || []) {
        for (const region of bu.regions || []) {
          for (const site of region.sites || []) {
            const found = searchArray(site.asset_groups);
            if (found) return found;
          }
        }
      }
      return null;

    case "work_group":
      for (const bu of tree.business_units || []) {
        for (const region of bu.regions || []) {
          for (const site of region.sites || []) {
            for (const ag of site.asset_groups || []) {
              const found = searchArray(ag.work_groups);
              if (found) return found;
            }
          }
        }
      }
      return null;

    case "role":
      for (const bu of tree.business_units || []) {
        for (const region of bu.regions || []) {
          for (const site of region.sites || []) {
            for (const ag of site.asset_groups || []) {
              for (const wg of ag.work_groups || []) {
                // Recursively search through roles and their reporting_roles (direct reports)
                const found = searchArray(wg.roles, "reporting_roles");
                if (found) return found;
              }
            }
          }
        }
      }
      return null;

    default:
      return null;
  }
}

export function CompanyStructureContent() {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const pageRef = useRef<HTMLDivElement>(null);
  const companyId = useCompanyFromUrl();
  const { data: tree } = useCompanyTree(companyId);

  // Store only the ID and type, derive the full item from tree
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<TreeNodeType | null>(null);

  // Derive selectedItem from tree data - this automatically updates when tree changes
  const selectedItem = useMemo(() => {
    if (!selectedItemId || !selectedItemType || !tree) return null;
    return findNodeInTree(tree, selectedItemId, selectedItemType);
  }, [tree, selectedItemId, selectedItemType]);

  const toggleExpanded = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  // Add bulk toggle function for double-click expand/collapse all descendants
  const handleBulkToggleExpanded = (
    nodeIds: string[],
    shouldExpand: boolean
  ) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (shouldExpand) {
        // Add all node IDs to expand them
        nodeIds.forEach((id) => newSet.add(id));
      } else {
        // Remove all node IDs to collapse them
        nodeIds.forEach((id) => newSet.delete(id));
      }
      return newSet;
    });
  };

  const handleSelectItem = (item: any) => {
    if (item) {
      setSelectedItemId(item.id);
      setSelectedItemType(item.type);
    } else {
      setSelectedItemId(null);
      setSelectedItemType(null);
    }
  };

  const handleClearSelection = () => {
    setSelectedItemId(null);
    setSelectedItemType(null);
  };

  // Fullscreen functionality
  const toggleFullscreen = async () => {
    try {
      if (!pageRef.current) return;

      if (!document.fullscreenElement) {
        await pageRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Error toggling fullscreen:", error);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return (
    <DashboardPage
      ref={pageRef}
      title="Company Structure"
      description="Set up company structures for assessments, reporting and analytics"
      tourId="company-settings-main"
      className={isFullscreen ? "bg-background" : ""}
      headerActions={
        <HeaderActions
          toggleFullscreen={toggleFullscreen}
          isFullscreen={isFullscreen}
        />
      }
    >
      <div className="flex flex-col h-full mx-auto">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={50} minSize={40} maxSize={70}>
            {tree ? (
              <CompanySettingsTree
                tree={tree}
                expandedNodes={expandedNodes}
                toggleExpanded={toggleExpanded}
                handleBulkToggleExpanded={handleBulkToggleExpanded}
                onSelectItem={handleSelectItem}
                selectedItem={selectedItem}
              />
            ) : (
              <div className="border-r flex flex-col h-full items-center justify-center">
                <div className="text-gray-500">Loading company tree...</div>
              </div>
            )}
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>
            <DetailPanel
              selectedItem={selectedItem}
              setSelectedItem={handleClearSelection}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </DashboardPage>
  );
}
