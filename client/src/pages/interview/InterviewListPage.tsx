import { DashboardPage } from "@/components/dashboard";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useInterviews } from "@/hooks/useInterviews";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { InterviewsDataTable } from "@/components/interview/list/interviews-data-table";
import { CreateInterviewDialog } from "@/components/interview/list/create-interview-dialog";
import { useAssessmentContext } from "@/hooks/useAssessmentContext";
import { useCompanyAwareNavigate } from "@/hooks/useCompanyAwareNavigate";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function InterviewsListPage() {
  usePageTitle("Interviews", "Onsite");
  const companyId = useCompanyFromUrl();
  const {
    data: interviews = [],
    isLoading: interviewsLoading,
    error,
  } = useInterviews({ company_id: companyId });

  const { assessmentType } = useAssessmentContext();
  const navigate = useCompanyAwareNavigate();
  const [searchParams] = useSearchParams();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);

  // Get the tab from query params (e.g., ?tab=active)
  const tabParam = searchParams.get("tab");
  const defaultTab = tabParam || "all";

  // Handle tab changes - update URL with new tab parameter
  const handleTabChange = (newTab: string) => {
    const currentParams = new URLSearchParams(searchParams.toString());
    if (newTab === "all") {
      currentParams.delete("tab");
    } else {
      currentParams.set("tab", newTab);
    }

    const newUrl = currentParams.toString()
      ? `/assessments/${assessmentType}/interviews?${currentParams.toString()}`
      : `/assessments/${assessmentType}/interviews`;

    navigate(newUrl);
  };

  if (error) {
    return (
      <div className="flex flex-1 flex-col max-w-7xl mx-auto px-6">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 md:gap-6">
            <Alert variant="destructive">
              <AlertDescription className="flex items-center justify-between">
                <span>Failed to load interviews</span>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DashboardPage
      title="Interviews"
      description="Manage and view assessment interviews"
    >
      <div
        className="flex flex-1 flex-col h-full overflow-auto mx-auto px-6 pt-4"
        data-tour="interviews-main"
      >
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="mt-1" data-tour="interviews-table">
            <InterviewsDataTable
              data={interviews}
              isLoading={interviewsLoading}
              defaultTab={defaultTab}
              onTabChange={handleTabChange}
              onCreateInterview={() => setIsCreateDialogOpen(true)}
              showAssessmentColumn={true}
              showProgramColumn={true}
            />
          </div>
        </div>
      </div>

      <CreateInterviewDialog
        mode="standalone"
        showIndividualOptions={true}
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </DashboardPage>
  );
}
