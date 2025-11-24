import { InterviewQuestion } from "@/components/interview/detail/InterviewQuestion";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useInterviewStructure } from "@/hooks/interview/useInterviewStructure";
import { useInterviewQuestion } from "@/hooks/interview/useQuestion";
import { useSaveInterviewResponse } from "@/hooks/interview/useSaveResponse";
import { useCompleteInterview } from "@/hooks/interview/useCompleteInterview";
import { useMemo, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LoadingSpinner } from "@/components/loader";
import { UnauthorizedPage } from "@/pages/UnauthorizedPage";
import { IntroScreen } from "@/components/interview/detail/IntroScreen";
import type { CompleteInterviewBodyData } from "@/types/api/interviews";

interface InterviewDetailPageProps {
  isIndividualInterview?: boolean;
}

// Form schema for interview responses - dynamic based on question parts
const createResponseSchema = (questionParts?: Array<{
  id: number;
  answer_type: string;
  options: unknown;
}>) => {
  const baseSchema = z.object({
    rating_score: z.number().nullable().optional(),
    role_ids: z.array(z.number()).optional(),
    is_unknown: z.boolean().optional(),
  });

  // If no question parts, return base schema
  if (!questionParts || questionParts.length === 0) {
    return baseSchema;
  }

  // Build dynamic validation rules for question parts
  const questionPartSchema: Record<string, z.ZodTypeAny> = {};

  for (const part of questionParts) {
    const fieldName = `question_part_${part.id}`;

    if (part.answer_type === "scale" || part.answer_type === "number") {
      const options = part.options as { min: number; max: number };

      questionPartSchema[fieldName] = z
        .string()
        .optional()
        .refine(
          (val) => {
            if (!val) return true; // Optional fields are valid
            const num = parseFloat(val);
            return !isNaN(num) && num >= options.min && num <= options.max;
          },
          {
            message: `Value must be between ${options.min} and ${options.max}`,
          }
        );
    } else if (part.answer_type === "percentage") {
      questionPartSchema[fieldName] = z
        .string()
        .optional()
        .refine(
          (val) => {
            if (!val) return true;
            const num = parseFloat(val);
            return !isNaN(num) && num >= 0 && num <= 100;
          },
          {
            message: "Percentage must be between 0 and 100",
          }
        );
    } else {
      // For other types (labelled_scale, boolean), just accept strings
      questionPartSchema[fieldName] = z.string().optional();
    }
  }

  return baseSchema.extend(questionPartSchema);
};

type ResponseFormData = z.infer<ReturnType<typeof createResponseSchema>>;

export type InterviewFormData = ResponseFormData & {
  [key: `question_part_${number}`]: string | undefined;
};

// localStorage utilities for interview state
interface InterviewState {
  lastQuestionId: number | null;
}

const getInterviewState = (
  interviewId: number,
  isIndividualInterview: boolean
): InterviewState | null => {
  if (!isIndividualInterview) return null;
  try {
    const key = `interview-${interviewId}-state`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const setInterviewState = (
  interviewId: number,
  isIndividualInterview: boolean,
  state: Partial<InterviewState>
) => {
  if (!isIndividualInterview) return;
  try {
    const key = `interview-${interviewId}-state`;
    const existing = getInterviewState(interviewId, isIndividualInterview) || {
      lastQuestionId: null,
    };
    localStorage.setItem(key, JSON.stringify({ ...existing, ...state }));
  } catch {
    // Silently fail if localStorage is not available
  }
};

export function InterviewDetailPage({
  isIndividualInterview = false,
}: InterviewDetailPageProps) {
  const { id: interviewId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Always show intro for individual interviews
  const [showIntro, setShowIntro] = useState(isIndividualInterview);

  const {
    data: structure,
    isLoading: isLoadingStructure,
    isError: isStructureError,
    error: structureError,
  } = useInterviewStructure(parseInt(interviewId!));

  // Determine current question from URL
  const currentQuestionId = useMemo(() => {
    const questionParam = searchParams.get("question");
    if (questionParam) return parseInt(questionParam);

    // Default to first question
    if (structure?.sections) {
      for (const section of structure.sections) {
        for (const step of section.steps) {
          if (step.questions.length > 0) {
            return step.questions[0].id;
          }
        }
      }
    }
    return null;
  }, [searchParams, structure]);

  const { data: question } = useInterviewQuestion(
    parseInt(interviewId!),
    currentQuestionId
  );

  // Save mutation
  const { mutate: saveResponse, isPending: isSaving } =
    useSaveInterviewResponse();

  // Complete interview mutation
  const { mutateAsync: completeInterviewMutation, isPending: isCompleting } =
    useCompleteInterview();

  // Form for current question - schema updates when question changes
  const schema = useMemo(
    () => createResponseSchema(question?.question_parts),
    [question?.question_parts]
  );

  const form = useForm<InterviewFormData>({
    resolver: zodResolver(schema),
    mode: "onBlur", // Validate when user leaves field
    reValidateMode: "onChange", // Re-validate on change after first validation
    defaultValues: {
      rating_score: null,
      role_ids: [],
      is_unknown: false,
    },
  });

  // Update form when question data loads
  useEffect(() => {
    if (question?.response) {
      const formValues: InterviewFormData = {
        rating_score: question.response.rating_score ?? null,
        role_ids:
          question.response.response_roles?.map((rr) => rr.role.id) ?? [],
        is_unknown: question.response.is_unknown ?? false,
      };

      // Add question part responses for individual interviews
      if (isIndividualInterview && question.response.question_part_responses) {
        question.response.question_part_responses.forEach((response) => {
          if (response.answer_value) {
            formValues[`question_part_${response.question_part_id}`] =
              response.answer_value;
          }
        });
      }

      form.reset(formValues);
    }
  }, [question, form, isIndividualInterview]);

  // Track last question in localStorage for resume functionality
  useEffect(() => {
    if (isIndividualInterview && currentQuestionId && interviewId) {
      setInterviewState(parseInt(interviewId), isIndividualInterview, {
        lastQuestionId: currentQuestionId,
      });
    }
  }, [currentQuestionId, interviewId, isIndividualInterview]);

  const isLoading = isLoadingStructure;

  // Handle 404 errors from structure endpoint
  if (
    isStructureError &&
    (structureError as { response?: { status?: number } })?.response?.status ===
      404
  ) {
    return (
      <UnauthorizedPage
        title="Interview Not Found"
        description="The interview you're looking for doesn't exist, is disabled or may have been removed."
        errorCode="404"
      />
    );
  }

  if (isLoading || !currentQuestionId || !structure) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner message="Loading interview" />
      </div>
    );
  }

  const handleSave = form.handleSubmit((formData) => {
    // This function only runs if validation passes
    if (!question?.response?.id || !currentQuestionId) return;

    // Convert any question_part_{id} fields to part answers
    const partAnswers: {
      question_part_id: number;
      answer_value: string;
    }[] = [];

    for (const key in formData) {
      if (key.startsWith("question_part_")) {
        const partId = parseInt(key.replace("question_part_", ""));
        const value = formData[key as keyof InterviewFormData];

        if (value !== undefined && value !== null) {
          partAnswers.push({
            question_part_id: partId,
            answer_value: String(value),
          });
        }
      }
    }

    saveResponse({
      responseId: question.response.id,
      data: {
        rating_score: formData.rating_score,
        role_ids: formData.role_ids,
        is_unknown: formData.is_unknown,
        question_part_answers: partAnswers,
      },
    });
  });

  const dismissIntro = () => {
    setShowIntro(false);
    // Track the current question for resume functionality
    setInterviewState(parseInt(interviewId!), isIndividualInterview, {
      lastQuestionId: currentQuestionId,
    });
  };

  const handleComplete = async (feedback: CompleteInterviewBodyData) => {
    await completeInterviewMutation({
      interviewId: parseInt(interviewId!),
      feedback,
    });

    // Navigate to home after successful completion
    navigate("/");
  };

  // Show intro screen for individual interviews on first load
  if (showIntro && isIndividualInterview) {
    return (
      <IntroScreen
        interviewId={parseInt(interviewId!)}
        onDismiss={dismissIntro}
      />
    );
  }

  return (
    <InterviewQuestion
      questionId={currentQuestionId}
      form={form}
      isIndividualInterview={isIndividualInterview}
      interviewId={parseInt(interviewId!)}
      handleSave={handleSave}
      isSaving={isSaving}
      isCompleting={isCompleting}
      onComplete={handleComplete}
    />
  );
}
