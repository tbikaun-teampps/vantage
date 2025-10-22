import { useState, useEffect, useRef } from "react";
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

export function CompanyStructureContent() {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const pageRef = useRef<HTMLDivElement>(null);
  const companyId = useCompanyFromUrl();
  const { data: tree } = useCompanyTree(companyId);
  const [selectedItem, setSelectedItem] = useState<any>(null);

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
      setSelectedItem(item);
    } else {
      setSelectedItem(null);
    }
  };

  const handleClearSelection = () => {
    setSelectedItem(null);
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
