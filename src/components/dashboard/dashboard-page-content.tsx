import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTourManager } from "@/lib/tours";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewTabContent } from "./overview-tab-content";

export function DashboardPageContent() {
  const { startTour } = useTourManager();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("tour") === "true") {
      // Start dashboard tour after a brief delay to ensure content is loaded
      const timer = setTimeout(() => {
        startTour("platform-overview", true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [searchParams, startTour]);

  return (
    <div
      className="flex flex-1 flex-col overflow-auto pb-6"
      data-tour="dashboard-main"
    >
      <div className="pt-6">
        <Tabs defaultValue="overview" className="px-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {/* <TabsTrigger value="assessments">Assessments</TabsTrigger> */}
            <TabsTrigger value="programs">Programs</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <OverviewTabContent />
          </TabsContent>
          <TabsContent value="programs">
            <div className='mt-4 text-sm text-muted-foreground'>
              Program dashboard coming soon!
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
