import { useParams, useSearchParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { IconAlertCircle } from "@tabler/icons-react";
import { DashboardPage } from "@/components/dashboard";
import { useProgramById } from "@/hooks/useProgram";
import { usePageTitle } from "@/hooks/usePageTitle";
import { DetailsTab } from "@/components/programs/detail/overview-tab";
import { TabSwitcher } from "@/components/programs/detail/tab-switcher";
import { ScheduleTab } from "@/components/programs/detail/schedule-tab";
import { SetupTab } from "@/components/programs/detail/setup-tab";
import { ManageTab } from "@/components/programs/detail/manage-tab";

export function ProgramDetailPage() {
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const programId = parseInt(params.id!);
  const { data: program, isLoading, error } = useProgramById(programId);

  // Get active tab from URL search params, default to "overview"
  const activeTab =
    (searchParams.get("tab") as "overview" | "setup" | "schedule" | "manage") ||
    "overview";

  usePageTitle(program?.name || "Program Details");

  if (isLoading) {
    return (
      <DashboardPage
        title={<Skeleton className="h-8 w-48" />}
        description={<Skeleton className="h-4 w-96" />}
      >
        <div className="flex flex-1 flex-col gap-6 px-6 py-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-6 w-20" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardPage>
    );
  }

  if (error || !program) {
    return (
      <DashboardPage
        title="Program Not Found"
        description="The requested program could not be found"
      >
        <div className="flex flex-1 flex-col items-center justify-center p-6">
          <Card className="max-w-md mx-auto">
            <CardContent className="flex flex-col items-center text-center p-6 space-y-4">
              <IconAlertCircle className="h-12 w-12 text-destructive" />
              <div className="space-y-2">
                <h3 className="font-medium">Program Not Found</h3>
                <p className="text-sm text-muted-foreground">
                  {error?.message ||
                    "The program you're looking for doesn't exist or has been deleted."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardPage>
    );
  }

  const handleTabChange = (
    tab: "overview" | "setup" | "schedule" | "manage"
  ) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (tab === "overview") {
      // Remove the tab param for the default tab to keep URLs clean
      newSearchParams.delete("tab");
    } else {
      newSearchParams.set("tab", tab);
    }
    setSearchParams(newSearchParams);
  };

  return (
    <DashboardPage
      title={program.name}
      description={program.description || "Program overview"}
      headerActions={
        <TabSwitcher activeTab={activeTab} onTabChange={handleTabChange} />
      }
    >
      <div className="mx-auto h-full" data-tour="program-detail-main">
        {activeTab === "overview" ? (
          <div className="h-full overflow-y-auto">
            <DetailsTab program={program} />
          </div>
        ) : activeTab === "setup" ? (
          <div className="h-full overflow-y-auto">
            <SetupTab program={program} />
          </div>
        ) : activeTab === "manage" ? (
          <ManageTab program={program} />
        ) : activeTab === "schedule" ? (
          <ScheduleTab programId={program.id} />
        ) : null}
      </div>
    </DashboardPage>
  );
}
