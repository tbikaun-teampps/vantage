import { createContext, useContext, type ReactNode } from "react";
import { useFeedbackDialog } from "@/hooks/useFeedbackDialog";
import { FeedbackDialog } from "@/components/feedback/feedback-dialog";

interface FeedbackDialogContextType {
  openDialog: () => void;
}

const FeedbackDialogContext = createContext<
  FeedbackDialogContextType | undefined
>(undefined);

export function FeedbackDialogProvider({ children }: { children: ReactNode }) {
  const {
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
  } = useFeedbackDialog();

  return (
    <FeedbackDialogContext.Provider value={{ openDialog }}>
      {children}
      <FeedbackDialog
        isOpen={isModalOpen}
        message={message}
        type={type}
        isSubmitting={isSubmitting}
        feedbackError={feedbackError}
        onMessageChange={setMessage}
        onTypeChange={setType}
        onSubmit={handleSubmit}
        onClose={handleModalClose}
      />
    </FeedbackDialogContext.Provider>
  );
}

export function useFeedbackDialogContext() {
  const context = useContext(FeedbackDialogContext);
  if (context === undefined) {
    throw new Error(
      "useFeedbackDialogContext must be used within a FeedbackDialogProvider"
    );
  }
  return context;
}
