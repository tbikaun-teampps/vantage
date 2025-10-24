import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  IconUpload,
  IconFileSpreadsheet,
  IconAlertCircle,
  IconLoader2,
  IconCalculator,
  IconBuilding,
  IconMapPin,
  IconWorld,
  IconBuildingFactory2,
  IconCube,
  IconUsersGroup,
  IconChevronRight,
  IconChevronDown,
  IconSearch,
} from "@tabler/icons-react";
// import {
//   useProgramMetricsWithDefinitions,
//   useCreateCalculatedMetric,
// } from "@/hooks/useMetrics";
import { useProgramById } from "@/hooks/useProgram";
import { useCompanyTree } from "@/hooks/useCompany";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";
import { toast } from "sonner";
import showDisabledToast from "@/components/disabled-toast";
// import type {
//   ProgramMetric,
//   MetricDefinition,
// } from "@/lib/supabase/metrics-service";
import type {
  AnyTreeNode,
  TreeNodeType,
  BusinessUnitTreeNode,
  RegionTreeNode,
  SiteTreeNode,
  AssetGroupTreeNode,
  WorkGroupTreeNode,
} from "@/types/company";

type ProgramMetricWithDefinition = ProgramMetric & {
  metric_definition: MetricDefinition;
};

// Flattened node structure for easier searching and display
interface FlatNode {
  id: string;
  name: string;
  type: TreeNodeType;
  level: number;
  path: string;
  parentId?: string;
  hasChildren: boolean;
}

// Organizational context for metrics
interface OrganizationalContext {
  type: TreeNodeType;
  id: string;
  name: string;
  path: string;
}

// Simple tree node component props
interface SimpleTreeNodeProps {
  node: FlatNode;
  isExpanded: boolean;
  onToggleExpanded: (nodeId: string) => void;
  isVisible: boolean;
  isSelected: boolean;
  onNodeSelection: (node: FlatNode) => void;
}

interface MetricsDataUploadProps {
  programId: number;
  programPhaseId: number;
  disabled?: boolean;
  disabledReason?: string | null;
}

// Simple tree node component for organizational selection
function SimpleTreeNode({
  node,
  isExpanded,
  onToggleExpanded,
  isVisible,
  isSelected,
  onNodeSelection,
}: SimpleTreeNodeProps) {
  if (!isVisible) return null;

  const getTypeIcon = (type: TreeNodeType) => {
    const iconMap = {
      company: <IconBuilding className="h-4 w-4 text-blue-600" />,
      business_unit: <IconWorld className="h-4 w-4 text-emerald-600" />,
      region: <IconMapPin className="h-4 w-4 text-orange-600" />,
      site: <IconBuildingFactory2 className="h-4 w-4 text-purple-600" />,
      asset_group: <IconCube className="h-4 w-4 text-amber-600" />,
      work_group: <IconUsersGroup className="h-4 w-4 text-teal-600" />,
      role: <IconUsersGroup className="h-4 w-4 text-indigo-600" />,
    };
    return iconMap[type];
  };

  const handleNodeClick = () => {
    onNodeSelection(node);
  };

  const handleExpandToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpanded(node.id);
  };

  return (
    <div 
      className={`flex items-center py-2 px-2 hover:bg-muted/50 rounded-sm cursor-pointer ${
        isSelected ? 'bg-primary/10 border border-primary/20' : ''
      }`}
      onClick={handleNodeClick}
    >
      <div
        style={{ paddingLeft: `${node.level * 20}px` }}
        className="flex items-center gap-2 flex-1"
      >
        {/* Expand/Collapse Button */}
        {node.hasChildren ? (
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
        ) : (
          <div className="h-6 w-6 flex-shrink-0" />
        )}

        {/* Node Icon and Label */}
        <div className="flex items-center gap-2 flex-1">
          {getTypeIcon(node.type)}
          <span className="text-sm font-medium">{node.name}</span>
          <span className="text-xs text-muted-foreground capitalize ml-2">
            ({node.type.replace("_", " ")})
          </span>
        </div>
      </div>
    </div>
  );
}

export function MetricsDataUpload({
  programId,
  programPhaseId,
  disabled = false,
  disabledReason,
}: MetricsDataUploadProps) {
  const [selectedMetricId, setSelectedMetricId] = useState<string>("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [inputMode, setInputMode] = useState<"upload" | "manual">("upload");
  const [manualValue, setManualValue] = useState<string>("");
  
  // Tree state
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrganizationalContext, setSelectedOrganizationalContext] = useState<OrganizationalContext | null>(null);

  const { data: programMetrics, isLoading } =
    useProgramMetricsWithDefinitions(programId);
  const { data: program } = useProgramById(programId);
  const createCalculatedMetric = useCreateCalculatedMetric();
  
  // Company tree data
  const companyId = useCompanyFromUrl();
  const { data: tree, isLoading: isTreeLoading } = useCompanyTree(companyId);

  const selectedMetric = programMetrics?.find(
    (pm: ProgramMetricWithDefinition) =>
      pm.metric_id.toString() === selectedMetricId
  );

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = [".csv", ".xlsx", ".xls"];
      const fileExtension = file.name
        .toLowerCase()
        .slice(file.name.lastIndexOf("."));

      if (!validTypes.includes(fileExtension)) {
        toast.error("Please select a CSV or Excel file (.csv, .xlsx, .xls)");
        return;
      }

      setUploadFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedMetricId) {
      toast.error("Please select a metric first.");
      return;
    }

    if (inputMode === "upload") {
      showDisabledToast("File upload", "functionality");
      return;
    }

    if (inputMode === "manual") {
      const numValue = parseFloat(manualValue);
      if (!manualValue.trim() || isNaN(numValue)) {
        toast.error("Please enter a valid numeric value.");
        return;
      }
    }

    setIsUploading(true);

    try {
      if (inputMode === "manual") {
        const numValue = parseFloat(manualValue);

        if (!program?.company_id) {
          toast.error("Program company information is missing.");
          return;
        }

        if (!programPhaseId) {
          toast.error(
            "No program phase provided. Please select a valid phase."
          );
          return;
        }

        // Build organizational context data
        const organizationalContext: {
          metric_id: number;
          calculated_value: number;
          company_id: string;
          program_phase_id: number;
          data_source: string;
          business_unit_id?: number;
          region_id?: number;
          site_id?: number;
          asset_group_id?: number;
          work_group_id?: number;
        } = {
          metric_id: parseInt(selectedMetricId),
          calculated_value: numValue,
          company_id: program.company_id,
          program_phase_id: programPhaseId,
          data_source: "manual_input",
        };

        // Add organizational context if selected
        if (selectedOrganizationalContext) {
          const contextId = parseInt(selectedOrganizationalContext.id);
          switch (selectedOrganizationalContext.type) {
            case "business_unit":
              organizationalContext.business_unit_id = contextId;
              break;
            case "region":
              organizationalContext.region_id = contextId;
              break;
            case "site":
              organizationalContext.site_id = contextId;
              break;
            case "asset_group":
              organizationalContext.asset_group_id = contextId;
              break;
            case "work_group":
              organizationalContext.work_group_id = contextId;
              break;
            // Company level doesn't need additional ID since we already have company_id
          }
        }

        await createCalculatedMetric.mutateAsync(organizationalContext);

        // Reset form
        setSelectedMetricId("");
        setManualValue("");
        setSelectedOrganizationalContext(null);
      }
    } catch (error) {
      console.error("Failed to save calculated metric:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setUploadFile(null);
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  // Flatten the tree structure for easier manipulation
  const flatNodes = useMemo(() => {
    if (!tree) return [];

    const nodes: FlatNode[] = [];

    const flattenNode = (
      item: AnyTreeNode,
      type: TreeNodeType,
      level: number,
      path: string,
      parentId?: string
    ) => {
      const nodeId = String(item.id);
      const itemName = "name" in item ? item.name : `${type} ${item.id}`;
      const nodePath = path ? `${path} > ${itemName}` : itemName;

      // Check if node has children based on type (excluding roles since we don't need them for metrics)
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

      // Recursively flatten children (excluding roles for metrics)
      if (
        type === "company" &&
        "business_units" in item &&
        item.business_units
      ) {
        item.business_units.forEach((child: BusinessUnitTreeNode) =>
          flattenNode(child, "business_unit", level + 1, nodePath, nodeId)
        );
      } else if (
        type === "business_unit" &&
        "regions" in item &&
        item.regions
      ) {
        item.regions.forEach((child: RegionTreeNode) =>
          flattenNode(child, "region", level + 1, nodePath, nodeId)
        );
      } else if (type === "region" && "sites" in item && item.sites) {
        item.sites.forEach((child: SiteTreeNode) =>
          flattenNode(child, "site", level + 1, nodePath, nodeId)
        );
      } else if (
        type === "site" &&
        "asset_groups" in item &&
        item.asset_groups
      ) {
        item.asset_groups.forEach((child: AssetGroupTreeNode) =>
          flattenNode(child, "asset_group", level + 1, nodePath, nodeId)
        );
      } else if (
        type === "asset_group" &&
        "work_groups" in item &&
        item.work_groups
      ) {
        item.work_groups.forEach((child: WorkGroupTreeNode) =>
          flattenNode(child, "work_group", level + 1, nodePath, nodeId)
        );
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

  // Auto-expand company node when tree loads
  useEffect(() => {
    if (tree && expandedNodes.size === 0) {
      setExpandedNodes(new Set([String(tree.id)]));
    }
  }, [tree, expandedNodes.size]);

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

  const handleNodeSelection = (node: FlatNode) => {
    setSelectedOrganizationalContext({
      type: node.type,
      id: node.id,
      name: node.name,
      path: node.path,
    });
  };

  if (disabled) {
    return (
      <Card className="p-0 shadow-none border-0 m-0">
        <CardHeader className="p-0 m-0">
          <CardTitle>Metrics Data Upload</CardTitle>
          <CardDescription>
            Upload data to calculate metric values for this program
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 m-0">
          <div className="text-center py-8">
            <IconAlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold">
              Data upload not available
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {disabledReason}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <IconLoader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading program metrics...</span>
        </div>
      ) : !programMetrics || programMetrics.length === 0 ? (
        <div className="text-center py-8">
          <IconAlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-semibold">No metrics available</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Add metrics to this program before uploading data.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Metric Selection */}
          <div className="space-y-2">
            <Label htmlFor="metric-select">Select Metric</Label>
            <Select
              value={selectedMetricId}
              onValueChange={setSelectedMetricId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a metric to enter or upload data for..." />
              </SelectTrigger>
              <SelectContent>
                {programMetrics.map(
                  (programMetric: ProgramMetricWithDefinition) => (
                    <SelectItem
                      key={programMetric.id}
                      value={programMetric.metric_id.toString()}
                    >
                      <div className="flex items-center space-x-2">
                        <span>{programMetric.metric_definition.name}</span>
                        {programMetric.metric_definition.calculation_type && (
                          <Badge variant="outline" className="text-xs">
                            {programMetric.metric_definition.calculation_type}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Metric Details */}
          {selectedMetric && (
            <>
              <Separator />
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Selected Metric
                  </h4>
                  <div className="mt-1 flex items-center space-x-2">
                    <span className="font-medium">
                      {selectedMetric.metric_definition.name}
                    </span>
                    {selectedMetric.metric_definition.calculation_type && (
                      <Badge variant="secondary">
                        {selectedMetric.metric_definition.calculation_type}
                      </Badge>
                    )}
                  </div>
                  {selectedMetric.metric_definition.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedMetric.metric_definition.description}
                    </p>
                  )}
                </div>

                {/* Required Columns Info */}
                {selectedMetric.metric_definition.required_csv_columns && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Required Columns
                    </h4>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {Object.entries(
                        selectedMetric.metric_definition.required_csv_columns
                      ).map(([key, value]) => (
                        <Badge key={key} variant="outline" className="text-xs">
                          {key}: {String(value)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Organizational Context Selection */}
          {selectedMetricId && (
            <>
              <Separator />
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">
                    Organizational Context (Optional)
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Select the organizational level this data applies to. Leave empty for company-wide data.
                  </p>
                </div>

                {/* Selected Context Display */}
                {selectedOrganizationalContext && (
                  <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                    <IconBuilding className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {selectedOrganizationalContext.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedOrganizationalContext.path}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedOrganizationalContext(null)}
                    >
                      Clear
                    </Button>
                  </div>
                )}

                {/* Search Field */}
                <div className="relative">
                  <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search organizational structure..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Tree Selection */}
                <div className="border rounded-md">
                  <ScrollArea className="h-64">
                    <div className="p-2">
                      {isTreeLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <IconLoader2 className="h-4 w-4 animate-spin" />
                          <span className="ml-2 text-sm text-muted-foreground">
                            Loading organizational structure...
                          </span>
                        </div>
                      ) : flatNodes.length > 0 ? (
                        <div className="space-y-0">
                          {(searchQuery.trim() ? filteredNodes : flatNodes).map(
                            (node) => (
                              <SimpleTreeNode
                                key={node.id}
                                node={node}
                                isExpanded={expandedNodes.has(node.id)}
                                onToggleExpanded={toggleExpanded}
                                isVisible={isNodeVisible(node)}
                                isSelected={selectedOrganizationalContext?.id === node.id}
                                onNodeSelection={handleNodeSelection}
                              />
                            )
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center py-8">
                          <div className="text-sm text-muted-foreground">
                            No organizational structure found
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </>
          )}

          {/* Input Mode Selection */}
          {selectedMetricId && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label>Input Method</Label>
                  <RadioGroup
                    value={inputMode}
                    onValueChange={(value) =>
                      setInputMode(value as "upload" | "manual")
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="upload" id="upload-mode" />
                      <Label
                        htmlFor="upload-mode"
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <IconUpload className="h-4 w-4" />
                        <span>Upload Data File</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="manual" id="manual-mode" />
                      <Label
                        htmlFor="manual-mode"
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <IconCalculator className="h-4 w-4" />
                        <span>Enter Value Manually</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* File Upload Mode */}
                {inputMode === "upload" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="data-file">Upload Data File</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="data-file"
                          type="file"
                          accept=".csv,.xlsx,.xls"
                          onChange={handleFileSelect}
                          className="flex-1"
                        />
                        {uploadFile && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={clearFile}
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Supported formats: CSV, Excel (.xlsx, .xls)
                      </p>
                    </div>

                    {/* Selected File Info */}
                    {uploadFile && (
                      <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                        <IconFileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {uploadFile.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(uploadFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Manual Input Mode */}
                {inputMode === "manual" && (
                  <div className="space-y-2">
                    <Label htmlFor="manual-value">Calculated Value</Label>
                    <Input
                      id="manual-value"
                      type="number"
                      placeholder="Enter the calculated metric value..."
                      value={manualValue}
                      onChange={(e) => setManualValue(e.target.value)}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the final calculated value for this metric.
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  onClick={handleSubmit}
                  disabled={
                    !selectedMetricId ||
                    (inputMode === "manual" && !manualValue.trim()) ||
                    isUploading
                  }
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                      {inputMode === "manual"
                        ? "Saving Value..."
                        : "Processing Data..."}
                    </>
                  ) : (
                    <>
                      {inputMode === "manual" ? (
                        <>
                          <IconCalculator className="h-4 w-4 mr-2" />
                          Save Value
                        </>
                      ) : (
                        <>
                          <IconUpload className="h-4 w-4 mr-2" />
                          Upload & Calculate
                        </>
                      )}
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
