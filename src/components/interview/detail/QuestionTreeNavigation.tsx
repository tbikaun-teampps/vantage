import React, { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconSearch,
  IconX,
  IconChevronRight,
  IconChevronDown,
  IconCheck,
  IconClock,
  IconFilter,
  IconLoader2,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface Question {
  id: number;
  title: string;
  question_text: string;
  order_index: number;
}

interface Step {
  id: number;
  title: string;
  order_index: number;
  questions: Question[];
}

interface Section {
  id: number;
  title: string;
  order_index: number;
  steps: Step[];
}

interface Role {
  id: number;
  name: string;
  shared_role?: {
    id: number;
    name: string;
    description?: string;
  };
}

interface QuestionTreeNavigationProps {
  questionnaireStructure: Section[];
  currentQuestionIndex: number;
  responses: Record<string, any>;
  allQuestionnaireRoles: Role[];
  onQuestionSelect: (globalIndex: number) => void;
  answeredQuestions?: number;
  totalQuestions?: number;
  progressPercentage?: number;
  onCompleteInterview?: () => void;
  isSubmitting?: boolean;
}

interface TreeNode {
  type: "section" | "step" | "question";
  id: string;
  title: string;
  globalIndex?: number;
  children?: TreeNode[];
  isAnswered?: boolean;
  isCurrent?: boolean;
  questionCount?: number;
  answeredCount?: number;
  roles?: Role[];
}

export function QuestionTreeNavigation({
  questionnaireStructure,
  currentQuestionIndex,
  responses,
  allQuestionnaireRoles,
  onQuestionSelect,
  answeredQuestions,
  totalQuestions,
  progressPercentage,
  onCompleteInterview,
  isSubmitting,
}: QuestionTreeNavigationProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Build tree structure with metadata
  const treeData = useMemo(() => {
    let globalQuestionIndex = 0;
    const tree: TreeNode[] = [];

    questionnaireStructure.forEach((section) => {
      const sectionNode: TreeNode = {
        type: "section",
        id: `section-${section.id}`,
        title: section.title,
        children: [],
        questionCount: 0,
        answeredCount: 0,
      };

      section.steps.forEach((step) => {
        const stepNode: TreeNode = {
          type: "step",
          id: `step-${step.id}`,
          title: step.title,
          children: [],
          questionCount: 0,
          answeredCount: 0,
        };

        step.questions
          .sort((a, b) => a.order_index - b.order_index)
          .forEach((question) => {
            const isAnswered = responses[question.id]?.rating_score != null;
            const isCurrent = globalQuestionIndex === currentQuestionIndex;

            const questionNode: TreeNode = {
              type: "question",
              id: `question-${question.id}`,
              title: question.title,
              globalIndex: globalQuestionIndex,
              isAnswered,
              isCurrent,
              roles: allQuestionnaireRoles, // Use all questionnaire roles for filtering
            };

            stepNode.children!.push(questionNode);
            stepNode.questionCount = (stepNode.questionCount || 0) + 1;
            if (isAnswered) {
              stepNode.answeredCount = (stepNode.answeredCount || 0) + 1;
            }

            globalQuestionIndex++;
          });

        if (stepNode.children!.length > 0) {
          sectionNode.children!.push(stepNode);
          sectionNode.questionCount =
            (sectionNode.questionCount || 0) + (stepNode.questionCount || 0);
          sectionNode.answeredCount =
            (sectionNode.answeredCount || 0) + (stepNode.answeredCount || 0);
        }
      });

      if (sectionNode.children!.length > 0) {
        tree.push(sectionNode);
      }
    });

    return tree;
  }, [
    questionnaireStructure,
    responses,
    currentQuestionIndex,
    allQuestionnaireRoles,
  ]);

  // Filter tree based on search and role filters
  const filteredTree = useMemo(() => {
    if (!searchTerm.trim() && selectedRoles.length === 0) {
      return treeData;
    }

    const filterNode = (node: TreeNode): TreeNode | null => {
      if (node.type === "question") {
        // Check search term
        const matchesSearch =
          !searchTerm.trim() ||
          node.title.toLowerCase().includes(searchTerm.toLowerCase());

        // Check role filter
        const matchesRole =
          selectedRoles.length === 0 ||
          (node.roles &&
            node.roles.some((role) =>
              selectedRoles.includes(role.shared_role?.name)
            ));

        return matchesSearch && matchesRole ? node : null;
      }

      // For sections and steps, recursively filter children
      const filteredChildren: TreeNode[] = [];
      node.children?.forEach((child) => {
        const filteredChild = filterNode(child);
        if (filteredChild) {
          filteredChildren.push(filteredChild);
        }
      });

      if (filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren,
        };
      }

      return null;
    };

    const filtered: TreeNode[] = [];
    treeData.forEach((node) => {
      const filteredNode = filterNode(node);
      if (filteredNode) {
        filtered.push(filteredNode);
      }
    });

    return filtered;
  }, [treeData, searchTerm, selectedRoles]);

  // Auto-expand all nodes on mount and when filtering
  useEffect(() => {
    const allNodeIds = new Set<string>();

    const collectNodeIds = (nodes: TreeNode[]) => {
      nodes.forEach((node) => {
        allNodeIds.add(node.id);
        if (node.children) {
          collectNodeIds(node.children);
        }
      });
    };

    collectNodeIds(filteredTree);
    setExpandedNodes(allNodeIds);
  }, [filteredTree]);

  // Get unique role names for filter - use all questionnaire roles instead of just current question roles
  const availableRoles = useMemo(() => {
    const roleNames = new Set<string>();
    allQuestionnaireRoles.forEach((role) => {
      roleNames.add(role.shared_role.name);
    });
    return Array.from(roleNames).sort();
  }, [allQuestionnaireRoles]);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedRoles([]);
  };

  const renderTreeNode = (node: TreeNode, depth = 0): React.ReactNode => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const paddingLeft = depth * 16 + 12;

    return (
      <div key={node.id} className="w-full">
        <div
          className={cn(
            "group flex items-center gap-2 py-2 pr-3 hover:bg-accent/50 rounded-lg cursor-pointer transition-all duration-200",
            node.isCurrent &&
              "bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/50 dark:hover:bg-blue-800/50 text-blue-900 dark:text-blue-100 border border-blue-300 dark:border-blue-700",
            node.isAnswered &&
              !node.isCurrent &&
              "bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-900 dark:text-green-100"
          )}
          style={{ paddingLeft }}
          onClick={() => {
            if (node.type === "question" && node.globalIndex !== undefined) {
              onQuestionSelect(node.globalIndex);
            } else if (hasChildren) {
              toggleNode(node.id);
            }
          }}
        >
          {/* Expand/collapse button */}
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-accent/80 flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.id);
              }}
            >
              {isExpanded ? (
                <IconChevronDown className="h-3 w-3" />
              ) : (
                <IconChevronRight className="h-3 w-3" />
              )}
            </Button>
          )}

          {/* Content */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Question number for questions */}
            {node.type === "question" && node.globalIndex !== undefined && (
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {node.globalIndex + 1}
              </span>
            )}

            {/* Title */}
            <span
              className={cn(
                "text-sm truncate flex-1",
                node.type === "section" && "font-semibold",
                node.type === "step" && "font-medium",
                node.type === "question" && "font-normal"
              )}
            >
              {node.title}
            </span>

            {/* Status indicators and badges */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Progress badge for sections/steps */}
              {(node.type === "section" || node.type === "step") &&
                node.questionCount && (
                  <Badge variant="outline" className="text-xs">
                    {node.answeredCount}/{node.questionCount}
                  </Badge>
                )}

              {/* Status icon for questions */}
              {node.type === "question" && (
                <>
                  {node.isCurrent && (
                    <IconClock className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  )}
                  {node.isAnswered && !node.isCurrent && (
                    <IconCheck className="h-3 w-3 text-green-600 dark:text-green-400" />
                  )}
                </>
              )}

              {/* Role indicator for questions */}
              {/* {node.type === 'question' && node.roles && node.roles.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  <IconUsers className="h-2 w-2 mr-1" />
                  {node.roles.length}
                </Badge>
              )} */}
            </div>
          </div>
        </div>

        {/* Render children */}
        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {node.children!.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // const totalQuestions = treeData.reduce((sum, section) => sum + (section.questionCount || 0), 0);
  // const totalAnswered = treeData.reduce((sum, section) => sum + (section.answeredCount || 0), 0);
  const hasFilters = searchTerm.trim() || selectedRoles.length > 0;

  return (
    <div className="h-full flex flex-col">
      {/* Sticky Header with Search and Filters */}
      <div className="flex-shrink-0 bg-background border-b border-border">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">Questions</h2>
              {/* Progress badge */}
              {totalQuestions !== undefined &&
                answeredQuestions !== undefined && (
                  <Badge
                    variant={
                      progressPercentage === 100 ? "default" : "secondary"
                    }
                    className="text-xs"
                  >
                    {answeredQuestions}/{totalQuestions}
                  </Badge>
                )}
            </div>
            {/* Complete Interview button */}
            {onCompleteInterview && (
              <Button
                onClick={onCompleteInterview}
                disabled={isSubmitting}
                variant="default"
                size="sm"
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <IconLoader2 className="h-4 w-4 animate-spin" />
                    Completing...
                  </>
                ) : (
                  "Complete Interview"
                )}
              </Button>
            )}
          </div>

          {/* Search and filters */}
          <div className="space-y-3" data-tour="interview-search-filter">
            {/* Search input */}
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setSearchTerm("")}
                >
                  <IconX className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Role filter */}
            {availableRoles.length > 0 && (
              <div className="space-y-2">
                <Select
                  value={
                    selectedRoles.length === 1 ? selectedRoles[0] : "all-roles"
                  }
                  onValueChange={(value) => {
                    if (value === "all-roles") {
                      setSelectedRoles([]);
                    } else {
                      setSelectedRoles([value]);
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <div className="flex items-center gap-2">
                      <IconFilter className="h-4 w-4" />
                      <SelectValue placeholder="Filter by role" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-roles">All roles</SelectItem>
                    {availableRoles.map((roleName) => (
                      <SelectItem key={roleName} value={roleName}>
                        {roleName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedRoles.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {selectedRoles.length} role(s) selected
                    </Badge>
                  </div>
                )}
              </div>
            )}

            {/* Clear filters */}
            {hasFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="w-full"
              >
                <IconX className="h-3 w-3 mr-2" />
                Clear filters
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable Question Tree */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="p-4">
          {filteredTree.length > 0 ? (
            <div className="space-y-1">
              {filteredTree.map((node) => renderTreeNode(node))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <IconSearch className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {hasFilters
                  ? "No questions match your filters"
                  : "No questions available"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
