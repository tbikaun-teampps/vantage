import { useState, useEffect, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";
import { useCreateProgramInterviews, useProgramById } from "@/hooks/useProgram";
import { getContactsByRole } from "@/lib/api/contacts";
import { validateProgramQuestionnaireRoles } from "@/lib/api/interviews";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  AnyTreeNode,
  TreeNodeType,
  BusinessUnitTreeNode,
  RegionTreeNode,
  SiteTreeNode,
  AssetGroupTreeNode,
  WorkGroupTreeNode,
} from "@/types/company";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Contact {
  id: number;
  full_name: string;
  email: string;
  title?: string | null;
  phone?: string | null;
}

interface ContactWithPath extends Contact {
  roleId: number;
  roleName: string;
  organizationPath: string;
}

// Flattened node structure for easier searching and display
// Note: We use composite IDs (e.g., "role-123", "site-456") because different database
// tables (regions, sites, asset_groups, work_groups, roles) all use separate int8
// sequences starting from 1. This causes ID collisions when flattened into a single array.
// The dbId stores the original numeric database ID for API calls.
interface FlatNode {
  id: string;          // Composite ID for UI uniqueness: "type-dbId" (e.g., "role-123")
  dbId: number;        // Original database ID (e.g., 123)
  name: string;
  type: TreeNodeType;
  level: number;
  path: string;
  parentId?: string;
  hasChildren: boolean;
}

interface CompanyStructureSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programId: number;
  programPhaseId: number;
  defaultInterviewType?: "onsite" | "presite";
}

// Simple tree node component
interface SimpleTreeNodeProps {
  node: FlatNode;
  isExpanded: boolean;
  onToggleExpanded: (nodeId: string) => void;
  isVisible: boolean;
  selectionState: "full" | "partial" | "none";
  onNodeSelection: (nodeId: string) => void;
}

function SimpleTreeNode({
  node,
  isExpanded,
  onToggleExpanded,
  isVisible,
  selectionState,
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
      role: <IconUser className="h-4 w-4 text-indigo-600" />,
    };
    return iconMap[type];
  };

  const handleNodeClick = () => {
    onNodeSelection(node.id);
  };

  const handleNodeClickEvent = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleNodeClick();
  };

  const handleExpandToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpanded(node.id);
  };

  return (
    <div className="flex items-center py-1 hover:bg-muted/50 rounded-sm">
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

        {/* Selection Checkbox */}
        <Checkbox
          checked={selectionState === "full"}
          onCheckedChange={() => handleNodeClick()}
          className="flex-shrink-0"
        />

        {/* Node Icon and Label */}
        <div
          className="flex items-center gap-2 flex-1 cursor-pointer"
          onClick={handleNodeClickEvent}
        >
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

export function CompanyStructureSelectionModal({
  open,
  onOpenChange,
  programId,
  programPhaseId,
  defaultInterviewType = "onsite",
}: CompanyStructureSelectionModalProps) {
  const companyId = useCompanyFromUrl();
  const { data: tree, isLoading } = useCompanyTree(companyId);
  const { data: program } = useProgramById(programId);
  const createInterviews = useCreateProgramInterviews();

  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleIds, setSelectedRoleIds] = useState<Set<string>>(
    new Set()
  );
  const [isIndividualInterview, setIsIndividualInterview] =
    useState<boolean>(false);
  const [interviewType, setInterviewType] = useState<"onsite" | "presite">(
    defaultInterviewType
  );
  const [availableContacts, setAvailableContacts] = useState<ContactWithPath[]>(
    []
  );
  const [selectedContactIds, setSelectedContactIds] = useState<number[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState<boolean>(false);
  const [isValidatingRoles, setIsValidatingRoles] = useState<boolean>(false);
  const [hasApplicableQuestions, setHasApplicableQuestions] =
    useState<boolean>(true);

  /**
   * Helper function to extract numeric database ID from composite ID
   * @param compositeId - The composite ID string (e.g., "role-123", "site-456")
   * @returns The numeric database ID (e.g., 123, 456)
   *
   * Note: This is needed because we use composite IDs in the UI to avoid collisions
   * between different entity types that share the same numeric IDs in their respective tables.
   */
  const extractNumericId = (compositeId: string): number => {
    const parts = compositeId.split('-');
    return parseInt(parts[parts.length - 1], 10);
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
      // Create composite ID with type to avoid collisions between different entity types
      const nodeId = `${type}-${item.id}`;
      const itemName = "name" in item ? item.name : `${type} ${item.id}`;
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
        // Roles can have direct reports (1 level deep hierarchy)
        hasChildren = (item.reporting_roles?.length || 0) > 0;
      }

      nodes.push({
        id: nodeId,
        dbId: typeof item.id === 'number' ? item.id : parseInt(String(item.id), 10),
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
      } else if (type === "work_group" && "roles" in item && item.roles) {
        item.roles.forEach((child) =>
          flattenNode(child, "role", level + 1, nodePath, nodeId)
        );
      } else if (type === "role" && "reporting_roles" in item && item.reporting_roles) {
        // Handle direct reports (role → role hierarchy, 1 level deep)
        item.reporting_roles.forEach((child) =>
          flattenNode(child, "role", level + 1, nodePath, nodeId)
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

  // Helper function to get all descendant role IDs for a given node
  const getDescendantRoleIds = (nodeId: string): string[] => {
    const roleIds: string[] = [];
    const node = flatNodes.find((n) => n.id === nodeId);
    if (!node) return roleIds;

    // If this is already a role, return it
    if (node.type === "role") {
      return [nodeId];
    }

    // Find all descendant nodes and collect role IDs by traversing down the tree
    const collectRoles = (currentNodeId: string) => {
      const children = flatNodes.filter((n) => n.parentId === currentNodeId);
      children.forEach((child) => {
        if (child.type === "role") {
          roleIds.push(child.id);
        } else {
          collectRoles(child.id);
        }
      });
    };

    collectRoles(nodeId);
    return roleIds;
  };

  // Get selection state for a node (full, partial, or none)
  const getNodeSelectionState = (
    nodeId: string
  ): "full" | "partial" | "none" => {
    const descendantRoleIds = getDescendantRoleIds(nodeId);
    if (descendantRoleIds.length === 0) return "none";

    const selectedCount = descendantRoleIds.filter((roleId) =>
      selectedRoleIds.has(roleId)
    ).length;

    if (selectedCount === descendantRoleIds.length) return "full";
    if (selectedCount > 0) return "partial";
    return "none";
  };

  // Handle node selection (cascade down to roles)
  const handleNodeSelection = (nodeId: string) => {
    const descendantRoleIds = getDescendantRoleIds(nodeId);
    if (descendantRoleIds.length === 0) return;

    const selectionState = getNodeSelectionState(nodeId);
    const newSelectedRoleIds = new Set(selectedRoleIds);

    if (selectionState === "full") {
      // Deselect all descendant roles
      descendantRoleIds.forEach((roleId) => {
        newSelectedRoleIds.delete(roleId);
      });
    } else {
      // Select all descendant roles
      descendantRoleIds.forEach((roleId) => {
        newSelectedRoleIds.add(roleId);
      });
    }

    setSelectedRoleIds(newSelectedRoleIds);
  };

  // Clear all selections
  const clearAllSelections = () => {
    setSelectedRoleIds(new Set());
  };

  // Get selected role details for display
  const selectedRoles = useMemo(() => {
    return flatNodes.filter(
      (node) => node.type === "role" && selectedRoleIds.has(node.id)
    );
  }, [flatNodes, selectedRoleIds]);

  // Validate that selected roles have applicable questions
  useEffect(() => {
    async function validateRoleApplicability() {
      if (!program || selectedRoleIds.size === 0) {
        setHasApplicableQuestions(true);
        return;
      }

      // Get the appropriate questionnaire based on interview type
      const questionnaireId =
        interviewType === "onsite"
          ? program.onsite_questionnaire_id
          : program.presite_questionnaire_id;

      if (!questionnaireId) {
        setHasApplicableQuestions(false);
        return;
      }

      setIsValidatingRoles(true);
      try {
        // Extract numeric database IDs from composite role IDs for API call
        const roleIds = Array.from(selectedRoleIds).map((compositeId) => extractNumericId(compositeId));

        // Check if questionnaire has questions applicable to the selected roles
        const result = await validateProgramQuestionnaireRoles(
          questionnaireId,
          roleIds
        );

        setHasApplicableQuestions(result.isValid);
      } catch (error) {
        console.error("Failed to validate role applicability:", error);
        setHasApplicableQuestions(false);
      } finally {
        setIsValidatingRoles(false);
      }
    }

    validateRoleApplicability();
  }, [selectedRoleIds, interviewType, program]);

  // Load contacts when public mode is enabled and roles are selected
  useEffect(() => {
    async function loadContacts() {
      if (isIndividualInterview && selectedRoleIds.size > 0) {
        setIsLoadingContacts(true);
        try {
          // Get contacts for all selected roles with organizational context
          const allContacts: ContactWithPath[] = [];
          const contactSet = new Map<number, ContactWithPath>();

          for (const compositeRoleId of Array.from(selectedRoleIds)) {
            const roleNode = flatNodes.find(
              (n) => n.id === compositeRoleId && n.type === "role"
            );
            if (!roleNode) continue;

            // Use the numeric database ID for the API call
            const roleContacts = await getContactsByRole(
              companyId,
              roleNode.dbId
            );
            roleContacts.forEach((contact) => {
              if (!contactSet.has(contact.id)) {
                const contactWithPath: ContactWithPath = {
                  ...contact,
                  roleId: roleNode.dbId,
                  roleName: roleNode.name,
                  organizationPath: roleNode.path,
                };
                contactSet.set(contact.id, contactWithPath);
                allContacts.push(contactWithPath);
              }
            });
          }

          // Sort contacts by organization path for better grouping
          allContacts.sort((a, b) =>
            a.organizationPath.localeCompare(b.organizationPath)
          );

          setAvailableContacts(allContacts);
          setSelectedContactIds([]);
        } catch (error) {
          console.error("Failed to load contacts:", error);
          toast.error("Failed to load contacts for selected roles");
          setAvailableContacts([]);
        } finally {
          setIsLoadingContacts(false);
        }
      } else {
        setAvailableContacts([]);
        setSelectedContactIds([]);
      }
    }
    loadContacts();
  }, [isIndividualInterview, selectedRoleIds, flatNodes, companyId]);

  // Auto-expand company node and reset state when modal opens
  useEffect(() => {
    if (open) {
      if (tree && expandedNodes.size === 0) {
        // Use composite ID for the company node
        setExpandedNodes(new Set([`company-${tree.id}`]));
      }
      // Reset state when modal opens
      setInterviewType(defaultInterviewType);
      setIsValidatingRoles(false);
      setHasApplicableQuestions(true);
    } else {
      // Reset validation state when modal closes
      setIsValidatingRoles(false);
      setHasApplicableQuestions(true);
    }
  }, [tree, open, expandedNodes.size, defaultInterviewType]);

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

  const handleSubmit = async () => {
    if (selectedRoleIds.size === 0) {
      toast.error("Please select at least one role");
      return;
    }

    if (isIndividualInterview && selectedContactIds.length === 0) {
      toast.error("Please select at least one contact for public interviews");
      return;
    }

    // Validate that appropriate questionnaire is configured
    const questionnaireId =
      interviewType === "onsite"
        ? program?.onsite_questionnaire_id
        : program?.presite_questionnaire_id;

    if (!questionnaireId) {
      toast.error(
        `No ${interviewType} questionnaire is configured for this program. Please configure one first.`
      );
      return;
    }

    // // Get current phase - we'll create interviews for the current phase
    // const currentPhase = program?.phases?.find(
    //   (phase) => !phase.locked_for_analysis_at
    // );
    // if (!currentPhase) {
    //   toast.error(
    //     "No active phase found. Please ensure the program has at least one active phase."
    //   );
    //   return;
    // }

    try {
      if (isIndividualInterview) {
        // For public interviews, create each interview with only the contact's specific role
        const selectedContacts = availableContacts.filter((contact) =>
          selectedContactIds.includes(contact.id)
        );

        // Group contacts by their role to batch create interviews with the same role
        const contactsByRole = selectedContacts.reduce(
          (acc, contact) => {
            const roleId = contact.roleId;
            if (!acc[roleId]) {
              acc[roleId] = [];
            }
            acc[roleId].push(contact.id);
            return acc;
          },
          {} as Record<number, number[]>
        );

        // Create interviews for each role group
        for (const [roleIdStr, contactIds] of Object.entries(contactsByRole)) {
          const roleId = parseInt(roleIdStr);
          await createInterviews.mutateAsync({
            programId,
            phaseId: programPhaseId,
            isIndividualInterview,
            roleIds: [roleId], // Only the specific role for these contacts
            contactIds,
            interviewType,
          });
        }
      } else {
        // For non-public interviews, use all selected roles as before
        // Extract numeric database IDs from composite role IDs
        const roleIds = Array.from(selectedRoleIds).map((compositeId) => extractNumericId(compositeId));
        await createInterviews.mutateAsync({
          programId,
          phaseId: programPhaseId,
          isIndividualInterview,
          roleIds,
          contactIds: [],
          interviewType,
        });
      }

      // Reset form and close modal on success
      setSelectedRoleIds(new Set());
      setSelectedContactIds([]);
      setIsIndividualInterview(false);
      setInterviewType(defaultInterviewType);
      onOpenChange(false);
    } catch (error) {
      // Error handling is done by the mutation hook
      console.error("Failed to create interviews:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Company Structure Scope</DialogTitle>
          <DialogDescription>
            Choose the organizational levels where you want to generate
            interviews. You can select specific sites, work groups, or roles to
            define the scope of your interviews.
          </DialogDescription>
          <span className="text-xs">
            Program {programId} - Assessment {programPhaseId}
          </span>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            {/* Search Field */}
            <div className="pb-4">
              <div className="relative">
                <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search company structure..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex-1 min-h-0">
              <ScrollArea className="border rounded-md overflow-y-auto">
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
                            key={node.id}
                            node={node}
                            isExpanded={expandedNodes.has(node.id)}
                            onToggleExpanded={toggleExpanded}
                            isVisible={isNodeVisible(node)}
                            selectionState={getNodeSelectionState(node.id)}
                            onNodeSelection={handleNodeSelection}
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
            {/* Selected Roles Summary */}
            {selectedRoles.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium">
                    Selected Roles ({selectedRoles.length})
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllSelections}
                    className="text-xs"
                  >
                    Clear All
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                  {selectedRoles.map((role) => (
                    <Badge
                      key={role.id}
                      variant="secondary"
                      className="text-xs"
                    >
                      {role.name}
                    </Badge>
                  ))}
                </div>
                {selectedRoles.length > 0 &&
                  !hasApplicableQuestions &&
                  !isValidatingRoles && (
                    <p className="text-sm text-destructive mt-2">
                      The selected roles have no applicable questions in the{" "}
                      {interviewType} questionnaire. Please select different
                      roles or ensure the questionnaire is properly configured.
                    </p>
                  )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Interview Type Selection */}
            {selectedRoles.length > 0 && (
              <div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Interview Type</Label>
                  <Select
                    value={interviewType}
                    onValueChange={(value: "onsite" | "presite") =>
                      setInterviewType(value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="onsite">Onsite Interview</SelectItem>
                      <SelectItem value="presite">
                        Pre-assessment Interview
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {interviewType === "onsite"
                      ? "Create interviews using the onsite questionnaire"
                      : "Create interviews using the self-audit questionnaire"}
                  </p>
                </div>
              </div>
            )}

            {/* Public Interview Toggle */}
            {selectedRoles.length > 0 && (
              <div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="public-mode"
                    checked={isIndividualInterview}
                    onCheckedChange={setIsIndividualInterview}
                  />
                  <Label htmlFor="public-mode" className="text-sm">
                    Create public interviews with contacts
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Public interviews can be accessed by contacts using an access
                  code
                </p>
              </div>
            )}

            {/* Contact Selection - Only show when public mode is enabled */}
            {isIndividualInterview && selectedRoles.length > 0 && (
              <div className="px-6 py-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Label className="text-sm font-medium">
                          Interviewee Contacts
                        </Label>
                        {selectedContactIds.length > 0 && (
                          <span className="text-sm text-muted-foreground">
                            ({selectedContactIds.length} selected)
                          </span>
                        )}
                      </div>
                      {availableContacts.length > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const allContactIds = availableContacts.map(
                              (contact) => contact.id
                            );
                            const allSelected = allContactIds.every((id) =>
                              selectedContactIds.includes(id)
                            );

                            if (allSelected) {
                              setSelectedContactIds([]);
                            } else {
                              setSelectedContactIds(allContactIds);
                            }
                          }}
                        >
                          {(() => {
                            const allContactIds = availableContacts.map(
                              (contact) => contact.id
                            );
                            const allSelected = allContactIds.every((id) =>
                              selectedContactIds.includes(id)
                            );
                            return allSelected ? "Unselect All" : "Select All";
                          })()}
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Select contacts to create interviews for each
                    </p>
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2 border rounded-md p-3">
                    {isLoadingContacts ? (
                      <div className="text-sm text-muted-foreground text-center py-4">
                        Loading contacts...
                      </div>
                    ) : selectedRoleIds.size === 0 ? (
                      <div className="text-sm text-muted-foreground text-center py-4">
                        Please select roles first
                      </div>
                    ) : availableContacts.length === 0 ? (
                      <div className="text-sm text-muted-foreground text-center py-4">
                        No contacts available for selected roles
                      </div>
                    ) : (
                      availableContacts.map((contact) => (
                        <div
                          key={contact.id}
                          className="flex items-start space-x-3 p-2 hover:bg-muted/50 rounded-md"
                        >
                          <Checkbox
                            id={`contact-${contact.id}`}
                            checked={selectedContactIds.includes(contact.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedContactIds([
                                  ...selectedContactIds,
                                  contact.id,
                                ]);
                              } else {
                                setSelectedContactIds(
                                  selectedContactIds.filter(
                                    (id) => id !== contact.id
                                  )
                                );
                              }
                            }}
                          />
                          <Label
                            htmlFor={`contact-${contact.id}`}
                            className="cursor-pointer flex-1"
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {contact.full_name}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {contact.email}
                              </span>
                              {contact.title && (
                                <span className="text-xs text-muted-foreground">
                                  {contact.title}
                                </span>
                              )}
                              <span className="text-xs text-muted-foreground/70 mt-1">
                                📍 {contact.organizationPath}
                              </span>
                            </div>
                          </Label>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
            <Button
              onClick={handleSubmit}
              disabled={
                createInterviews.isPending ||
                selectedRoleIds.size === 0 ||
                isValidatingRoles ||
                !hasApplicableQuestions ||
                (isIndividualInterview && selectedContactIds.length === 0)
              }
            >
              {createInterviews.isPending
                ? "Creating Interviews..."
                : isValidatingRoles
                  ? "Validating..."
                  : isIndividualInterview && selectedContactIds.length > 0
                    ? `Create ${selectedContactIds.length} ${interviewType === "onsite" ? "Onsite" : "Pre-assessment"} Interview${selectedContactIds.length > 1 ? "s" : ""}`
                    : selectedRoleIds.size > 0
                      ? `Create ${interviewType === "onsite" ? "Onsite" : "Pre-assessment"} Interview${selectedRoleIds.size > 1 ? "s" : ""}`
                      : "Create Interviews"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
