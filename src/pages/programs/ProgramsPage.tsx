import { DashboardPage } from "@/components/dashboard-page";
import { usePageTitle } from "@/hooks/usePageTitle";
import { usePrograms } from "@/hooks/useProgram";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";
import { ProgramsDataTable } from "./components/programs-data-table";

export function ProgramsPage() {
  usePageTitle("Programs");
  const companyId = useCompanyFromUrl();
  const { data: programs = [], isLoading } = usePrograms(companyId);

  return (
    <DashboardPage title="Programs" description="Manage and view programs">
      <div
        className="flex flex-1 flex-col h-full overflow-auto mx-auto px-6 pt-4"
        data-tour="programs-main"
      >
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="mt-1" data-tour="programs-table">
            <ProgramsDataTable data={programs} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </DashboardPage>
  );
}
