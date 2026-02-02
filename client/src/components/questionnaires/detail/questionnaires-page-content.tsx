import { useSearchParams } from "react-router-dom";
import { useQuestionnaires } from "@/hooks/useQuestionnaires";
import { QuestionnairesDataTable } from "../list/questionnaires-data-table";
import { useCompanyAwareNavigate } from "@/hooks/useCompanyAwareNavigate";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";

export function QuestionnairesPageContent() {
  const companyId = useCompanyFromUrl();
  const navigate = useCompanyAwareNavigate();
  const [searchParams] = useSearchParams();
  const { data: questionnaires = [], isLoading, error, refetch } = useQuestionnaires(companyId);

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
      ? `/questionnaires?${currentParams.toString()}`
      : "/questionnaires";

    navigate(newUrl);
  };

  return (
    <div
      className="flex flex-1 flex-col mx-auto h-full overflow-auto px-6 pt-4"
      data-tour="questionnaires-main"
    >
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="mt-1" data-tour="questionnaires-table">
          <QuestionnairesDataTable
            questionnaires={questionnaires}
            isLoading={isLoading}
            error={error?.message || null}
            defaultTab={defaultTab}
            onTabChange={handleTabChange}
            onRetry={() => refetch()}
          />
        </div>
      </div>
    </div>
  );
}
