import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconListCheck } from "@tabler/icons-react";
import { CreateInterviewDialog } from "@/components/interview/list/create-interview-dialog";
import { useInterviewsByAssessment } from "@/hooks/useInterviews";
import { InterviewsDataTable } from "@/components/interview/list/interviews-data-table";

interface InterviewsListProps {
  assessmentId: number;
}

export function InterviewsList({ assessmentId }: InterviewsListProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);

  const { data: interviews = [], isLoading } =
    useInterviewsByAssessment(assessmentId);

  const handleInterviewCreated = () => {
    setIsCreateDialogOpen(false);
  };

  return (
    <Card className="shadow-none border-none" data-tour="interviews-list">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <IconListCheck className="h-5 w-5" />
              Interviews
              {interviews.length > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  ({interviews.length}{" "}
                  {interviews.length === 1 ? "interview" : "interviews"})
                </span>
              )}
            </CardTitle>
            <CardDescription>
              All interviews associated with this assessment
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <InterviewsDataTable
          data={interviews}
          isLoading={isLoading}
          showAssessmentColumn={false}
          onCreateInterview={() => setIsCreateDialogOpen(true)}
          defaultTab="all"
        />
      </CardContent>

      <CreateInterviewDialog
        mode="contextual"
        showIndividualOptions={true}
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleInterviewCreated}
        assessmentId={assessmentId}
      />
    </Card>
  );
}
