import {
  useUpdateProgramOnsiteQuestionnaire,
  useUpdateProgramPresiteQuestionnaire,
} from "@/hooks/useProgram";
import { ProgramObjectivesManager } from "./program-objectives-manager";
import { OnsiteQuestionnaireSelection } from "./onsite-questionnaire-selection";
import { PresiteQuestionnaireSelection } from "./presite-questionnaire-selection";
// import { Metrics } from "./desktop-metrics";

export function SetupTab({ program }) {
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
      {/* <Metrics programId={program.id} /> */}
    </div>
  );
}
