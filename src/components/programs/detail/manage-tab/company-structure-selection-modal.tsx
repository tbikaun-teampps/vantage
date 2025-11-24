import { useState, useEffect, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  IconBuilding,
  IconMapPin,
  IconWorld,
  IconBuildingFactory2,
  IconCube,
  IconUsersGroup,
  IconUser,
  IconPlus,
  IconLoader2,
  IconUsers,
} from "@tabler/icons-react";
import { useCompanyTree } from "@/hooks/useCompany";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";
import { useCreateProgramInterviews, useProgramById } from "@/hooks/useProgram";
import { getContactsByRole } from "@/lib/api/contacts";
import { validateProgramQuestionnaireRoles } from "@/lib/api/interviews";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  AssetGroupNode,
  BusinessUnitNode,
  CompanyTree,
  CompanyTreeNodeType,
  Contact,
  RegionNode,
  ReportingRoleNode,
  RoleNode,
  SiteNode,
  WorkGroupNode,
} from "@/types/api/companies";

interface ContactWithPath extends Contact {
  roleId: number;
  roleName: string;
  organizationPath: string;
}

// Union type for base tree nodes without the type discriminator
// These are the actual API response types before adding the discriminator
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
// Note: We use composite IDs (e.g., "role-123", "site-456") because different database
// tables (regions, sites, asset_groups, work_groups, roles) all use separate int8
// sequences starting from 1. This causes ID collisions when flattened into a single array.
// The dbId stores the original numeric database ID for API calls.
interface FlatNode {
  id: string; // Composite ID for UI uniqueness: "type-dbId" (e.g., "role-123")
  dbId: number; // Original database ID (e.g., 123)
  name: string;
  type: CompanyTreeNodeType;
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
  questionnaireType: "onsite" | "presite";
  maxHeight?: string;
  questionnaireId: number;
}

// Simple tree node component
interface SimpleTreeNodeProps {
  node: FlatNode;
  isVisible: boolean;
  selectionState: "full" | "partial" | "none";
  onNodeSelection: (nodeId: string) => void;
}

function SimpleTreeNode({
  node,
  isVisible,
  selectionState,
  onNodeSelection,
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

  const handleNodeClick = () => {
    onNodeSelection(node.id);
  };

  const handleNodeClickEvent = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleNodeClick();
  };

  return (
    <div className="flex items-center py-1 hover:bg-muted/50 rounded-sm">
      <div
        style={{ paddingLeft: `${node.level * 20}px` }}
        className="flex items-center gap-2 flex-1"
      >
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

interface CreateButtonProps {
  disabled: boolean;
  isPending: boolean;
  isValidating: boolean;
  hasMultipleRoles: boolean;
  isIndividual: boolean;
  onClick: () => void;
}

function renderCreateButton({
  disabled,
  isPending,
  isValidating,
  hasMultipleRoles,
  isIndividual,
  onClick,
}: CreateButtonProps) {
  const icon =
    isPending || isValidating ? (
      <IconLoader2 className="mr-2 animate-spin" />
    ) : (
      <IconPlus className="mr-2" />
    );

  const buttonText = isPending
    ? "Creating Interviews..."
    : isValidating
      ? "Validating..."
      : `Create ${hasMultipleRoles && isIndividual ? "Interviews" : "Interview"}`;

  return (
    <Button disabled={disabled} onClick={onClick}>
      {icon}
      {buttonText}
    </Button>
  );
}

export function CompanyStructureSelectionModal({
  open,
  onOpenChange,
  programId,
  programPhaseId,
  questionnaireType,
  maxHeight = "300px",
  questionnaireId,
}: CompanyStructureSelectionModalProps) {
  const companyId = useCompanyFromUrl();
  const { data: tree, isLoading } = useCompanyTree(companyId);
  const { data: program } = useProgramById(programId);
  const createInterviews = useCreateProgramInterviews();

  const [selectedRoleIds, setSelectedRoleIds] = useState<Set<string>>(
    new Set()
  );
  const [isIndividualInterview, setIsIndividualInterview] =
    useState<boolean>(false);
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
    const parts = compositeId.split("-");
    return parseInt(parts[parts.length - 1], 10);
  };

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
      // Create composite ID with type to avoid collisions between different entity types
      const nodeId = `${type}-${item.id}`;
      const itemName: string = (item as {name?: string}).name ?? `${type} ${item.id}`;
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
        dbId:
          typeof item.id === "number" ? item.id : parseInt(String(item.id), 10),
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
        item.roles.forEach((child) =>
          flattenNode(child, "role", level + 1, nodePath, nodeId)
        );
      } else if (
        type === "role" &&
        "reporting_roles" in item &&
        item.reporting_roles
      ) {
        // Handle direct reports (role → role hierarchy, 1 level deep)
        item.reporting_roles.forEach((child) =>
          flattenNode(child, "role", level + 1, nodePath, nodeId)
        );
      }
    };

    flattenNode(tree, "company", 0, "");

    return nodes;
  }, [tree]);

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
          // Continue recursing to collect reporting roles (role → role hierarchy)
          collectRoles(child.id);
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

      if (!questionnaireId) {
        setHasApplicableQuestions(false);
        return;
      }

      setIsValidatingRoles(true);
      try {
        // Extract numeric database IDs from composite role IDs for API call
        const roleIds = Array.from(selectedRoleIds).map((compositeId) =>
          extractNumericId(compositeId)
        );

        // Check if questionnaire has questions applicable to the selected roles
        const result = await validateProgramQuestionnaireRoles(
          questionnaireId,
          { roleIds }
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
  }, [selectedRoleIds, program, questionnaireId]);

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

            roleContacts?.forEach((contact) => {
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

  const handleSubmit = async () => {
    if (!questionnaireId) {
      toast.error(
        `No questionnaire of this type is configured for this program. Please configure one first.`
      );
      return;
    }
    if (selectedRoleIds.size === 0) {
      toast.error("Please select at least one role");
      return;
    }

    if (isIndividualInterview && selectedContactIds.length === 0) {
      toast.error("Please select at least one contact for public interviews");
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
            interviewType: questionnaireType,
          });
        }
      } else {
        // For non-public interviews, use all selected roles as before
        // Extract numeric database IDs from composite role IDs
        const roleIds = Array.from(selectedRoleIds).map((compositeId) =>
          extractNumericId(compositeId)
        );
        await createInterviews.mutateAsync({
          programId,
          phaseId: programPhaseId,
          isIndividualInterview,
          roleIds,
          contactIds: [],
          interviewType: questionnaireType,
        });
      }

      // Reset form and close modal on success
      setSelectedRoleIds(new Set());
      setSelectedContactIds([]);
      setIsIndividualInterview(false);
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
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
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
                      {flatNodes.map((node) => (
                        <SimpleTreeNode
                          key={node.id}
                          node={node}
                          isVisible={true}
                          selectionState={getNodeSelectionState(node.id)}
                          onNodeSelection={handleNodeSelection}
                        />
                      ))}
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
                      questionnaire. Please select different roles or ensure the
                      questionnaire is properly configured.
                    </p>
                  )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Placeholder */}
            {selectedRoles.length === 0 && (
              <div className="shadow-none text-center border-dashed border-2 border-border rounded-lg bg-background h-full flex items-center justify-center">
                <div className="p-8">
                  <div className="text-center py-8">
                    <IconUsers className="mx-auto mb-4 h-8 w-8 text-muted-foreground" />
                    <div className="text-muted-foreground text-sm">
                      Select roles from the company structure on the left to
                      begin creating interviews.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedRoles.length > 0 && (
              <div className="space-y-2">
                <Label>Create interview(s) for individuals or a group?</Label>
                <div className="flex space-x-2 mb-2">
                  <Button
                    variant={isIndividualInterview ? "default" : "outline"}
                    onClick={() => setIsIndividualInterview(true)}
                  >
                    Individual
                  </Button>
                  <Button
                    variant={!isIndividualInterview ? "default" : "outline"}
                    onClick={() => setIsIndividualInterview(false)}
                    className="ml-2"
                  >
                    Group
                  </Button>
                </div>
              </div>
            )}

            {/* Contact Selection */}
            {isIndividualInterview && selectedRoles.length > 0 && (
              <div className="space-y-2">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Label>Interviewee Contacts</Label>
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
                    Select who you would like to create interviews for from the
                    list below
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
            )}
            {selectedRoles.length > 0 &&
              renderCreateButton({
                disabled:
                  createInterviews.isPending ||
                  selectedRoleIds.size === 0 ||
                  !hasApplicableQuestions ||
                  (isIndividualInterview && selectedContactIds.length === 0),
                isPending: createInterviews.isPending,
                isValidating: isValidatingRoles,
                hasMultipleRoles: isIndividualInterview
                  ? selectedContactIds.length > 1
                  : selectedRoleIds.size > 1,
                isIndividual: isIndividualInterview,
                onClick: handleSubmit,
              })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
