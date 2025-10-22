import type { ProgramWithRelations } from "@/types/program";

// Utility function to validate if a program has an onsite questionnaire
export function isProgramOnsiteQuestionnaireValid(
  program: ProgramWithRelations
): boolean {
  return !!program.onsite_questionnaire_id;
}

// Utility function to validate if a program has a presite questionnaire
export function isProgramPresiteQuestionnaireValid(
  program: ProgramWithRelations
): boolean {
  return !!program.presite_questionnaire_id;
}

// Unified program validation hook - extensible for future validation needs
export function useProgramValidation(program: ProgramWithRelations | null) {
  if (!program) {
    return {
      // Questionnaire validations
      onsiteQuestionnaire: {
        isValid: false,
        reason: null,
      },
      presiteQuestionnaire: {
        isValid: false,
        reason: null,
      },
      // Overall assessment capabilities
      canCreateOnsiteAssessments: false,
      canCreatePresiteInterviews: false,
    };
  }

  // Individual validations
  const onsiteQuestionnaireValid = isProgramOnsiteQuestionnaireValid(program);
  const presiteQuestionnaireValid = isProgramPresiteQuestionnaireValid(program);

  return {
    // Questionnaire validations
    onsiteQuestionnaire: {
      isValid: onsiteQuestionnaireValid,
      reason: !onsiteQuestionnaireValid
        ? "Program must have an onsite questionnaire linked before onsite assessments can be created."
        : null,
    },
    presiteQuestionnaire: {
      isValid: presiteQuestionnaireValid,
      reason: !presiteQuestionnaireValid
        ? "Program must have a presite questionnaire linked before presite interviews can be created."
        : null,
    },
    // Overall capabilities (can be extended with additional logic)
    canCreateOnsiteAssessments: onsiteQuestionnaireValid,
    canCreatePresiteInterviews: presiteQuestionnaireValid,
  };
}