import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconSearch,
  IconX,
  IconChevronRight,
  IconChevronDown,
  IconCircleCheckFilled,
  IconCircle,
  IconCircleCheck,
  IconClock,
  IconPlayerPlay,
  IconEye,
  IconEyeOff,
  IconUser,
  IconBuilding,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useInterviewStructure } from "@/hooks/interview/useInterviewStructure";
import { useInterviewProgress } from "@/hooks/interview/useInterviewProgress";
import { useInterviewNavigation } from "@/hooks/interview/useInterviewNavigation";
import { useInterviewSummary } from "@/hooks/interview/useInterviewSummary";

interface InterviewSidebarProps {
  interviewId: number;
  isIndividualInterview: boolean;
}

interface TreeNode {
  type: "section" | "step" | "question";
  id: string;
  questionId?: number;
  title: string;
  orderIndex: number;
  children?: TreeNode[];
  isAnswered?: boolean;
  isCurrent?: boolean;
  questionCount?: number;
  answeredCount?: number;
}

export function InterviewSidebar({
  interviewId,
  isIndividualInterview,
}: InterviewSidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const { data: structure, isLoading: isLoadingStructure } =
    useInterviewStructure(interviewId);

  const { data: progress, isLoading: isLoadingProgress } =
    useInterviewProgress(interviewId);

  const { data: summary, isLoading: isLoadingSummary } =
    useInterviewSummary(interviewId);

  const { allQuestions, currentIndex, goToQuestion } = useInterviewNavigation(
    interviewId,
    isIndividualInterview
  );

  const sections = structure?.sections ?? [];
  const responses = progress?.responses ?? {};

  // Build tree structure with metadata
  const treeData = useMemo(() => {
    const tree: TreeNode[] = [];

    sections.forEach((section) => {
      const sectionNode: TreeNode = {
        type: "section",
        id: `section-${section.id}`,
        title: section.title,
        orderIndex: section.order_index,
        children: [],
        questionCount: 0,
        answeredCount: 0,
      };

      section.steps.forEach((step) => {
        const stepNode: TreeNode = {
          type: "step",
          id: `step-${step.id}`,
          title: step.title,
          orderIndex: step.order_index,
          children: [],
          questionCount: 0,
          answeredCount: 0,
        };

        step.questions.forEach((question) => {
          const questionResponse = responses[question.id];

          // Only count applicable questions
          if (!questionResponse || questionResponse.is_applicable === false) {
            return;
          }

          // Check if question is answered
          const isAnswered =
            (questionResponse.rating_score != null &&
              questionResponse.has_roles) ||
            questionResponse.is_unknown;

          // Check if this is the current question
          const currentQuestion = allQuestions[currentIndex];
          const isCurrent = currentQuestion?.id === question.id;

          const questionNode: TreeNode = {
            type: "question",
            id: `question-${question.id}`,
            questionId: question.id,
            title: question.title,
            orderIndex: question.order_index,
            isAnswered,
            isCurrent,
          };

          stepNode.children!.push(questionNode);
          stepNode.questionCount = (stepNode.questionCount || 0) + 1;
          if (isAnswered) {
            stepNode.answeredCount = (stepNode.answeredCount || 0) + 1;
          }
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
  }, [sections, responses, currentIndex, allQuestions]);

  // Filter tree based on search
  const filteredTree = useMemo(() => {
    if (!searchTerm.trim()) {
      return treeData;
    }

    const filterNode = (node: TreeNode): TreeNode | null => {
      if (node.type === "question") {
        // Check search term
        const matchesSearch = node.title
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

        return matchesSearch ? node : null;
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
  }, [treeData, searchTerm]);

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

  const clearSearch = () => {
    setSearchTerm("");
  };

  const renderTreeNode = (node: TreeNode, depth = 0): React.ReactNode => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const paddingLeft = depth * 12 + 12;

    return (
      <div key={node.id} className="w-full">
        <div
          className={cn(
            "group flex items-center gap-2 py-2 pr-3 hover:bg-accent/50 rounded-md cursor-pointer transition-colors",
            node.isCurrent &&
              "bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50"
          )}
          style={{ paddingLeft }}
          onClick={() => {
            if (node.type === "question" && node.questionId !== undefined) {
              goToQuestion(node.questionId);
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
              className="h-4 w-4 p-0 hover:bg-accent flex-shrink-0"
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
            {/* Title */}
            <span
              className={cn(
                "text-sm truncate flex-1",
                node.type === "section" && "font-semibold",
                node.type === "step" && "font-medium",
                node.type === "question" && "font-normal"
              )}
              title={node.title}
            >
              {node.type === "section" && `${node.orderIndex}. `}
              {node.type === "step" && `${node.orderIndex}. `}
              {node.type === "question" && `${node.orderIndex}. `}
              {node.title}
            </span>

            {/* Status indicators and badges */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Progress badge for sections/steps */}
              {(node.type === "section" || node.type === "step") &&
                node.questionCount && (
                  <Badge variant="outline" className="text-xs px-1.5 py-0">
                    {node.answeredCount}/{node.questionCount}
                  </Badge>
                )}

              {/* Status icon for questions */}
              {node.type === "question" && (
                <>
                  {node.isAnswered ? (
                    <IconCircleCheckFilled className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                  ) : (
                    <IconCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Render children */}
        {hasChildren && isExpanded && (
          <div className="space-y-0.5 mt-0.5">
            {node.children!.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const hasFilters = searchTerm.trim();

  if (
    isLoadingStructure ||
    !structure ||
    isLoadingProgress ||
    !progress ||
    isLoadingSummary ||
    !summary
  ) {
    return (
      <div className="w-[340px] h-full border-r border-border bg-background flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Get username for badge
  const username = summary.is_individual
    ? summary.interviewee?.full_name || "Unknown"
    : summary.interviewer?.full_name || "Unknown";

  return (
    <div className="w-[340px] h-full border-r border-l border-border bg-background flex flex-col">
      {/* Sticky Header */}
      <div className="flex-shrink-0 border-b border-border">
        <div className="p-4 space-y-3">
          {/* Progress */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Questions</h2>
            <Badge variant="secondary" className="text-xs">
              {progress.answered_questions}/{progress.total_questions}
            </Badge>
          </div>

          {/* Search input */}
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-9 h-9"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={clearSearch}
              >
                <IconX className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable Question Tree */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="p-3">
          {filteredTree.length > 0 ? (
            <div className="space-y-0.5">
              {filteredTree.map((node) => renderTreeNode(node))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <IconSearch className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {hasFilters
                  ? "No questions match your search"
                  : "No questions available"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer with Interview Badges */}
      <div className="flex-shrink-0 border-t border-border bg-background p-3 space-y-2 h-36">
        <div className="flex gap-2">
          {/* Individual/Group Badge */}
          <Badge variant="outline" className="text-xs w-fit">
            {summary.is_individual ? (
              <IconEye className="h-3 w-3 mr-1" />
            ) : (
              <IconEyeOff className="h-3 w-3 mr-1" />
            )}
            {summary.is_individual ? "Individual" : "Group"}
          </Badge>

          {/* Name Badge */}
          <Badge variant="outline" className="text-xs w-fit">
            <IconUser className="h-3 w-3 mr-1" />
            <span className="truncate max-w-[260px]">{username}</span>
          </Badge>

          {/* Company Badge */}
          {summary.company?.name && (
            <Badge variant="outline" className="text-xs w-fit">
              {summary.company.icon_url ? (
                <img
                  src={summary.company.icon_url}
                  alt="Company Icon"
                  className="h-3 w-3 mr-1 rounded-sm object-cover"
                />
              ) : (
                <IconBuilding className="h-3 w-3 mr-1" />
              )}
              <span className="truncate max-w-[260px]">
                {summary.company.name}
              </span>
            </Badge>
          )}
        </div>
        <div className="flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs">
          Vantage by{" "}
          <a
            href="https://www.teampps.com.au"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 bg-gradient-to-r from-[#eb59ff] to-[#032a83] bg-clip-text text-transparent hover:from-[#f472b6] hover:to-[#1e40af] transition-all duration-300"
          >
            TEAM
          </a>
          <span className="ml-1">• © 2025</span>
        </div>
      </div>
    </div>
  );
}
