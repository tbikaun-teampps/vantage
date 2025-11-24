import { useState, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  IconBuilding,
  IconMapPin,
  IconWorld,
  IconBuildingFactory2,
  IconCube,
  IconUsersGroup,
  IconUser,
  IconChevronRight,
  IconChevronDown,
  IconSearch,
} from "@tabler/icons-react";
import { useCompanyTree } from "@/hooks/useCompany";
import { cn } from "@/lib/utils";
import type {
  BusinessUnitNode,
  CompanyTreeNodeType,
  CompanyTree,
  RegionNode,
  SiteNode,
  AssetGroupNode,
  WorkGroupNode,
  RoleNode,
  ReportingRoleNode,
} from "@/types/api/companies";

type BaseTreeNode =
  | CompanyTree
  | BusinessUnitNode
  | RegionNode
  | SiteNode
  | AssetGroupNode
  | WorkGroupNode
  | RoleNode
  | ReportingRoleNode;

// Flattened node structure for easier searching and display
export interface FlatNode {
  id: string;
  name: string;
  type: CompanyTreeNodeType;
  level: number;
  path: string;
  parentId?: string;
  hasChildren: boolean;
}

// Simple tree node component
interface SimpleTreeNodeProps {
  node: FlatNode;
  isExpanded: boolean;
  onToggleExpanded: (nodeId: string) => void;
  isVisible: boolean;
  isSelected: boolean;
  onNodeClick: (
    nodeId: string,
    nodeType: CompanyTreeNodeType,
    name: string
  ) => void;
  enableCollapse: boolean;
  renderNodeMarkers?: (node: FlatNode) => React.ReactNode;
}

function SimpleTreeNode({
  node,
  isExpanded,
  onToggleExpanded,
  isVisible,
  isSelected,
  onNodeClick,
  enableCollapse,
  renderNodeMarkers,
}: SimpleTreeNodeProps) {
  if (!isVisible) return null;

  const getTypeIcon = (type: CompanyTreeNodeType) => {
    const iconMap = {
      company: <IconBuilding className="h-4 w-4 text-blue-600" />,
      business_unit: <IconWorld className="h-4 w-4 text-emerald-600" />,
      region: <IconMapPin className="h-4 w-4 text-orange-600" />,
      site: <IconBuildingFactory2 className="h-4 w-4 text-purple-600" />,
      asset_group: <IconCube className="h-4 w-4 text-amber-600" />,
      work_group: <IconUsersGroup className="h-4 w-4 text-teal-600" />,
      role: <IconUser className="h-4 w-4 text-indigo-600" />,
    };
    return iconMap[type];
  };

  const handleNodeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNodeClick(node.id, node.type, node.name);
  };

  const handleExpandToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpanded(node.id);
  };

  return (
    <div
      className={cn(
        "flex items-center py-1 px-2 hover:bg-muted/50 rounded-sm cursor-pointer",
        isSelected && "bg-primary/10"
      )}
      onClick={handleNodeClick}
    >
      <div
        style={{ paddingLeft: `${node.level * 20}px` }}
        className="flex items-center gap-2 flex-1"
      >
        {/* Expand/Collapse Button */}
        {enableCollapse && node.hasChildren ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 flex-shrink-0"
            onClick={handleExpandToggle}
          >
            {isExpanded ? (
              <IconChevronDown className="h-3 w-3" />
            ) : (
              <IconChevronRight className="h-3 w-3" />
            )}
          </Button>
        ) : enableCollapse ? (
          <div className="h-6 w-6 flex-shrink-0" />
        ) : null}

        {/* Node Icon and Label */}
        <div className="flex items-center gap-2 flex-1">
          {getTypeIcon(node.type)}
          <span className="text-sm font-medium">{node.name}</span>
          <span className="text-xs text-muted-foreground capitalize ml-2">
            ({node.type.replace("_", " ")})
          </span>
          {renderNodeMarkers && (
            <div className="flex items-center gap-1 ml-2">
              {renderNodeMarkers(node)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface LocationTreeSelectProps {
  companyId: string;
  value?: { id: string; type: CompanyTreeNodeType; name: string } | null;
  onChange: (
    selection: { id: string; type: CompanyTreeNodeType; name: string } | null
  ) => void;
  disabled?: boolean;
  maxHeight?: string;
  enableCollapse?: boolean;
  renderNodeMarkers?: (node: FlatNode) => React.ReactNode;
}

export function LocationTreeSelect({
  companyId,
  value,
  onChange,
  disabled = false,
  maxHeight = "500px",
  enableCollapse = true,
  renderNodeMarkers,
}: LocationTreeSelectProps) {
  const { data: tree, isLoading } = useCompanyTree(companyId);

  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  // Flatten the tree structure for easier manipulation
  const flatNodes = useMemo(() => {
    if (!tree) return [];

    const nodes: FlatNode[] = [];

    const flattenNode = (
      item: BaseTreeNode,
      type: CompanyTreeNodeType,
      level: number,
      path: string,
      parentId?: string
    ) => {
      const nodeId = item.id.toString(); //`${type}-${item.id}`;
      const itemName: string =
        (item as { name?: string }).name ?? `${type} ${item.id}`;
      const nodePath = path ? `${path} > ${itemName}` : itemName;

      // Check if node has children based on type
      let hasChildren = false;
      if (type === "company" && "business_units" in item) {
        hasChildren = (item.business_units?.length || 0) > 0;
      } else if (type === "business_unit" && "regions" in item) {
        hasChildren = (item.regions?.length || 0) > 0;
      } else if (type === "region" && "sites" in item) {
        hasChildren = (item.sites?.length || 0) > 0;
      } else if (type === "site" && "asset_groups" in item) {
        hasChildren = (item.asset_groups?.length || 0) > 0;
      } else if (type === "asset_group" && "work_groups" in item) {
        hasChildren = (item.work_groups?.length || 0) > 0;
      } else if (type === "work_group" && "roles" in item) {
        hasChildren = (item.roles?.length || 0) > 0;
      } else if (type === "role" && "reporting_roles" in item) {
        hasChildren = (item.reporting_roles?.length || 0) > 0;
      }

      nodes.push({
        id: nodeId,
        name: itemName,
        type,
        level,
        path: nodePath,
        parentId,
        hasChildren,
      });

      // Recursively flatten children
      if (
        type === "company" &&
        "business_units" in item &&
        item.business_units
      ) {
        item.business_units.forEach((child: BusinessUnitNode) =>
          flattenNode(child, "business_unit", level + 1, nodePath, nodeId)
        );
      } else if (
        type === "business_unit" &&
        "regions" in item &&
        item.regions
      ) {
        item.regions.forEach((child: RegionNode) =>
          flattenNode(child, "region", level + 1, nodePath, nodeId)
        );
      } else if (type === "region" && "sites" in item && item.sites) {
        item.sites.forEach((child: SiteNode) =>
          flattenNode(child, "site", level + 1, nodePath, nodeId)
        );
      } else if (
        type === "site" &&
        "asset_groups" in item &&
        item.asset_groups
      ) {
        item.asset_groups.forEach((child: AssetGroupNode) =>
          flattenNode(child, "asset_group", level + 1, nodePath, nodeId)
        );
      } else if (
        type === "asset_group" &&
        "work_groups" in item &&
        item.work_groups
      ) {
        item.work_groups.forEach((child: WorkGroupNode) =>
          flattenNode(child, "work_group", level + 1, nodePath, nodeId)
        );
      } else if (type === "work_group" && "roles" in item && item.roles) {
        item.roles.forEach((child: RoleNode) =>
          flattenNode(child, "role", level + 1, nodePath, nodeId)
        );
      } else if (
        type === "role" &&
        "reporting_roles" in item &&
        item.reporting_roles
      ) {
        // Process direct reports (reporting_roles) - only one level deep
        item.reporting_roles.forEach((child: ReportingRoleNode) => {
          const childId = String(child.id);
          const childName: string =
            (child as { name?: string }).name ?? `role ${child.id}`;
          const childPath: string = nodePath
            ? `${nodePath} > ${childName}`
            : childName;

          // Add direct report node with hasChildren forced to false (one level only)
          nodes.push({
            id: childId,
            name: childName,
            type: "role",
            level: level + 1,
            path: childPath,
            parentId: nodeId,
            hasChildren: false, // Enforce one-level depth limit
          });
        });
      }
    };

    flattenNode(tree, "company", 0, "");
    return nodes;
  }, [tree]);

  // Filter nodes based on search query
  const filteredNodes = useMemo(() => {
    if (!searchQuery.trim()) {
      return flatNodes;
    }

    const query = searchQuery.toLowerCase();
    return flatNodes.filter(
      (node) =>
        node.name.toLowerCase().includes(query) ||
        node.path.toLowerCase().includes(query) ||
        node.type.toLowerCase().includes(query)
    );
  }, [flatNodes, searchQuery]);

  const handleNodeClick = (
    nodeId: string,
    nodeType: CompanyTreeNodeType,
    name: string
  ) => {
    if (disabled) return;
    if (value && value.id === nodeId && value.type === nodeType) {
      onChange(null); // Deselect if already selected
      return;
    }
    console.log("Node clicked:", { nodeId, nodeType, name });
    onChange({ id: nodeId, type: nodeType, name });
  };

  const toggleExpanded = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const isNodeVisible = (node: FlatNode): boolean => {
    if (node.level === 0) return true; // Company is always visible

    // If searching, all matching nodes are visible
    if (searchQuery.trim()) {
      return filteredNodes.includes(node);
    }

    // If collapse is disabled, all nodes are visible
    if (!enableCollapse) {
      return true;
    }

    // Check if all parent nodes are expanded
    let currentParentId = node.parentId;
    while (currentParentId) {
      if (!expandedNodes.has(currentParentId)) {
        return false;
      }
      const parent = flatNodes.find((n) => n.id === currentParentId);
      currentParentId = parent?.parentId;
    }

    return true;
  };

  const isNodeSelected = (node: FlatNode): boolean => {
    return value?.id === node.id && value?.type === node.type;
  };

  return (
    <div className="space-y-4">
      {/* Search Field */}
      <div className="relative">
        <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search company structure..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
          disabled={disabled}
        />
      </div>

      <div className="flex-1 min-h-0">
        <ScrollArea
          className="border rounded-md overflow-y-auto"
          style={{ maxHeight }}
        >
          <div className="p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">
                  Loading company structure...
                </div>
              </div>
            ) : flatNodes.length > 0 ? (
              <div className="space-y-0">
                {(searchQuery.trim() ? filteredNodes : flatNodes).map(
                  (node) => (
                    <SimpleTreeNode
                      key={`${node.type}-${node.id}`}
                      node={node}
                      isExpanded={expandedNodes.has(node.id)}
                      onToggleExpanded={toggleExpanded}
                      isVisible={isNodeVisible(node)}
                      isSelected={isNodeSelected(node)}
                      onNodeClick={handleNodeClick}
                      enableCollapse={enableCollapse}
                      renderNodeMarkers={renderNodeMarkers}
                    />
                  )
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">
                  No company structure found
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
