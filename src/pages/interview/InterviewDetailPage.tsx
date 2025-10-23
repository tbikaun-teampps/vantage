import { InterviewQuestion } from "@/components/interview/detail";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useInterviewStructure } from "@/hooks/interview/useInterviewStructure";
import { useInterviewQuestion } from "@/hooks/interview/useQuestion";
import { useSaveInterviewResponse } from "@/hooks/interview/useSaveResponse";
import { useMemo, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LoadingSpinner } from "@/components/loader";
import { UnauthorizedPage } from "@/pages/UnauthorizedPage";
import { toast } from "sonner";
import { completeInterview } from "@/lib/api/interviews";
import type { InterviewFeedback } from "@/components/interview/detail/InterviewCompletionDialog";
import { IntroScreen } from "@/components/interview/detail/IntroScreen";

interface InterviewDetailPageProps {
  isIndividualInterview?: boolean;
}

// Form schema for interview responses
const responseSchema = z.object({
  rating_score: z.number().nullable().optional(),
  role_ids: z.array(z.number()).optional().default([]),
  is_unknown: z.boolean().optional().default(false),
});

type ResponseFormData = z.infer<typeof responseSchema>;

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

  // Fetch data using new 3-endpoint architecture
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

  // Form for current question
  const form = useForm<ResponseFormData>({
    resolver: zodResolver(responseSchema),
    defaultValues: {
      rating_score: null,
      role_ids: [],
      is_unknown: false,
    },
  });

  // Update form when question data loads
  useEffect(() => {
    if (question?.response) {
      form.reset({
        rating_score: question.response.rating_score ?? null,
        role_ids:
          question.response.response_roles?.map((rr) => rr.role.id) ?? [],
        is_unknown: question.response.is_unknown ?? false,
      });
    }
  }, [question, form]);

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

  const handleSave = () => {
    if (!question?.response?.id || !currentQuestionId) return;

    const formData = form.getValues();
    saveResponse({
      interviewId: parseInt(interviewId!),
      responseId: question.response.id,
      questionId: currentQuestionId,
      rating_score: formData.rating_score,
      role_ids: formData.role_ids,
      is_unknown: formData.is_unknown,
    });
  };

  const dismissIntro = () => {
    setShowIntro(false);
    // Track the current question for resume functionality
    setInterviewState(parseInt(interviewId!), isIndividualInterview, {
      lastQuestionId: currentQuestionId,
    });
  };

  const handleComplete = async (feedback: InterviewFeedback) => {
    try {
      await completeInterview(parseInt(interviewId!), feedback);

      toast.success("Interview completed successfully");
      navigate("/");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to complete interview"
      );
      throw error; // Re-throw to let the dialog handle the error state
    }
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
      onComplete={handleComplete}
    />
  );
}
