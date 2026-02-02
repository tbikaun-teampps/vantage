import { DashboardPage } from "@/components/dashboard";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAssessmentContext } from "@/hooks/useAssessmentContext";
import { useAssessments } from "@/hooks/useAssessments";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";
import { OnsiteAssessmentsDataTable } from "@/components/assessment/list/onsite-assessments-data-table";
import { useSearchParams } from "react-router-dom";
import { useCompanyAwareNavigate } from "@/hooks/useCompanyAwareNavigate";
import { DesktopAssessmentsDataTable } from "@/components/assessment/list/desktop-assessments-data-table";

export function AssessmentListPage() {
  const companyId = useCompanyFromUrl();
  usePageTitle("Assessments");

  const navigate = useCompanyAwareNavigate();
  const [searchParams] = useSearchParams();
  const { assessmentType, createRoute, listRoute } = useAssessmentContext();

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
      ? `${listRoute}?${currentParams.toString()}`
      : listRoute;

    navigate(newUrl);
  };

  const {
    data: assessments = [],
    isLoading,
    error,
  } = useAssessments(companyId, {
    ...(assessmentType && { type: assessmentType }),
  });

  if (error) {
    return (
      <DashboardPage
        title="Assessments"
        description={`Manage and view your ${assessmentType || ""} assessments`}
      >
        <div className="flex flex-1 flex-col h-full overflow-auto mx-auto px-6 pt-4">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="mt-1 text-red-500" data-tour="assessments-table">
              Error loading assessments: {error.message}
            </div>
          </div>
        </div>
      </DashboardPage>
    );
  }

  return (
    <DashboardPage
      title="Assessments"
      description={`Manage and view your ${assessmentType || ""} assessments`}
    >
      <div
        className="flex flex-1 flex-col h-full overflow-auto mx-auto px-6 pt-4"
        data-tour="assessments-main"
      >
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="mt-1" data-tour="assessments-table">
            {assessmentType === "onsite" ? (
              <OnsiteAssessmentsDataTable
                data={assessments}
                isLoading={isLoading}
                defaultTab={defaultTab}
                onTabChange={handleTabChange}
                onCreateAssessment={() => navigate(createRoute)}
              />
            ) : (
              <DesktopAssessmentsDataTable
                data={assessments}
                isLoading={isLoading}
                defaultTab={defaultTab}
                onTabChange={handleTabChange}
                onCreateAssessment={() => navigate(createRoute)}
              />
            )}
          </div>
        </div>
      </div>
    </DashboardPage>
  );
}
