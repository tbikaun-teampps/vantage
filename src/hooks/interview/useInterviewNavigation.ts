import { useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useCompanyAwareNavigate } from "@/hooks/useCompanyAwareNavigate";
import { useInterviewStructure } from "./useInterviewStructure";
import { useInterviewProgress } from "./useInterviewProgress";

interface Question {
  id: number;
  title: string;
  order_index: number;
}

interface InterviewNavigationResult {
  allQuestions: Question[];
  currentIndex: number;
  totalQuestions: number;
  isFirst: boolean;
  isLast: boolean;
  isLoading: boolean;
  onPrevious: () => void;
  onNext: () => void;
  goToQuestion: (questionId: number) => void;
}

export function useInterviewNavigation(
  interviewId: number,
  isPublic: boolean = false
): InterviewNavigationResult {
  const [searchParams] = useSearchParams();
  const navigate = useCompanyAwareNavigate();

  const { data: structure, isLoading: isLoadingStructure } =
    useInterviewStructure(interviewId);

  const { data: progress, isLoading: isLoadingProgress } =
    useInterviewProgress(interviewId);

  const sections = structure?.sections ?? [];
  const responses = progress?.responses ?? {};

  // Get all applicable questions from sections
  const allQuestions = useMemo(() => {
    const questions: Question[] = [];
    for (const section of sections) {
      for (const step of section.steps) {
        for (const question of step.questions) {
          // Only include applicable questions
          const response = responses[question.id];
          if (response && response.is_applicable !== false) {
            questions.push(question);
          }
        }
      }
    }
    return questions;
  }, [sections, responses]);

  // Derive current question index from URL
  const currentIndex = useMemo(() => {
    const questionIdParam = searchParams.get("question");
    if (!questionIdParam || allQuestions.length === 0) {
      return 0;
    }
    const questionId = parseInt(questionIdParam, 10);
    const questionIndex = allQuestions.findIndex((q) => q.id === questionId);
    return questionIndex >= 0 ? questionIndex : 0;
  }, [searchParams, allQuestions]);

  const totalQuestions = allQuestions.length;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalQuestions - 1;
  const isLoading = isLoadingStructure || isLoadingProgress;

  // Navigation function to go to a specific question
  const goToQuestion = useCallback(
    (questionId: number) => {
      const params = new URLSearchParams(searchParams.toString());
      const firstQuestionId = allQuestions[0]?.id;

      // First question has no query param for clean URLs
      if (questionId === firstQuestionId) {
        params.delete("question");
      } else {
        params.set("question", questionId.toString());
      }

      const queryString = params.toString();
      navigate(
        `${isPublic ? "/external/interview" : "/assessments/onsite/interviews"}/${interviewId}${queryString ? `?${queryString}` : ""}`
      );
    },
    [allQuestions, searchParams, navigate, interviewId, isPublic]
  );

  // Navigate to previous question
  const onPrevious = useCallback(() => {
    if (currentIndex > 0) {
      const prevQuestion = allQuestions[currentIndex - 1];
      if (prevQuestion) {
        goToQuestion(prevQuestion.id);
      }
    }
  }, [currentIndex, allQuestions, goToQuestion]);

  // Navigate to next question
  const onNext = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      const nextQuestion = allQuestions[currentIndex + 1];
      if (nextQuestion) {
        goToQuestion(nextQuestion.id);
      }
    }
  }, [currentIndex, totalQuestions, allQuestions, goToQuestion]);

  return {
    allQuestions,
    currentIndex,
    totalQuestions,
    isFirst,
    isLast,
    isLoading,
    onPrevious,
    onNext,
    goToQuestion,
  };
}
