import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getQuestionnaireById } from "@/lib/api/questionnaires";
import type {
  QuestionnaireWithStructure,
  SectionWithSteps,
  StepWithQuestions,
  QuestionnaireStep,
  QuestionnaireQuestion,
  UpdateQuestionnaireSectionData,
} from "@/types/assessment";
import {
  createSection,
  updateSection,
  deleteSection,
  createStep,
  updateStep,
  deleteStep,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  duplicateQuestion,
  addQuestionRatingScale,
  updateQuestionRatingScale,
  deleteQuestionRatingScale,
  addAllQuestionnaireRatingScales,
  updateQuestionRoles,
} from "@/lib/api/questionnaires";

// Query key factory for questions/structure data
export const questionsKeys = {
  all: ["questionnaire", "questions"] as const,
  structure: (id: number) => [...questionsKeys.all, "structure", id] as const,
};

// Hook for full questionnaire structure (sections, steps, questions) with lazy loading
function useQuestionnaireStructure(
  questionnaireId: number,
  enabled = true
) {
  return useQuery({
    queryKey: questionsKeys.structure(questionnaireId),
    queryFn: (): Promise<QuestionnaireWithStructure> =>
      getQuestionnaireById(questionnaireId),
    staleTime: 5 * 60 * 1000, // 5 minutes - structure data changes more frequently
    enabled: enabled && !!questionnaireId,
  });
}

// Helper functions to calculate question statistics
function getQuestionCount(sections: SectionWithSteps[] = []): number {
  let count = 0;
  sections.forEach((section: SectionWithSteps) => {
    if (section.steps) {
      section.steps.forEach((step: StepWithQuestions) => {
        if (step.questions) {
          count += step.questions.length;
        }
      });
    }
  });
  return count;
}

function hasQuestions(sections: SectionWithSteps[] = []): boolean {
  return sections.some((section: SectionWithSteps) =>
    section.steps.some(
      (step: StepWithQuestions) => step.questions && step.questions.length > 0
    )
  );
}

// Hook specifically for the questions tab with lazy loading
export function useQuestionsTab(questionnaireId: number, isActive = false) {
  const {
    data: questionnaire,
    isLoading,
    error,
    refetch,
  } = useQuestionnaireStructure(questionnaireId, isActive);

  const sections = questionnaire?.sections || [];
  const questionCount = getQuestionCount(sections);
  const isComplete = hasQuestions(sections);

  return {
    questionnaire,
    sections,
    isLoading,
    error,
    refetch,
    questionCount,
    isComplete,
    // Status getter function for compatibility
    getQuestionsStatus: () => (isComplete ? "complete" : "incomplete"),
    getQuestionCount: () => questionCount,
  };
}

// Section operations
export function useSectionActions() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: ({
      questionnaireId,
      title,
    }: {
      questionnaireId: number;
      title: string;
    }) => {
      return createSection({
        questionnaire_id: questionnaireId,
        title,
      });
    },
    onSuccess: (newSection, { questionnaireId }) => {
      // Update questionnaire structure with new section
      queryClient.setQueryData(
        questionsKeys.structure(questionnaireId),
        (old: QuestionnaireWithStructure | null) => {
          if (!old || old.id !== questionnaireId) return old;
          return {
            ...old,
            sections: [...old.sections, { ...newSection, steps: [] }],
          };
        }
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: number;
      updates: UpdateQuestionnaireSectionData;
    }) => updateSection(id, updates),
    onSuccess: (_, { id, updates }) => {
      // Update questionnaire structure with updated section
      queryClient.setQueriesData(
        { queryKey: questionsKeys.all },
        (old: QuestionnaireWithStructure | null) => {
          if (!old) return null;
          return {
            ...old,
            sections: old.sections.map((s) =>
              s.id === id ? { ...s, ...updates } : s
            ),
          };
        }
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteSection(id),
    onSuccess: (_, id) => {
      // Remove section from questionnaire structure
      queryClient.setQueriesData(
        { queryKey: questionsKeys.all },
        (old: QuestionnaireWithStructure | null) => {
          if (!old) return null;
          return {
            ...old,
            sections: old.sections.filter((s) => s.id !== id),
          };
        }
      );
    },
  });

  return {
    createSection: createMutation.mutateAsync,
    isCreatingSection: createMutation.isPending,
    createSectionError: createMutation.error,

    updateSection: updateMutation.mutateAsync,
    isUpdatingSection: updateMutation.isPending,
    updateSectionError: updateMutation.error,

    deleteSection: deleteMutation.mutateAsync,
    isDeletingSection: deleteMutation.isPending,
    deleteSectionError: deleteMutation.error,
  };
}

// Step operations
export function useStepActions() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: ({
      sectionId,
      title,
    }: {
      sectionId: number;
      title: string;
    }) => {
      return createStep({
        questionnaire_section_id: sectionId,
        title,
      });
    },
    onSuccess: (newStep, { sectionId }) => {
      // Update questionnaire structure with new step
      queryClient.setQueriesData(
        { queryKey: questionsKeys.all },
        (old: QuestionnaireWithStructure | null) => {
          if (!old) return null;
          return {
            ...old,
            sections: old.sections.map((section) =>
              section.id === sectionId
                ? {
                    ...section,
                    steps: [...section.steps, { ...newStep, questions: [] }],
                  }
                : section
            ),
          };
        }
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: number;
      updates: Partial<QuestionnaireStep>;
    }) => updateStep(id, updates),
    onSuccess: (_, { id, updates }) => {
      queryClient.setQueriesData(
        { queryKey: questionsKeys.all },
        (old: QuestionnaireWithStructure | null) => {
          if (!old) return null;
          return {
            ...old,
            sections: old.sections.map((section) => ({
              ...section,
              steps: section.steps.map((step) =>
                step.id === id ? { ...step, ...updates } : step
              ),
            })),
          };
        }
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteStep(id),
    onSuccess: (_, id) => {
      queryClient.setQueriesData(
        { queryKey: questionsKeys.all },
        (old: QuestionnaireWithStructure | null) => {
          if (!old) return null;
          return {
            ...old,
            sections: old.sections.map((section) => ({
              ...section,
              steps: section.steps.filter((step) => step.id !== id),
            })),
          };
        }
      );
    },
  });

  return {
    createStep: createMutation.mutateAsync,
    isCreatingStep: createMutation.isPending,
    createStepError: createMutation.error,

    updateStep: updateMutation.mutateAsync,
    isUpdatingStep: updateMutation.isPending,
    updateStepError: updateMutation.error,

    deleteStep: deleteMutation.mutateAsync,
    isDeletingStep: deleteMutation.isPending,
    deleteStepError: deleteMutation.error,
  };
}

// Question operations
export function useQuestionActions() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: ({
      questionnaireStepId,
      title,
      question_text,
      context,
    }: {
      questionnaireStepId: number;
      title: string;
      question_text: string;
      context?: string;
    }) => {
      return createQuestion({
        questionnaire_step_id: questionnaireStepId,
        title,
        question_text,
        context,
      });
    },
    onSuccess: (newQuestion, { questionnaireStepId }) => {
      queryClient.setQueriesData(
        { queryKey: questionsKeys.all },
        (old: QuestionnaireWithStructure | null) => {
          if (!old) return null;
          return {
            ...old,
            sections: old.sections.map((section) => ({
              ...section,
              steps: section.steps.map((step) =>
                step.id === questionnaireStepId
                  ? {
                      ...step,
                      questions: [
                        ...step.questions,
                        {
                          ...newQuestion,
                          question_rating_scales: [],
                          question_roles: [],
                        },
                      ],
                    }
                  : step
              ),
            })),
          };
        }
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: number;
      updates: Partial<QuestionnaireQuestion>;
    }) => updateQuestion(id, updates),
    onSuccess: (_, { id, updates }) => {
      queryClient.setQueriesData(
        { queryKey: questionsKeys.all },
        (old: QuestionnaireWithStructure | null) => {
          if (!old) return null;
          return {
            ...old,
            sections: old.sections.map((section) => ({
              ...section,
              steps: section.steps.map((step) => ({
                ...step,
                questions: step.questions.map((question) =>
                  question.id === id ? { ...question, ...updates } : question
                ),
              })),
            })),
          };
        }
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteQuestion(id),
    onSuccess: (_, id) => {
      queryClient.setQueriesData(
        { queryKey: questionsKeys.all },
        (old: QuestionnaireWithStructure | null) => {
          if (!old) return null;
          return {
            ...old,
            sections: old.sections.map((section) => ({
              ...section,
              steps: section.steps.map((step) => ({
                ...step,
                questions: step.questions.filter(
                  (question) => question.id !== id
                ),
              })),
            })),
          };
        }
      );
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: number) => duplicateQuestion(id),
    onSuccess: (newQuestion) => {
      queryClient.setQueriesData(
        { queryKey: questionsKeys.all },
        (old: QuestionnaireWithStructure | null) => {
          if (!old) return null;
          return {
            ...old,
            sections: old.sections.map((section) => ({
              ...section,
              steps: section.steps.map((step) => {
                const hasOriginalQuestion = step.questions.some(
                  (q) => q.id === newQuestion.questionnaire_step_id
                );
                if (hasOriginalQuestion) {
                  return {
                    ...step,
                    questions: [...step.questions, newQuestion],
                  };
                }
                return step;
              }),
            })),
          };
        }
      );
    },
  });

  const addRatingScaleMutation = useMutation({
    mutationFn: (data: {
      questionId: number;
      questionnaire_rating_scale_id: number;
      description: string;
    }) => addQuestionRatingScale(data),
    onSuccess: () => {
      // Refresh the questionnaire data to get the updated rating scales
      queryClient.invalidateQueries({
        queryKey: questionsKeys.all,
      });
    },
  });

  const updateRatingScaleMutation = useMutation({
    mutationFn: (data: {
      questionId: number;
      questionRatingScaleId: number;
      description: string;
    }) => updateQuestionRatingScale(data),
    onSuccess: () => {
      // Refresh the questionnaire data to get the updated rating scales
      queryClient.invalidateQueries({
        queryKey: questionsKeys.all,
      });
    },
  });

  const addAllRatingScalesMutation = useMutation({
    mutationFn: (data: { questionnaireId: number; questionId: number }) =>
      addAllQuestionnaireRatingScales(data),
    onSuccess: () => {
      // Refresh the questionnaire data to get the updated rating scales
      queryClient.invalidateQueries({
        queryKey: questionsKeys.all,
      });
    },
  });

  const deleteRatingScaleMutation = useMutation({
    mutationFn: (data: { questionId: number; questionRatingScaleId: number }) =>
      deleteQuestionRatingScale(data),
    onSuccess: () => {
      // Refresh the questionnaire data to get the updated rating scales
      queryClient.invalidateQueries({
        queryKey: questionsKeys.all,
      });
    },
  });

  // const updateRatingScalesMutation = useMutation({
  //   mutationFn: async ({
  //     questionId,
  //     ratingScaleAssociations,
  //   }: {
  //     questionId: number;
  //     ratingScaleAssociations: Array<{
  //       ratingScaleId: number;
  //       description: string;
  //     }>;
  //   }) => {
  //     return updateQuestionRatingScales(questionId, ratingScaleAssociations);
  //   },
  //   onSuccess: (_, { questionId, ratingScaleAssociations }) => {
  //     queryClient.setQueriesData(
  //       { queryKey: questionsKeys.all },
  //       (old: QuestionnaireWithStructure | null) => {
  //         if (!old) return null;

  //         const updatedAssociations = ratingScaleAssociations.map(
  //           (association) => {
  //             const ratingScale = old.rating_scales.find(
  //               (scale) => scale.id === association.ratingScaleId
  //             );
  //             return {
  //               id: `temp-${Date.now()}-${Math.random()}`,
  //               created_at: new Date().toISOString(),
  //               updated_at: new Date().toISOString(),
  //               created_by: "",
  //               questionnaire_question_id: questionId,
  //               questionnaire_rating_scale_id: association.ratingScaleId,
  //               description: association.description,
  //               rating_scale: ratingScale!,
  //             };
  //           }
  //         );

  //         return {
  //           ...old,
  //           sections: old.sections.map((section) => ({
  //             ...section,
  //             steps: section.steps.map((step) => ({
  //               ...step,
  //               questions: step.questions.map((question) =>
  //                 question.id === questionId
  //                   ? {
  //                       ...question,
  //                       question_rating_scales: updatedAssociations,
  //                     }
  //                   : question
  //               ),
  //             })),
  //           })),
  //         };
  //       }
  //     );
  //   },
  // });

  const updateRolesMutation = useMutation({
    mutationFn: ({
      questionnaire_question_id,
      shared_role_ids,
    }: {
      questionnaire_question_id: number;
      shared_role_ids: number[];
    }) => updateQuestionRoles(questionnaire_question_id, shared_role_ids),
    onSuccess: (update, { questionnaire_question_id }) => {
      queryClient.setQueriesData(
        { queryKey: questionsKeys.all },
        (old: QuestionnaireWithStructure | null) => {
          if (!old) return null;

          return {
            ...old,
            sections: old.sections.map((section) => ({
              ...section,
              steps: section.steps.map((step) => ({
                ...step,
                questions: step.questions.map((question) =>
                  question.id === questionnaire_question_id
                    ? { ...question, question_roles: update }
                    : question
                ),
              })),
            })),
          };
        }
      );
    },
  });

  return {
    createQuestion: createMutation.mutateAsync,
    isCreatingQuestion: createMutation.isPending,
    createQuestionError: createMutation.error,

    updateQuestion: updateMutation.mutateAsync,
    isUpdatingQuestion: updateMutation.isPending,
    updateQuestionError: updateMutation.error,

    deleteQuestion: deleteMutation.mutateAsync,
    isDeletingQuestion: deleteMutation.isPending,
    deleteQuestionError: deleteMutation.error,

    duplicateQuestion: duplicateMutation.mutateAsync,
    isDuplicatingQuestion: duplicateMutation.isPending,
    duplicateQuestionError: duplicateMutation.error,

    addQuestionRatingScale: addRatingScaleMutation.mutateAsync,
    isAddingRatingScale: addRatingScaleMutation.isPending,
    addRatingScaleError: addRatingScaleMutation.error,

    updateQuestionRatingScale: updateRatingScaleMutation.mutateAsync,
    isUpdatingRatingScale: updateRatingScaleMutation.isPending,
    updateRatingScaleError: updateRatingScaleMutation.error,

    addAllQuestionnaireRatingScales: addAllRatingScalesMutation.mutateAsync,
    isAddingAllRatingScales: addAllRatingScalesMutation.isPending,
    addAllRatingScalesError: addAllRatingScalesMutation.error,

    deleteQuestionRatingScale: deleteRatingScaleMutation.mutateAsync,
    isDeletingRatingScale: deleteRatingScaleMutation.isPending,
    deleteRatingScaleError: deleteRatingScaleMutation.error,

    updateQuestionRoles: updateRolesMutation.mutateAsync,
    isUpdatingRoles: updateRolesMutation.isPending,
    updateRolesError: updateRolesMutation.error,
  };
}

// Export the helper functions for use in other components if needed
export { getQuestionCount, hasQuestions };
