import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Settings } from "@/components/questionnaires/detail/settings";
import { TabSwitcher } from "@/components/questionnaires/detail/tab-switcher";
import { Questions } from "@/components/questionnaires/detail/questions";
import { IconAlertCircle, IconLock } from "@tabler/icons-react";
import { DashboardPage } from "@/components/dashboard";
import { Badge } from "@/components/ui/badge";
import { QuestionnaireUsageAlert } from "@/components/questionnaires/detail/questionnaire-usage-alert";
import { useCompanyRoutes } from "@/hooks/useCompanyRoutes";
import {
  QuestionnaireDetailProvider,
  useQuestionnaireDetail,
} from "@/contexts/QuestionnaireDetailContext";
import { RatingScales } from "@/components/questionnaires/detail/rating-scales";

function QuestionnaireDetailPageContent() {
  const routes = useCompanyRoutes();

  const {
    questionnaire,
    isLoading,
    error,
    questionnaireUsage,
    activeTab,
    handleTabChange,
  } = useQuestionnaireDetail();

  if (error) {
    return (
      <DashboardPage
        title="Error"
        description="Error loading questionnaire"
        showBack
        backHref={routes.questionnaires()}
      >
        <div className="h-full flex flex-col">
          <Alert variant="destructive" className="mb-4">
            <IconAlertCircle className="h-4 w-4" />
            <AlertDescription>
              <span>{error.message}</span>
            </AlertDescription>
          </Alert>
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">
              Failed to load questionnaire.
            </p>
          </div>
        </div>
      </DashboardPage>
    );
  }

  if (isLoading || !questionnaire) {
    return (
      <DashboardPage
        title="Loading..."
        description="Loading questionnaire details"
        showBack
        backHref={routes.questionnaires()}
        headerActions={
          <div className="flex items-center gap-4">
            {/* Loading tab switcher skeleton */}
            <div className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="inline-flex items-center justify-center rounded-md px-3 py-1 gap-2"
                >
                  <div className="h-4 w-4 bg-muted-foreground/20 animate-pulse rounded" />
                  <div className="h-4 w-16 bg-muted-foreground/20 animate-pulse rounded" />
                </div>
              ))}
            </div>
          </div>
        }
      >
        <div className="h-full flex flex-col">
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 min-h-0 px-6 py-4">
              <Card className="h-full shadow-none border-none">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-6 w-32 bg-muted animate-pulse rounded" />
                        <div className="h-5 w-20 bg-muted animate-pulse rounded" />
                      </div>
                      <div className="h-4 w-64 bg-muted animate-pulse rounded" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                      <div className="h-8 w-32 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                      <div className="h-10 w-full bg-muted animate-pulse rounded" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                      <div className="h-24 w-full bg-muted animate-pulse rounded" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                      <div className="h-24 w-full bg-muted animate-pulse rounded" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                      <div className="h-10 w-full bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardPage>
    );
  }

  return (
    <DashboardPage
      title={
        <div className="flex items-center gap-2">
          {questionnaire.name}
          {questionnaireUsage.isInUse && (
            <Badge
              variant="secondary"
              className="bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400"
            >
              <IconLock className="h-3 w-3 mr-1" />
              In Use
            </Badge>
          )}
        </div>
      }
      description={questionnaire.description}
      showBack
      backHref={routes.questionnaires()}
      headerActions={<TabSwitcher onTabChange={handleTabChange} />}
    >
      <div className="h-full flex flex-col pt-4">
        <div className="flex-shrink-0 px-6 mb-4">
          {questionnaireUsage.isInUse && (
            <QuestionnaireUsageAlert questionnaireUsage={questionnaireUsage} />
          )}
        </div>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="flex-1 flex flex-col min-h-0"
        >
          <TabsContent value="settings" className="flex-1 min-h-0 px-6">
            <Settings />
          </TabsContent>

          <TabsContent
            value="rating-scales"
            className="flex-1 min-h-0 px-6 mb-8"
          >
            <RatingScales />
          </TabsContent>

          <TabsContent value="questions" className="flex-1 min-h-0 px-6">
            <Questions />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardPage>
  );
}

export function QuestionnaireDetailPage() {
  const params = useParams();
  const questionnaireId = parseInt(params.id!);

  return (
    <QuestionnaireDetailProvider questionnaireId={questionnaireId}>
      <QuestionnaireDetailPageContent />
    </QuestionnaireDetailProvider>
  );
}
