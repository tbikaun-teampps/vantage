import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconCircle,
  IconCircleCheckFilled,
  // IconFilter,
  IconX,
  IconDeviceFloppy,
  IconSearch,
  IconCircleCheck,
  IconClock,
  IconPlayerPlay,
} from "@tabler/icons-react";
import { Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useParams } from "react-router-dom";
import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "../../ui/select";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import { Separator } from "../../ui/separator";
import { useInterviewStructure } from "@/hooks/interview/useInterviewStructure";
import { useInterviewProgress } from "@/hooks/interview/useInterviewProgress";
import { useInterviewNavigation } from "@/hooks/interview/useInterviewNavigation";

interface InterviewActionBarProps {
  isSaving: boolean;
  isDirty: boolean;
  onSave?: () => void;
  isPublic?: boolean;
  onComplete?: () => void;
}

export function InterviewActionBar({
  isSaving,
  isDirty,
  onSave,
  isPublic = false,
  onComplete,
}: InterviewActionBarProps) {
  const { id: interviewId } = useParams();
  const isMobile = useIsMobile();

  // Use interview navigation hook
  const {
    allQuestions,
    currentIndex,
    totalQuestions,
    isFirst,
    isLast,
    isLoading,
    onPrevious,
    onNext,
    goToQuestion,
  } = useInterviewNavigation(parseInt(interviewId!), isPublic);

  const { data: structure, isLoading: isLoadingStructure } =
    useInterviewStructure(parseInt(interviewId!));

  const { data: progress, isLoading: isLoadingProgress } = useInterviewProgress(
    parseInt(interviewId!)
  );

  const sections = structure?.sections ?? [];
  const responses = progress?.responses ?? {};

  // Local UI state for filters
  // const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Extract roles from questionnaire structure (currently not used for filtering)
  const allQuestionnaireRoles = useMemo(() => {
    // This would need to be extracted from the questionnaire structure if needed
    // For now, returning empty array as it was being passed as [] in the parent
    return [];
  }, []);

  // Get unique role names for filter
  // const availableRoles = useMemo(() => {
  //   const roleNames = new Set<string>();
  //   allQuestionnaireRoles.forEach((role) => {
  //     if (role.shared_role?.name) {
  //       roleNames.add(role.shared_role.name);
  //     }
  //   });
  //   return Array.from(roleNames).sort();
  // }, [allQuestionnaireRoles]);

  // Filter sections based on selected roles and search query
  const filteredSections = useMemo(() => {
    const filterQuestion = (question: any) => {
      // Check if question is applicable (exclude non-applicable questions)
      const questionResponse = responses[question.id];
      const isApplicable =
        questionResponse && questionResponse.is_applicable !== false;

      // Check if question matches selected roles
      // const roleMatch =
      //   selectedRoles.length === 0 ||
      //   allQuestionnaireRoles.some((role) =>
      //     selectedRoles.includes(role.shared_role?.name)
      //   );

      // Check if question matches search query
      const searchMatch =
        searchQuery.trim() === "" ||
        question.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        question.question_text
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());

      return isApplicable && searchMatch; // roleMatch
    };

    return sections
      .map((section) => ({
        ...section,
        steps: section.steps
          .map((step: any) => ({
            ...step,
            questions: step.questions.filter(filterQuestion),
          }))
          .filter((step: any) => step.questions.length > 0),
      }))
      .filter((section) => section.steps.length > 0);
  }, [sections, allQuestionnaireRoles, searchQuery, responses]); // selectedRoles

  // const clearRoleFilter = () => {
  //   setSelectedRoles([]);
  // };

  const clearSearch = () => {
    setSearchQuery("");
  };

  // const clearAllFilters = () => {
  //   setSelectedRoles([]);
  //   setSearchQuery("");
  // };

  // Early return after all hooks are called
  if (isLoadingStructure || !structure || isLoadingProgress || !progress) {
    return null;
  }

  // Calculate completion progress for sections and steps
  const getSectionProgress = (section: any) => {
    let totalQuestions = 0;
    let answeredQuestions = 0;

    for (const step of section.steps) {
      for (const stepQuestion of step.questions) {
        const questionResponse = responses[stepQuestion.id];

        // Only count applicable questions
        if (!questionResponse || questionResponse.is_applicable === false) {
          continue;
        }

        totalQuestions++;
        const isAnswered =
          (questionResponse.rating_score != null &&
            questionResponse.has_roles) ||
          questionResponse.is_unknown;
        if (isAnswered) answeredQuestions++;
      }
    }

    return { total: totalQuestions, answered: answeredQuestions };
  };

  const getStepProgress = (step: any) => {
    let totalQuestions = 0;
    let answeredQuestions = 0;

    for (const stepQuestion of step.questions) {
      const questionResponse = responses[stepQuestion.id];

      // Only count applicable questions
      if (!questionResponse || questionResponse.is_applicable === false) {
        continue;
      }

      totalQuestions++;
      const isAnswered =
        (questionResponse.rating_score != null && questionResponse.has_roles) ||
        questionResponse.is_unknown;
      if (isAnswered) answeredQuestions++;
    }

    return { total: totalQuestions, answered: answeredQuestions };
  };

  // Status indicator configuration
  const statusConfig = {
    completed: {
      icon: IconCircleCheck,
      label: "Completed",
      className: "bg-green-500 text-white dark:bg-green-600 dark:text-black",
    },
    in_progress: {
      icon: IconPlayerPlay,
      label: "In Progress",
      className: "bg-blue-500 text-white dark:bg-blue-600",
    },
    pending: {
      icon: IconClock,
      label: "Pending",
      className: "bg-gray-500 text-white dark:bg-gray-800",
    },
  };

  return (
    <>
      {/* Backdrop overlay */}
      {isDropdownOpen && <div className="fixed inset-0 bg-black/10 z-40" />}

      <div
        className={`fixed ${
          isMobile ? "bottom-4 right-4" : "bottom-8 right-6"
        } z-50`}
      >
        {/* Interview status badge */}
        <div className="flex items-center justify-end mb-2">
          <Badge
            variant="outline"
            className={cn(
              "font-medium flex items-center gap-1.5",
              statusConfig[progress.status].className
            )}
          >
            {(() => {
              const StatusIcon = statusConfig[progress.status].icon;
              return <StatusIcon className="h-3.5 w-3.5" />;
            })()}
            <span>Interview: {statusConfig[progress.status].label}</span>
          </Badge>
        </div>
        <div
          className={`flex items-center ${
            isMobile ? "justify-between" : "space-x-2"
          } bg-background/95 backdrop-blur-sm border rounded-lg p-2 shadow-lg`}
        >
          <div
            className={`flex h-10 items-center ${
              isMobile ? "space-x-2" : "space-x-4"
            }`}
          >
            <Button
              variant="default"
              size="sm"
              onClick={onSave}
              disabled={isSaving || !isDirty}
              className={`h-10 ${
                isMobile ? "px-2" : "px-3"
              } flex items-center space-x-2`}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <IconDeviceFloppy className="h-4 w-4" />
              )}
              {!isMobile && (
                <span className="text-sm font-medium">
                  {isSaving ? "Saving..." : "Save"}
                </span>
              )}
            </Button>
            {!isMobile && <Separator orientation="vertical" />}
          </div>
          <div
            className={`flex items-center ${
              isMobile ? "space-x-1" : "space-x-2"
            }`}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={onPrevious}
              disabled={isFirst || isLoading}
              className={`h-10 ${isMobile ? "w-8 p-0" : "w-10 p-0"}`}
            >
              <IconChevronLeft
                className={`${isMobile ? "h-4 w-4" : "h-5 w-5"}`}
              />
            </Button>

            <DropdownMenu modal={true} onOpenChange={setIsDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-10 ${
                    isMobile ? "px-2" : "px-3"
                  } flex items-center space-x-2`}
                  disabled={isLoading}
                >
                  <span
                    className={`${
                      isMobile ? "text-xs" : "text-sm"
                    } font-medium`}
                  >
                    {currentIndex + 1} / {totalQuestions}
                  </span>
                  <IconChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className={`${
                  isMobile ? "w-[320px] max-h-[400px]" : "w-160 max-h-[600px]"
                } overflow-hidden scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent`}
              >
                <div className="sticky top-0 z-30 bg-popover border-b border-border/50 p-3 space-y-3">
                  <DropdownMenuLabel className="px-0 py-0">
                    Jump to Question
                  </DropdownMenuLabel>

                  {/* Search input */}
                  <div className="relative">
                    <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search questions..."
                      className="pl-9 h-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <IconX className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  {/* Role filter */}
                  {/* {!isPublic && availableRoles.length > 0 && (
                    <div className="space-y-2">
                      <Select
                        value={
                          selectedRoles.length === 1
                            ? selectedRoles[0]
                            : "all-roles"
                        }
                        onValueChange={(value) => {
                          if (value === "all-roles") {
                            setSelectedRoles([]);
                          } else {
                            setSelectedRoles([value]);
                          }
                        }}
                      >
                        <SelectTrigger className="w-full h-8">
                          <div className="flex items-center gap-2">
                            <IconFilter className="h-3 w-3" />
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

                      {(selectedRoles.length > 0 || searchQuery) && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {selectedRoles.length > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {selectedRoles.length} role(s)
                              </Badge>
                            )}
                            {searchQuery && (
                              <Badge variant="secondary" className="text-xs">
                                "{searchQuery}"
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearAllFilters}
                            className="h-6 px-2 text-xs"
                          >
                            <IconX className="h-3 w-3 mr-1" />
                            Clear all
                          </Button>
                        </div>
                      )}
                    </div>
                  )} */}
                </div>
                <div className="overflow-y-auto max-h-80 scroll-pt-10">
                  {filteredSections.map((section, sectionIndex) => {
                    const sectionProgress = getSectionProgress(section);
                    const isFullyAnswered =
                      sectionProgress.answered === sectionProgress.total;

                    return (
                      <div key={section.id || sectionIndex} className="mb-2">
                        <DropdownMenuLabel className="sticky top-0 z-20 bg-popover border-b border-border/50 text-sm font-medium text-foreground py-2 flex items-center justify-between">
                          <span>
                            {section.order_index}. {section.title}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">
                              {sectionProgress.answered}/{sectionProgress.total}
                            </span>
                            {isFullyAnswered ? (
                              <IconCircleCheckFilled className="h-4 w-4 text-green-600" />
                            ) : (
                              <IconCircle className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </DropdownMenuLabel>
                        {section.steps.map((step, stepIndex) => {
                          const stepProgress = getStepProgress(step);
                          const isStepFullyAnswered =
                            stepProgress.answered === stepProgress.total;

                          return (
                            <div key={step.id || stepIndex} className="mb-0">
                              {step.title !== section.title && (
                                <DropdownMenuLabel className="sticky top-0 z-15 bg-popover backdrop-blur-sm border-b border-border/30 text-sm font-medium text-muted-foreground flex items-center justify-between py-1 ml-4">
                                  <span>
                                    {section.order_index}.{step.order_index}{" "}
                                    {step.title}
                                  </span>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm text-muted-foreground">
                                      {stepProgress.answered}/
                                      {stepProgress.total}
                                    </span>
                                    {isStepFullyAnswered ? (
                                      <IconCircleCheckFilled className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <IconCircle className="h-4 w-4 text-muted-foreground" />
                                    )}
                                  </div>
                                </DropdownMenuLabel>
                              )}
                              {step.questions.map((stepQuestion) => {
                                const questionResponse =
                                  responses[stepQuestion.id];
                                const isAnswered =
                                  (questionResponse &&
                                    questionResponse.rating_score != null &&
                                    questionResponse.has_roles) ||
                                  questionResponse.is_unknown;
                                const currentQuestion =
                                  allQuestions[currentIndex];
                                const isCurrent =
                                  currentQuestion?.id === stepQuestion.id;

                                return (
                                  <DropdownMenuItem
                                    key={stepQuestion.id}
                                    onClick={() =>
                                      goToQuestion(stepQuestion.id)
                                    }
                                    className={cn(
                                      "flex items-center justify-between text-sm transition-colors duration-200 cursor-pointer hover:bg-accent ml-8",
                                      isCurrent && "bg-accent"
                                    )}
                                  >
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium truncate">
                                        {section.order_index}.{step.order_index}
                                        .{stepQuestion.order_index}{" "}
                                        {stepQuestion.title}
                                      </div>
                                    </div>
                                    <div className="flex-shrink-0">
                                      {isAnswered ? (
                                        <IconCircleCheckFilled className="h-4 w-4 text-green-600" />
                                      ) : (
                                        <IconCircle className="h-4 w-4 text-muted-foreground" />
                                      )}
                                    </div>
                                  </DropdownMenuItem>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              onClick={() => {
                if (isLast && onComplete) {
                  onComplete();
                } else {
                  onNext();
                }
              }}
              disabled={(isLast && !onComplete) || isLoading}
              className={`h-10 ${isMobile ? "w-8 p-0" : "w-10 p-0"}`}
            >
              <IconChevronRight
                className={`${isMobile ? "h-4 w-4" : "h-5 w-5"}`}
              />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
