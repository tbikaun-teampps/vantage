import { useState } from "react";
import { Outlet, useParams, useLocation } from "react-router-dom";
import ErrorBoundary from "@/components/error-boundary";
import { useInterviewSummary } from "@/hooks/interview/useInterviewSummary";
import { useCompanyAwareNavigate } from "@/hooks/useCompanyAwareNavigate";
import { InterviewExitDialog } from "@/components/interview/detail/InterviewExitDialog";
import { InterviewLayoutHeader } from "@/components/layouts/interview/header";
import { InterviewLayoutFooter } from "@/components/layouts/interview/footer";
import { useIsMobile } from "@/hooks/use-mobile";

interface InterviewLayoutProps {
  children?: React.ReactNode;
}

export function InterviewLayout({ children }: InterviewLayoutProps) {
  const location = useLocation();
  const isMobile = useIsMobile();
  const navigate = useCompanyAwareNavigate();
  const { id: interviewId } = useParams<{ id: string }>();
  const { data: interviewData } = useInterviewSummary(parseInt(interviewId!));
  const [showExitDialog, setShowExitDialog] = useState(false);

  const handleExit = () => {
    navigate("/interviews");
  };

  if (!interviewData) {
    return null;  //TODO: review if this should be a loading component
  }

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <InterviewLayoutHeader
          interviewData={interviewData}
          showExitDialog={() => setShowExitDialog(true)}
        />

        <main className="flex-1 pt-[var(--demo-banner-height)]">
          <ErrorBoundary key={location.pathname}>
            {children || <Outlet />}
          </ErrorBoundary>
        </main>

        {isMobile && <InterviewLayoutFooter />}
      </div>

      <InterviewExitDialog
        open={showExitDialog}
        onOpenChange={setShowExitDialog}
        onExit={handleExit}
      />
    </>
  );
}
