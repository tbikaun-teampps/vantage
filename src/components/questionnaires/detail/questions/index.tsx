import { useState, useMemo, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, AlertTriangle } from "lucide-react";
import { useQuestionActions } from "@/hooks/questionnaire/useQuestions";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Loader } from "@/components/loader";
import { useQuestionnaireDetail } from "@/contexts/QuestionnaireDetailContext";
import { QuestionEditor } from "./question-editor";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { QuestionnaireTree } from "./questionnaire-tree";
import type {
  QuestionnaireQuestions,
  QuestionnaireSections,
  QuestionnaireSteps,
} from "@/types/api/questionnaire";

export function Questions() {
  const { updateQuestion } = useQuestionActions();

  const { questionnaire, sections, isLoading, isProcessing } =
    useQuestionnaireDetail();

  const [selectedItem, setSelectedItem] = useState<{
    type: "section" | "step" | "question";
    id: number;
  } | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<
    QuestionnaireQuestions[number] | null
  >(null);

  // Helper functions wrapped in useCallback to prevent recreation on every render
  const getAllQuestionsFromSection = useCallback(
    (section: QuestionnaireSections[number]) => {
      return section.steps.flatMap((step) => step.questions);
    },
    []
  );

  const getAllQuestionsFromStep = useCallback(
    (step: QuestionnaireSteps[number]) => {
      return step.questions;
    },
    []
  );

  // Memoize selected questions to avoid repeated iterations through sections
  const selectedQuestions = useMemo((): QuestionnaireQuestions[number][] => {
    if (!selectedItem) return [];

    if (selectedItem.type === "question") {
      for (const section of sections) {
        for (const step of section.steps) {
          const question = step.questions.find((q) => q.id === selectedItem.id);
          if (question) return [question];
        }
      }
      return [];
    }

    if (selectedItem.type === "step") {
      for (const section of sections) {
        const step = section.steps.find((s) => s.id === selectedItem.id);
        if (step) return getAllQuestionsFromStep(step);
      }
      return [];
    }

    if (selectedItem.type === "section") {
      const section = sections.find((s) => s.id === selectedItem.id);
      if (section) return getAllQuestionsFromSection(section);
      return [];
    }

    return [];
  }, [
    selectedItem,
    sections,
    getAllQuestionsFromStep,
    getAllQuestionsFromSection,
  ]);

  // Helper function to get question numbering for display
  const getQuestionDisplayNumber = useCallback(
    (questionId: number): string => {
      for (
        let sectionIndex = 0;
        sectionIndex < sections.length;
        sectionIndex++
      ) {
        const section = sections[sectionIndex];
        for (let stepIndex = 0; stepIndex < section.steps.length; stepIndex++) {
          const step = section.steps[stepIndex];
          for (
            let questionIndex = 0;
            questionIndex < step.questions.length;
            questionIndex++
          ) {
            const question = step.questions[questionIndex];
            if (question.id === questionId) {
              return `${sectionIndex + 1}.${stepIndex + 1}.${questionIndex + 1}`;
            }
          }
        }
      }
      return questionId.toString(); // fallback to ID if not found
    },
    [sections]
  );

  if (!questionnaire) {
    return null;
  }

  const hasRatingScales =
    questionnaire.questionnaire_rating_scales &&
    questionnaire.questionnaire_rating_scales.length > 0;

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <div className="relative space-y-6 h-full flex flex-col max-w-[2000px] mx-auto">
        {/* Overlay when no rating scales exist */}
        {!hasRatingScales && (
          <div className="absolute inset-0 z-50 backdrop-blur-xs flex items-center justify-center">
            <Alert className="max-w-md">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="space-y-4">
                <p className="font-medium">
                  Rating scales must be added before creating questions
                </p>
                <p className="text-sm">
                  Switch to the{" "}
                  <span className="font-semibold">Rating Scales</span> tab to
                  add rating scales first. Rating scales define how questions
                  will be scored during interviews.
                </p>
              </AlertDescription>
            </Alert>
          </div>
        )}

        <ResizablePanelGroup
          className="flex h-full min-h-0 flex-1"
          direction="horizontal"
        >
          {/* Left side - Structure Tree */}
          <ResizablePanel
            className="flex flex-col space-y-6 min-h-0 px-4"
            defaultSize={60}
          >
            <QuestionnaireTree
              selectedItem={selectedItem}
              editingQuestion={editingQuestion}
              setSelectedItem={setSelectedItem}
              setEditingQuestion={setEditingQuestion}
            />
          </ResizablePanel>

          <ResizableHandle />

          {/* Right side - Question Details */}
          <ResizablePanel className="flex flex-col space-y-6 flex-1 min-h-0  px-4">
            <div className="flex flex-col">
              <h3 className="text-xl font-semibold">Details</h3>
              <p className="text-sm text-muted-foreground">
                {editingQuestion
                  ? `Editing Question ${getQuestionDisplayNumber(
                      editingQuestion.id
                    )}`
                  : selectedItem
                    ? `Viewing ${selectedQuestions.length} question${
                        selectedQuestions.length !== 1 ? "s" : ""
                      } for selected ${selectedItem.type}`
                    : "Select a section, step, or question to view details"}
              </p>
            </div>

            {selectedQuestions.length > 0 ? (
              <ScrollArea className="flex-1 min-h-0">
                <div className="space-y-6">
                  {selectedQuestions.map((question) => (
                    <QuestionEditor
                      key={question.id}
                      question={question}
                      questionnaire={questionnaire}
                      isProcessing={isProcessing}
                      updateQuestion={updateQuestion}
                      questionDisplayNumber={getQuestionDisplayNumber(
                        question.id
                      )}
                    />
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <Eye className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Select a section, step, or question to view details</p>
                </div>
              </div>
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </>
  );
}
