import { DashboardPage } from "@/components/dashboard";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useQuestionnaires } from "@/hooks/useQuestionnaires";
import { QuestionnairesPageContent } from "@/components/questionnaires/detail/questionnaires-page-content";
import { QuestionnairesEmptyState } from "@/components/questionnaires/detail/questionnaires-empty-state";
import { QuestionnairesLoadingSkeleton } from "@/components/questionnaires/detail/questionnaires-loading-skeleton";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";

export function QuestionnaireListPage() {
  const companyId = useCompanyFromUrl();
  usePageTitle("Questionnaires", "Onsite");

  const {
    data: questionnaires = [],
    isLoading,
    error,
    refetch,
  } = useQuestionnaires(companyId);

  // Show error state
  if (error) {
    return (
      <QuestionnairesEmptyState
        type="error"
        error={error.message}
        onRetry={() => refetch()}
      />
    );
  }

  // Show loading skeleton when initially loading
  if (isLoading && questionnaires.length === 0) {
    return <QuestionnairesLoadingSkeleton />;
  }

  return (
    <DashboardPage
      title="Questionnaires"
      description="Manage and view your questionnaires"
    >
      <QuestionnairesPageContent />
    </DashboardPage>
  );
}
