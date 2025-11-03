import { Outlet, useParams, useNavigate, useLocation } from "react-router-dom";
import ErrorBoundary, {
  PublicErrorFallback,
} from "@/components/error-boundary";
import { useInterviewSummary } from "@/hooks/interview/useInterviewSummary";
import { usePublicInterviewAuthStore } from "@/stores/public-interview-auth-store";
import { useState } from "react";
import { InterviewExitDialog } from "@/components/interview/detail/InterviewExitDialog";
import { InterviewLayoutHeader } from "@/components/layouts/interview/header";
import { InterviewLayoutFooter } from "@/components/layouts/interview/footer";
import { useIsMobile } from "@/hooks/use-mobile";

interface ExternalInterviewLayoutProps {
  children?: React.ReactNode;
}

export function ExternalInterviewLayout({
  children,
}: ExternalInterviewLayoutProps) {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { id: interviewId } = useParams<{ id: string }>();
  const [showExitDialog, setShowExitDialog] = useState<boolean>(false);
  const navigate = useNavigate();

  const { data: interviewData } = useInterviewSummary(parseInt(interviewId!));
  const clearAuth = usePublicInterviewAuthStore((state) => state.clearAuth);

  const handleExit = () => {
    clearAuth();
    navigate("/");
  };

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <InterviewLayoutHeader
          interviewData={interviewData}
          showExitDialog={() => setShowExitDialog(true)}
        />
        <main className="h-screen overflow-y-auto pt-[var(--demo-banner-height)]">
          <ErrorBoundary key={location.pathname} fallback={PublicErrorFallback}>
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
