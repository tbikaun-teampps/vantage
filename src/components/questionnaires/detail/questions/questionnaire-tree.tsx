import { useState } from "react";
import type { UniqueIdentifier } from "@dnd-kit/core";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, AlertTriangle } from "lucide-react";
import { IconTemplate, IconCheck } from "@tabler/icons-react";
import {
  useSectionActions,
  useStepActions,
  useQuestionActions,
} from "@/hooks/questionnaire/useQuestions";
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
import { SortableTree } from "./sortable-tree";
import type {
  QuestionnaireQuestions,
  QuestionnaireSections,
  QuestionnaireSteps,
  UpdateQuestionnaireSectionBodyData,
  UpdateQuestionnaireStepBodyData,
} from "@/types/api/questionnaire";

interface QuestionnaireTreeProps {
  selectedItem: {
    type: "section" | "step" | "question";
    id: number;
  } | null;
  editingQuestion: QuestionnaireQuestions[number] | null;
  setSelectedItem: (
    item: {
      type: "section" | "step" | "question";
      id: number;
    } | null
  ) => void;
  setEditingQuestion: (question: QuestionnaireQuestions[number] | null) => void;
}

export function QuestionnaireTree({
  selectedItem,
  setSelectedItem,
  setEditingQuestion,
}: QuestionnaireTreeProps) {
  const userCanAdmin = useCanAdmin();
  const { createSection, updateSection, deleteSection } = useSectionActions();
  const { createStep, updateStep, deleteStep } = useStepActions();
  const { createQuestion, deleteQuestion } = useQuestionActions();

  const {
    questionnaire,
    sections,
    isProcessing,
    getQuestionsStatus,
    questionCount,
  } = useQuestionnaireDetail();

  // Use UniqueIdentifier format for expandedNodes to match SortableTree expectations
  const [expandedNodes, setExpandedNodes] = useState<Set<UniqueIdentifier>>(
    () =>
      new Set(
        sections.length > 0
          ? ([
              `section_${sections[0].id}`,
              sections[0].steps[0]?.id
                ? `step_${sections[0].steps[0].id}`
                : null,
            ].filter(Boolean) as UniqueIdentifier[])
          : []
      )
  );

  const [showAddSectionDialog, setShowAddSectionDialog] =
    useState<boolean>(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState<boolean>(false);
  const [editingSection, setEditingSection] = useState<
    QuestionnaireSections[number] | null
  >(null);
  const [editingStep, setEditingStep] = useState<
    QuestionnaireSteps[number] | null
  >(null);
  const [showAddDialog, setShowAddDialog] = useState<{
    type: "section" | "step" | "question";
    parentId?: number;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "section" | "step" | "question";
    id: number;
    title: string;
  } | null>(null);

  if (!questionnaire) {
    return null;
  }

  const hasRatingScales =
    questionnaire.questionnaire_rating_scales &&
    questionnaire.questionnaire_rating_scales.length > 0;

  const toggleExpanded = (nodeId: UniqueIdentifier) => {
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
    try {
      if (showAddDialog.type === "section") {
        await createSection({
          questionnaireId: questionnaire.id,
          title: data.title,
        });
        toast.success("Section created");
      } else if (showAddDialog.type === "step" && showAddDialog.parentId) {
        await createStep({
          questionnaire_section_id: showAddDialog.parentId,
          title: data.title,
        });
        // Auto-expand the parent section
        setExpandedNodes((prev) => new Set(prev).add(`section_${showAddDialog.parentId}`));
        toast.success("Step created");
      } else if (showAddDialog.type === "question" && showAddDialog.parentId) {
        await createQuestion({
          questionnaire_step_id: showAddDialog.parentId,
          title: data.title,
          question_text: data.question_text || "",
          context: data.context,
        });
        // Auto-expand the parent step
        setExpandedNodes((prev) => new Set(prev).add(`step_${showAddDialog.parentId}`));
        toast.success("Question created");
      }
      setShowAddDialog(null);
    } catch {
      toast.error(`Failed to create ${showAddDialog.type}`);
    }
  };

  const handleUpdateSection = async (
    sectionId: number,
    updates: UpdateQuestionnaireSectionBodyData
  ) => {
    try {
      await updateSection({ id: sectionId, updates });
      toast.success("Section updated");
      setEditingSection(null);
    } catch {
      toast.error("Failed to update section");
    }
  };

  const handleUpdateStep = async (
    stepId: number,
    updates: UpdateQuestionnaireStepBodyData
  ) => {
    try {
      await updateStep({ id: stepId, updates });
      toast.success("Step updated");
      setEditingStep(null);
    } catch {
      toast.error("Failed to update step");
    }
  };

  const handleDeleteItem = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === "section") {
        await deleteSection(deleteTarget.id);
      } else if (deleteTarget.type === "step") {
        await deleteStep(deleteTarget.id);
      } else if (deleteTarget.type === "question") {
        await deleteQuestion(deleteTarget.id);
      }
      toast.success(`${deleteTarget.type.charAt(0).toUpperCase() + deleteTarget.type.slice(1)} deleted`);
      setDeleteTarget(null);
      setSelectedItem(null);
    } catch {
      toast.error(`Failed to delete ${deleteTarget.type}`);
    }
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
      {/* {userCanAdmin && (
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
      )} */}

      <ScrollArea className="flex-1 min-h-0">
        {sections.length > 0 ? (
          <SortableTree
            questionnaireId={questionnaire.id}
            sections={sections}
            expandedItems={expandedNodes}
            onToggleCollapsed={toggleExpanded}
            onSelectItem={(item) => {
              if (item) {
                setSelectedItem(item);
                setEditingQuestion(null);
              } else {
                setSelectedItem(null);
              }
            }}
            selectedItem={selectedItem}
            showAddPlaceholders={userCanAdmin && hasRatingScales}
            onAddItem={(type, parentId) => {
              if (type === "section") {
                setShowAddSectionDialog(true);
              } else {
                setShowAddDialog({ type, parentId });
              }
            }}
            showActions={userCanAdmin}
            onEditItem={(type, id) => {
              if (type === "section") {
                const section = sections.find((s) => s.id === id);
                if (section) setEditingSection(section);
              } else if (type === "step") {
                // Find step across all sections
                for (const section of sections) {
                  const step = section.steps.find((s) => s.id === id);
                  if (step) {
                    setEditingStep(step);
                    break;
                  }
                }
              }
            }}
            onDeleteItem={(type, id, title) => {
              setDeleteTarget({ type, id, title });
            }}
          />
        ) : (
          userCanAdmin && (
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
          )
        )}
      </ScrollArea>
      <EditSectionDialog
        open={!!editingSection}
        onOpenChange={() => setEditingSection(null)}
        section={editingSection}
        isProcessing={isProcessing}
        onSave={handleUpdateSection}
      />

      <EditStepDialog
        open={!!editingStep}
        onOpenChange={() => setEditingStep(null)}
        step={editingStep}
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
