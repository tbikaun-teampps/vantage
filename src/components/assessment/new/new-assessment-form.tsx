import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { IconArrowLeft, IconLoader } from "@tabler/icons-react";
import { DashboardPage } from "@/components/dashboard";
import { useQuestionnaires } from "@/hooks/useAssessments";
import {
  useBusinessUnits,
  useRegions,
  useSites,
  useAssetGroups,
} from "@/hooks/useCompany";
import { useAssessmentForm } from "./use-assessment-form";
import { useAssessmentContext } from "@/hooks/useAssessmentContext";
import { QuestionnaireSelection } from "./questionnaire-selection";
import { LocationHierarchy } from "./location-hierarchy";
import { AssessmentObjectives } from "./assessment-objectives";
import { ObjectivesDialog } from "./objectives-dialog";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";
import { useCompanyAwareNavigate } from "@/hooks/useCompanyAwareNavigate";
import { useCompanyRoutes } from "@/hooks/useCompanyRoutes";
import { AssessmentDetails } from "./details";

export function NewAssessmentForm() {
  const companyId = useCompanyFromUrl();
  const navigate = useCompanyAwareNavigate();
  const [showObjectivesDialog, setShowObjectivesDialog] = useState(false);
  const { listRoute, assessmentType } = useAssessmentContext();

  const {
    data: questionnaires = [],
    isLoading,
    error,
  } = useQuestionnaires(
    companyId,
    { status: "published" },
    assessmentType === "onsite"
  );
  const { data: businessUnits = [] } = useBusinessUnits(companyId);
  const { data: regions = [] } = useRegions(companyId);
  const { data: sites = [] } = useSites(companyId);
  const { data: assetGroups = [] } = useAssetGroups(companyId);
  const routes = useCompanyRoutes();

  const {
    formData,
    formErrors,
    creationStep,
    isRedirecting,
    isCreating,
    isFormValid,
    handleInputChange,
    addObjective,
    removeObjective,
    updateObjective,
    handleSubmit,
  } = useAssessmentForm();

  const handleBack = () => navigate(listRoute);

  if (isLoading && questionnaires.length === 0) {
    return (
      <div className="flex flex-1 flex-col gap-6 px-6 py-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && assessmentType === "onsite") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-6">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-destructive">
            Error Loading Questionnaires
          </h3>
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <div className="flex gap-2">
            <Button onClick={handleBack} variant="outline">
              <IconArrowLeft className="mr-2 h-4 w-4" />
              Back to Assessments
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DashboardPage
      title={`Create New ${assessmentType} Assessment`}
      description={`Set up a new ${assessmentType} assessment based on a questionnaire`}
      showBack
      backHref={
        assessmentType === "onsite"
          ? routes.assessmentsOnsite()
          : routes.assessmentsDesktop()
      }
      tourId="assessment-creation-main"
    >
      <div className="px-6 space-y-6 max-w-[1600px] mx-auto overflow-auto h-full">
        <form
          id="assessment-form"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <AssessmentDetails
            formData={formData}
            formErrors={formErrors}
            onInputChange={handleInputChange}
          />
          {assessmentType === "onsite" && (
            <>
              <QuestionnaireSelection
                questionnaires={questionnaires}
                formData={formData}
                formErrors={formErrors}
                onInputChange={handleInputChange}
              />

              {/* TODO: Create an endpoint that just returns the hierarchy directly. */}
              <LocationHierarchy
                formData={formData}
                formErrors={formErrors}
                businessUnits={businessUnits}
                regions={regions}
                sites={sites}
                assetGroups={assetGroups}
                onInputChange={handleInputChange}
              />
            </>
          )}

          <AssessmentObjectives
            objectives={formData.objectives}
            formErrors={formErrors}
            onAddObjective={() => addObjective()}
            onRemoveObjective={removeObjective}
            onUpdateObjective={updateObjective}
            onShowObjectivesDialog={() => setShowObjectivesDialog(true)}
          />
          <div className="flex gap-3 justify-end px-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={isCreating || isRedirecting}
            >
              Cancel
            </Button>
            <Button
              form="assessment-form"
              type="submit"
              disabled={isCreating || isRedirecting || !isFormValid()}
              data-tour="assessment-actions"
            >
              {(isCreating || isRedirecting) && (
                <IconLoader className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isCreating || isRedirecting
                ? creationStep || "Creating Assessment..."
                : "Create Assessment"}
            </Button>
          </div>
        </form>
      </div>

      <ObjectivesDialog
        open={showObjectivesDialog}
        onOpenChange={setShowObjectivesDialog}
        onObjectivesSelected={(selectedObjectives) => {
          selectedObjectives.forEach((objective) => addObjective(objective));
        }}
        existingObjectives={formData.objectives}
      />
    </DashboardPage>
  );
}
