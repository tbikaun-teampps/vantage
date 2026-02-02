import {
  useUpdateProgramOnsiteQuestionnaire,
  useUpdateProgramPresiteQuestionnaire,
} from "@/hooks/useProgram";
import { ProgramObjectivesManager } from "@/components/programs/detail/setup-tab/program-objectives-manager";
import { OnsiteQuestionnaireSelection } from "@/components/programs/detail/setup-tab/onsite-questionnaire-selection";
import { PresiteQuestionnaireSelection } from "@/components/programs/detail/setup-tab/presite-questionnaire-selection";
import { Measurements } from "@/components/programs/detail/setup-tab/desktop-measurements";
import type { GetProgramByIdResponseData } from "@/types/api/programs";

interface SetupTabProps {
  program: GetProgramByIdResponseData;
}

export function SetupTab({ program }: SetupTabProps) {
  const updateOnsiteQuestionnaireMutation =
    useUpdateProgramOnsiteQuestionnaire();
  const updatePresiteQuestionnaireMutation =
    useUpdateProgramPresiteQuestionnaire();
  const handleOnsiteQuestionnaireUpdate = async (
    questionnaireId: number | null
  ) => {
    if (program) {
      await updateOnsiteQuestionnaireMutation.mutateAsync({
        programId: program.id,
        questionnaireId,
      });
    }
  };

  const handlePresiteQuestionnaireUpdate = async (
    questionnaireId: number | null
  ) => {
    if (program) {
      await updatePresiteQuestionnaireMutation.mutateAsync({
        programId: program.id,
        questionnaireId,
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 mb-8">
      <ProgramObjectivesManager programId={program.id} />
      <PresiteQuestionnaireSelection
        program={program}
        onPresiteQuestionnaireUpdate={handlePresiteQuestionnaireUpdate}
        isUpdating={updatePresiteQuestionnaireMutation.isPending}
      />
      <OnsiteQuestionnaireSelection
        program={program}
        onOnsiteQuestionnaireUpdate={handleOnsiteQuestionnaireUpdate}
        isUpdating={updateOnsiteQuestionnaireMutation.isPending}
      />
      <Measurements programId={program.id} />
    </div>
  );
}
