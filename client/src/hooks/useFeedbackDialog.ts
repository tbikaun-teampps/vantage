import { useState } from "react";
import { useFeedbackActions } from "@/hooks/useFeedback";
import { toast } from "sonner";
import type { FeedbackType } from "@/types/api/feedback";

export function useFeedbackDialog() {
  const { submitFeedback, isSubmitting, feedbackError, resetErrors } =
    useFeedbackActions();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [type, setType] = useState<FeedbackType>("general");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      return;
    }

    try {
      await submitFeedback({ message: message.trim(), type });
      toast.success("Thank you for your feedback!");
      setMessage("");
      setType("general");
      setIsModalOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit feedback"
      );
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setMessage("");
    setType("general");
    resetErrors();
  };

  const openDialog = () => {
    setIsModalOpen(true);
  };

  return {
    isModalOpen,
    message,
    type,
    isSubmitting,
    feedbackError,
    setMessage,
    setType,
    handleSubmit,
    handleModalClose,
    openDialog,
  };
}
