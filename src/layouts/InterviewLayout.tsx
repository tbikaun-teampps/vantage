import { Outlet, useParams } from "react-router-dom";
import ErrorBoundary from "@/components/error-boundary";
import { useInterview } from "@/hooks/interview/useInterview";
import { InterviewExitDialog } from "@/components/interview/detail/InterviewExitDialog";
import { InterviewLayoutHeader } from "@/components/layouts/interview/header";
import { InterviewLayoutFooter } from "@/components/layouts/interview/footer";
import { useIsMobile } from "@/hooks/use-mobile";

interface InterviewLayoutProps {
  children?: React.ReactNode;
}

export function InterviewLayout({ children }: InterviewLayoutProps) {
  const isMobile = useIsMobile();
  const { id: interviewId } = useParams<{ id: string }>();
  const { interview, actions, ui } = useInterview(parseInt(interviewId!));

  const { data: interviewData } = interview;
  const { dialogs, toggleDialog } = ui;

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <InterviewLayoutHeader
          interviewData={interviewData}
          showExitDialog={() => toggleDialog("showExit", true)}
        />

        <main className="flex-1 pt-[var(--demo-banner-height)]">
          <ErrorBoundary>{children || <Outlet />}</ErrorBoundary>
        </main>

        {isMobile && <InterviewLayoutFooter />}
      </div>

      <InterviewExitDialog
        open={dialogs.showExit}
        onOpenChange={(open) => toggleDialog("showExit", open)}
        onExit={actions.exit}
      />
    </>
  );
}
