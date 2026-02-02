import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { IconArrowLeft } from "@tabler/icons-react";
import { DashboardPage } from "@/components/dashboard";
import { useAssessmentDetail } from "@/hooks/use-assessment-detail";
import { usePageTitle } from "@/hooks/usePageTitle";
import { AssessmentDetails } from "@/components/assessment/detail/assessment-details";
import { AssessmentObjectives } from "@/components/assessment/detail/assessment-objectives";
import { InterviewsList } from "@/components/assessment/detail/assessment-interviews";
import { QuestionnaireStructure } from "@/components/assessment/detail/assessment-questionnaire";
import { AssessmentEvidence } from "@/components/assessment/detail/assessment-evidence";
import { AssessmentComments } from "@/components/assessment/detail/assessment-comments";
import { DangerZone } from "@/components/assessment/detail/danger-zone";
import { DuplicateAssessment } from "@/components/assessment/detail/duplicate-assessment";
import { DeleteConfirmationDialog } from "@/components/assessment/detail/delete-confirmation-dialog";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";
import { useCanAdmin } from "@/hooks/useUserCompanyRole";
import { AssessmentLocation } from "@/components/assessment/detail/assessment-location";
import { AssessmentActions } from "@/components/assessment/detail/assessment-actions";

export function AssessmentOnsiteDetailPage() {
  const userCanAdmin = useCanAdmin();
  const params = useParams();
  const assessmentId = parseInt(params.id!);
  const companyId = useCompanyFromUrl();

  const {
    assessment,
    isLoading,
    showDeleteDialog,
    isDeleting,
    handleBack,
    handleStatusChange,
    handleNameChange,
    handleDescriptionChange,
    handleInterviewOverviewChange,
    setShowDeleteDialog,
    handleDelete,
  } = useAssessmentDetail(assessmentId);

  usePageTitle(assessment?.name || "Assessment Details", "Assessments");

  if (isLoading && !assessment) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-64" />
              <Skeleton className="h-4 w-96" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-destructive">
            Assessment not found
          </h3>
          <p className="text-sm text-muted-foreground">
            The assessment you&apos;re looking for doesn&apos;t exist or
            couldn&apos;t be loaded.
          </p>
          <Button onClick={handleBack} variant="outline">
            <IconArrowLeft className="mr-2 h-4 w-4" />
            Back to Assessments
          </Button>
        </div>
      </div>
    );
  }

  return (
    <DashboardPage
      title={assessment.name}
      description={assessment.description || "No description provided"}
      backHref={`/${companyId}/assessments/onsite`}
      showBack
    >
      <div
        className="max-w-[1600px] mx-auto h-full overflow-auto px-6 pt-4"
        data-tour="assessment-detail-main"
      >
        <div className="space-y-8 mb-8">
          <AssessmentDetails
            assessment={assessment}
            onNameChange={handleNameChange}
            onDescriptionChange={handleDescriptionChange}
            onStatusChange={handleStatusChange}
            onInterviewOverviewChange={handleInterviewOverviewChange}
            assessmentType="onsite"
          />

          <AssessmentLocation location={assessment.location} />
          <AssessmentObjectives objectives={assessment.objectives || []} />
          <InterviewsList assessmentId={assessmentId} />
          <AssessmentActions assessmentId={assessmentId} />
          <AssessmentEvidence assessmentId={assessmentId} />
          <AssessmentComments assessmentId={assessmentId} />
          <QuestionnaireStructure questionnaire={assessment.questionnaire} />
          {userCanAdmin && (
            <>
              <DuplicateAssessment assessmentId={assessmentId} />
              <DangerZone
                onDeleteClick={() => setShowDeleteDialog(true)}
                isDeleting={isDeleting}
              />
            </>
          )}
        </div>
      </div>

      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        assessmentName={assessment.name}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </DashboardPage>
  );
}
