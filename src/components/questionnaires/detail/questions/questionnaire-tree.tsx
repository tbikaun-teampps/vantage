import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Edit,
  Trash2,
  Copy,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  MoreVertical,
} from "lucide-react";
import { IconTemplate, IconCheck } from "@tabler/icons-react";
import { IconLoader2 } from "@tabler/icons-react";
import {
  useSectionActions,
  useStepActions,
  useQuestionActions,
} from "@/hooks/questionnaire/useQuestions";
import type {
  SectionWithSteps,
  QuestionWithRatingScales,
} from "@/types/assessment";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { AddDialog } from "./add-dialog";
import { DeleteDialog } from "./delete-dialog";
import { EditSectionDialog } from "./edit-section-dialog";
import { EditStepDialog } from "./edit-step-dialog";
import { useCanAdmin } from "@/hooks/useUserCompanyRole";
import { useQuestionnaireDetail } from "@/contexts/QuestionnaireDetailContext";
import { AddSectionDialog } from "./add-section-dialog";
import { QuestionnaireTemplateDialog } from "../questionnaire-template-dialog";

interface QuestionnaireTreeProps {
  selectedItem: {
    type: "section" | "step" | "question";
    id: number;
  } | null;
  editingQuestion: QuestionWithRatingScales | null;
  setSelectedItem: (
    item: {
      type: "section" | "step" | "question";
      id: number;
    } | null
  ) => void;
  setEditingQuestion: (question: QuestionWithRatingScales | null) => void;
}

export function QuestionnaireTree({
  selectedItem,
  editingQuestion,
  setSelectedItem,
  setEditingQuestion,
}: QuestionnaireTreeProps) {
  const userCanAdmin = useCanAdmin();
  const { createSection, updateSection, deleteSection } = useSectionActions();
  const { createStep, updateStep, deleteStep } = useStepActions();
  const { createQuestion, deleteQuestion, duplicateQuestion } =
    useQuestionActions();

  const {
    questionnaire,
    sections,
    isLoading,
    isProcessing,
    getQuestionsStatus,
    questionCount,
  } = useQuestionnaireDetail();

  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(
    new Set(
      sections.length > 0
        ? [sections[0].id, sections[0].steps[0]?.id].filter(Boolean)
        : []
    )
  );

  const [showAddSectionDialog, setShowAddSectionDialog] =
    useState<boolean>(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState<boolean>(false);
  const [editingSection, setEditingSection] = useState<SectionWithSteps | null>(
    null
  );
  const [editingStep, setEditingStep] = useState<any | null>(null);
  const [showAddDialog, setShowAddDialog] = useState<{
    type: "section" | "step" | "question";
    parentId?: number;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "section" | "step" | "question";
    id: number;
    title: string;
  } | null>(null);
  const [duplicatingQuestionId, setDuplicatingQuestionId] = useState<
    number | null
  >(null);

  if (!questionnaire) {
    return null;
  }

  const hasRatingScales =
    questionnaire.questionnaire_rating_scales &&
    questionnaire.questionnaire_rating_scales.length > 0;

  const toggleExpanded = (nodeId: number) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const handleAddItem = async (data: {
    title: string;
    question_text?: string;
    context?: string;
  }) => {
    if (!data.title.trim() || !showAddDialog) return;
    if (showAddDialog.type === "section") {
      await createSection({
        questionnaireId: questionnaire.id,
        title: data.title,
      });
    } else if (showAddDialog.type === "step" && showAddDialog.parentId) {
      await createStep({
        sectionId: showAddDialog.parentId,
        title: data.title,
      });
    } else if (showAddDialog.type === "question" && showAddDialog.parentId) {
      await createQuestion({
        questionnaireStepId: showAddDialog.parentId,
        title: data.title,
        question_text: data.question_text || "",
        context: data.context,
      });
    }
    setShowAddDialog(null);
  };

  const handleUpdateSection = async (sectionId: number, updates: any) => {
    await updateSection({ id: sectionId, updates });
    setEditingSection(null);
  };

  const handleUpdateStep = async (stepId: number, updates: any) => {
    await updateStep({ id: stepId, updates });
    setEditingStep(null);
  };

  const handleDeleteItem = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "section") {
      await deleteSection(deleteTarget.id);
    } else if (deleteTarget.type === "step") {
      await deleteStep(deleteTarget.id);
    } else if (deleteTarget.type === "question") {
      await deleteQuestion(deleteTarget.id);
    }
    setDeleteTarget(null);
    setSelectedItem(null);
  };

  const handleDuplicateQuestion = async (questionId: number) => {
    setDuplicatingQuestionId(questionId);
    try {
      await duplicateQuestion(questionId);
      toast.success("Question duplicated successfully");
    } finally {
      setDuplicatingQuestionId(null);
    }
  };

  const getQuestionValidation = (question: QuestionWithRatingScales) => {
    const hasTitle = question.title && question.title.trim() !== "";
    const hasQuestionText =
      question.question_text && question.question_text.trim() !== "";
    const hasRatingScales =
      question.question_rating_scales &&
      question.question_rating_scales.length > 0;
    const hasApplicableRoles =
      question.question_roles && question.question_roles.length > 0;

    const missingFields: string[] = [];
    const warnings: string[] = [];

    if (!hasTitle) missingFields.push("Title");
    if (!hasQuestionText) missingFields.push("Question text");
    if (!hasRatingScales) missingFields.push("Rating scales");
    if (!hasApplicableRoles)
      warnings.push("No specific roles selected - will apply to all roles");

    return {
      isValid: hasTitle && hasQuestionText && hasRatingScales,
      missingFields,
      warnings,
    };
  };

  const isQuestionIncomplete = (
    question: QuestionWithRatingScales
  ): boolean => {
    return !getQuestionValidation(question).isValid;
  };

  const getAllQuestionsFromSection = (
    section: SectionWithSteps
  ): QuestionWithRatingScales[] => {
    return section.steps.flatMap((step) => step.questions);
  };

  const handleItemClick = (
    type: "section" | "step" | "question",
    id: number,
    e?: React.MouseEvent
  ) => {
    e?.stopPropagation();
    setSelectedItem({ type, id });
    setEditingQuestion(null);
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            Questions
            {getQuestionsStatus() === "complete" ? (
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
              >
                <IconCheck className="h-3 w-3" />
                <span className="ml-1">{questionCount}</span>
              </Badge>
            ) : (
              <Badge variant="outline">
                <AlertTriangle className="h-3 w-3" />
                <span className="ml-1">{questionCount}</span>
              </Badge>
            )}
          </h2>
          <p className="text-sm text-muted-foreground">
            Configure the sections, steps, and questions for this questionnaire
          </p>
        </div>
        {userCanAdmin && (
          <div
            className="flex gap-2"
            data-tour="questionnaire-question-actions"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTemplateDialog(true)}
              disabled={true} //isProcessing}
            >
              <IconTemplate className="h-4 w-4 mr-2" />
              Import from Library
            </Button>
          </div>
        )}
      </div>
      {userCanAdmin && (
        <div className="flex items-center justify-between mb-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-full">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddSectionDialog(true)}
                  disabled={isProcessing || !hasRatingScales}
                  className="w-full border-dashed h-8"
                >
                  <Plus className="h-4 w-4" />
                  Add Section
                </Button>
              </div>
            </TooltipTrigger>
            {!hasRatingScales && (
              <TooltipContent>
                <p>Add rating scales first in the Rating Scales tab</p>
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      )}

      <ScrollArea className="flex-1 min-h-0">
        <div className="space-y-1">
          {sections.map((section, sectionIndex) => (
            <div key={section.id} className="select-none">
              {/* Section */}
              <div
                className={`flex items-center py-2.5 px-3 hover:bg-accent/50 rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedItem?.type === "section" &&
                  selectedItem.id === section.id
                    ? "bg-accent/80"
                    : ""
                }`}
                onClick={(e) => handleItemClick("section", section.id, e)}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 mr-2 hover:bg-accent/80"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpanded(section.id);
                  }}
                  disabled={isProcessing}
                >
                  {expandedNodes.has(section.id) ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </Button>

                <span className="text-sm font-medium mr-3 flex-shrink-0">
                  {sectionIndex + 1}. {section.title}
                </span>

                <Badge variant="secondary" className="text-xs mr-2">
                  {getAllQuestionsFromSection(section).length} questions
                </Badge>

                {userCanAdmin && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                        onClick={(e) => e.stopPropagation()}
                        disabled={isProcessing}
                      >
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setEditingSection(section)}
                        disabled={isProcessing}
                      >
                        <Edit className="h-3 w-3 mr-2" />
                        Edit Section
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          setDeleteTarget({
                            type: "section",
                            id: section.id,
                            title: section.title,
                          })
                        }
                        disabled={isProcessing}
                        className="text-red-600 dark:text-red-400"
                      >
                        <Trash2 className="h-3 w-3 mr-2" />
                        Delete Section
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Steps */}
              {expandedNodes.has(section.id) && (
                <div>
                  {section.steps.map((step, stepIndex) => (
                    <div key={step.id}>
                      <div
                        className={`flex items-center py-2.5 px-3 hover:bg-accent/50 rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedItem?.type === "step" &&
                          selectedItem.id === step.id
                            ? "bg-accent/80"
                            : ""
                        }`}
                        style={{ paddingLeft: "28px" }}
                        onClick={(e) => handleItemClick("step", step.id, e)}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 mr-2 hover:bg-accent/80"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpanded(step.id);
                          }}
                          disabled={isProcessing}
                        >
                          {expandedNodes.has(step.id) ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronRight className="h-3 w-3" />
                          )}
                        </Button>

                        <span className="text-sm font-medium mr-3 flex-shrink-0">
                          {sectionIndex + 1}.{stepIndex + 1}
                        </span>

                        <span className="text-sm font-medium flex-1 min-w-0 truncate">
                          {step.title}
                        </span>

                        <Badge variant="secondary" className="text-xs mr-2">
                          {step.questions.length} questions
                        </Badge>

                        {userCanAdmin && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                                onClick={(e) => e.stopPropagation()}
                                disabled={isProcessing}
                              >
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => setEditingStep(step)}
                                disabled={isProcessing}
                              >
                                <Edit className="h-3 w-3 mr-2" />
                                Edit Step
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  setDeleteTarget({
                                    type: "step",
                                    id: step.id,
                                    title: step.title,
                                  })
                                }
                                disabled={isProcessing}
                                className="text-red-600 dark:text-red-400"
                              >
                                <Trash2 className="h-3 w-3 mr-2" />
                                Delete Step
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>

                      {/* Questions */}
                      {expandedNodes.has(step.id) && (
                        <div>
                          {step.questions.map((question, questionIndex) => (
                            <div
                              key={question.id}
                              className={`flex items-center py-2.5 px-3 hover:bg-accent/50 rounded-lg cursor-pointer transition-all duration-200 ${
                                selectedItem?.type === "question" &&
                                selectedItem.id === question.id
                                  ? "bg-accent/80"
                                  : ""
                              } ${
                                isQuestionIncomplete(question)
                                  ? "border-2 border-dashed border-yellow-400 dark:border-yellow-800 hover:bg-yellow-200 dark:hover:bg-yellow-900/50"
                                  : ""
                              }`}
                              style={{ paddingLeft: "44px" }}
                              onClick={(e) =>
                                handleItemClick("question", question.id, e)
                              }
                            >
                              <span className="text-sm font-medium mr-3 flex-shrink-0">
                                {sectionIndex + 1}.{stepIndex + 1}.
                                {questionIndex + 1}
                              </span>

                              <div className="flex items-center flex-1 min-w-0 truncate mr-3">
                                <span className="text-sm font-medium min-w-0 truncate">
                                  {question.title}
                                </span>
                                {isQuestionIncomplete(question) && (
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <AlertTriangle className="h-3 w-3 ml-2 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <div className="space-y-2">
                                        {getQuestionValidation(question)
                                          .missingFields.length > 0 && (
                                          <div>
                                            <p className="font-medium text-red-600 dark:text-black">
                                              Missing required fields:
                                            </p>
                                            <ul className="text-xs space-y-0.5 dark:text-black">
                                              {getQuestionValidation(
                                                question
                                              ).missingFields.map((field) => (
                                                <li key={field}>• {field}</li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                        {getQuestionValidation(question)
                                          .warnings.length > 0 && (
                                          <div>
                                            <p className="font-medium text-yellow-600 dark:text-black">
                                              Note:
                                            </p>
                                            <ul className="text-xs space-y-0.5 dark:text-black">
                                              {getQuestionValidation(
                                                question
                                              ).warnings.map((warning) => (
                                                <li key={warning}>
                                                  • {warning}
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </div>

                              {userCanAdmin && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground ml-auto"
                                      onClick={(e) => e.stopPropagation()}
                                      disabled={isProcessing}
                                    >
                                      <MoreVertical className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleDuplicateQuestion(question.id)
                                      }
                                      disabled={
                                        isProcessing ||
                                        duplicatingQuestionId === question.id
                                      }
                                    >
                                      {duplicatingQuestionId === question.id ? (
                                        <IconLoader2 className="h-3 w-3 mr-2 animate-spin" />
                                      ) : (
                                        <Copy className="h-3 w-3 mr-2" />
                                      )}
                                      Duplicate Question
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        setDeleteTarget({
                                          type: "question",
                                          id: question.id,
                                          title: question.title,
                                        })
                                      }
                                      disabled={isProcessing}
                                      className="text-red-600 dark:text-red-400"
                                    >
                                      <Trash2 className="h-3 w-3 mr-2" />
                                      Delete Question
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          ))}

                          {userCanAdmin && (
                            <div
                              style={{ paddingLeft: "44px" }}
                              className="py-1"
                            >
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="w-full border-dashed h-8"
                                      onClick={() =>
                                        setShowAddDialog({
                                          type: "question",
                                          parentId: step.id,
                                        })
                                      }
                                      disabled={
                                        isProcessing || !hasRatingScales
                                      }
                                    >
                                      <Plus className="h-3 w-3 mr-2" />
                                      Add Question
                                    </Button>
                                  </div>
                                </TooltipTrigger>
                                {!hasRatingScales && (
                                  <TooltipContent>
                                    <p>
                                      Add rating scales first in the Rating
                                      Scales tab
                                    </p>
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {userCanAdmin && (
                    <div style={{ paddingLeft: "28px" }} className="py-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full border-dashed h-8"
                              onClick={() =>
                                setShowAddDialog({
                                  type: "step",
                                  parentId: section.id,
                                })
                              }
                              disabled={isProcessing || !hasRatingScales}
                            >
                              <Plus className="h-3 w-3 mr-2" />
                              Add Step
                            </Button>
                          </div>
                        </TooltipTrigger>
                        {!hasRatingScales && (
                          <TooltipContent>
                            <p>
                              Add rating scales first in the Rating Scales tab
                            </p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {sections.length === 0 && userCanAdmin && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="mb-4">No sections created yet</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      variant="outline"
                      onClick={() => setShowAddDialog({ type: "section" })}
                      disabled={isProcessing || !hasRatingScales}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Section
                    </Button>
                  </div>
                </TooltipTrigger>
                {!hasRatingScales && (
                  <TooltipContent>
                    <p>Add rating scales first in the Rating Scales tab</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
          )}
        </div>
      </ScrollArea>
      <EditSectionDialog
        open={!!editingSection}
        onOpenChange={() => setEditingSection(null)}
        section={editingSection}
        onSectionChange={setEditingSection}
        isProcessing={isProcessing}
        onSave={handleUpdateSection}
      />

      <EditStepDialog
        open={!!editingStep}
        onOpenChange={() => setEditingStep(null)}
        step={editingStep}
        onStepChange={setEditingStep}
        isProcessing={isProcessing}
        onSave={handleUpdateStep}
      />

      <AddSectionDialog
        open={showAddSectionDialog}
        onOpenChange={setShowAddSectionDialog}
        questionnaireId={questionnaire.id}
      />

      <AddDialog
        open={!!showAddDialog}
        onOpenChange={() => setShowAddDialog(null)}
        type={showAddDialog?.type}
        isProcessing={isProcessing}
        onAdd={handleAddItem}
      />

      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        type={deleteTarget?.type}
        title={deleteTarget?.title}
        isProcessing={isProcessing}
        handleDeleteItem={handleDeleteItem}
      />

      <QuestionnaireTemplateDialog
        open={showTemplateDialog}
        onOpenChange={setShowTemplateDialog}
        questionnaireId={questionnaire.id}
      />
    </>
  );
}
