import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconUsers, IconUserCheck, IconAlertCircle } from "@tabler/icons-react";
import { CompanyStructureSelectionModal } from "./company-structure-selection-modal";
import { InterviewsDataTable } from "@/components/interview/list/interviews-data-table";
import { useInterviews } from "@/hooks/useInterviews";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";

type InterviewType = "onsite" | "presite";

interface InterviewsProps {
  programId: number;
  programPhaseId: number | null;
  disabled?: boolean;
  disabledReason?: string | null;
  hasQuestionnaire?: boolean;
  questionnaireId: number | null;
  interviewType: InterviewType;
}

const INTERVIEW_CONFIG = {
  onsite: {
    title: "Onsite-Audit Interviews",
    description: "Onsite-audit interviews associated with this program",
    buttonText: "Generate Onsite-Audit Interviews",
    emptyTitle: "No onsite-audit interviews yet",
    emptyDescription:
      "Get started by creating your first onsite-audit interview for this program using the linked questionnaire.",
    icon: IconUsers,
    defaultInterviewType: 'onsite' as const,
  },
  presite: {
    title: "Self-Audit Interviews",
    description:
      "Conduct preliminary interviews to gather context before onsite-audit interviews.",
    buttonText: "Generate Self-Audit Interviews",
    emptyTitle: "No self-audit interviews yet",
    emptyDescription:
      "Schedule interviews with key stakeholders to gather preliminary insights before conducting onsite-audit interviews.",
    icon: IconUserCheck,
    defaultInterviewType: "presite" as const,
  },
};

export function Interviews({
  programId,
  programPhaseId,
  disabled = false,
  disabledReason,
  hasQuestionnaire = false,
  questionnaireId,
  interviewType,
}: InterviewsProps) {
  const companyId = useCompanyFromUrl();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const config = INTERVIEW_CONFIG[interviewType];

  const { data: interviews, isLoading } = useInterviews(companyId, {
    programPhaseId,
    questionnaireId,
  });

  if (!programPhaseId) return;
  const handleCreateInterview = () => {
    setIsModalOpen(true);
  };

  if (questionnaireId === null) {
    return null;
  }

  console.log('config', config)

  return (
    <>
      <Card className="shadow-none border-none">
        <CardHeader>
          <CardTitle>{config.title}</CardTitle>
          <CardDescription>{config.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {disabled ? (
            <div className="text-center py-8">
              <IconAlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">
                Interviews not available
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {disabledReason}
              </p>
            </div>
          ) : hasQuestionnaire ? (
            <InterviewsDataTable
              data={interviews ?? []}
              isLoading={isLoading}
              onCreateInterview={handleCreateInterview}
            />
          ) : (
            <div className="text-center py-8">
              <IconAlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">
                Questionnaire required
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                You must link a questionnaire to this program before creating
                {interviewType === "onsite"
                  ? " onsite interviews. This ensures consistent data structure for analysis and reporting."
                  : " pre-site interviews. This ensures structured data collection during interviews."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {config.defaultInterviewType && (
        <CompanyStructureSelectionModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          programId={programId}
          programPhaseId={programPhaseId}
          questionnaireType={config.defaultInterviewType}
          questionnaireId={questionnaireId}
        />
      )}
    </>
  );
}
