import { EditableProgramDetails } from "@/components/programs/detail/overview-tab/editable-program-details";
import { useDeleteProgram, useUpdateProgram } from "@/hooks/useProgram";
import { useState, useMemo } from "react";
import { DangerZone } from "./danger-zone";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";
import { useCompanyAwareNavigate } from "@/hooks/useCompanyAwareNavigate";
import { ProgramMeasurementsLineChart } from "@/components/programs/detail/analytics/program-measurements-line-chart";
import {
  PresiteInterviewsLineChart,
  OnsiteInterviewsLineChart,
} from "@/components/programs/detail/analytics/interviews-line-chart";
import type { ProgramDetailResponseData } from "@/types/api/programs";
import { useProgramMeasurements } from "@/hooks/useProgram";

interface DetailsTabProps {
  program: ProgramDetailResponseData;
}

export function DetailsTab({ program }: DetailsTabProps) {
  const navigate = useCompanyAwareNavigate();
  const updateProgramMutation = useUpdateProgram();
  const deleteProgramMutation = useDeleteProgram();
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);

  // Fetch program measurements to check if any are actually assigned
  const { data: programMeasurements } = useProgramMeasurements(program?.id);

  const handleProgramUpdate = async (updateData: {
    name?: string;
    description?: string;
    status?: string;
  }) => {
    if (program) {
      await updateProgramMutation.mutateAsync({
        programId: program.id,
        updateData,
      });
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (program) {
      try {
        await deleteProgramMutation.mutateAsync(program.id);
        navigate("/programs");
      } catch (error) {
        // Error handling is done in the hook
        console.error("Delete failed:", error);
      }
      setShowDeleteDialog(false);
    }
  };

  // Determine which charts are likely to have data based on program configuration
  const chartPriority = useMemo(() => {
    if (!program) return [];

    const charts = [];
    const phases = program.phases || [];
    const hasMultiplePhases = phases.length >= 2;

    // Check if each chart type is likely to have data
    const hasMeasurementsData =
      hasMultiplePhases &&
      phases.some((phase) => phase.id) &&
      programMeasurements &&
      programMeasurements.length > 0;
    const hasPresiteData =
      hasMultiplePhases && program.presite_questionnaire_id;
    const hasOnsiteData = hasMultiplePhases && program.onsite_questionnaire_id;

    // Sort by data likelihood - charts with data first
    if (hasMeasurementsData) {
      charts.push({
        type: "measurements",
        component: (
          <ProgramMeasurementsLineChart
            key="measurements"
            programId={program.id}
          />
        ),
      });
    }
    if (hasPresiteData) {
      charts.push({
        type: "presite",
        component: (
          <PresiteInterviewsLineChart key="presite" programId={program.id} />
        ),
      });
    }
    if (hasOnsiteData) {
      charts.push({
        type: "onsite",
        component: (
          <OnsiteInterviewsLineChart key="onsite" programId={program.id} />
        ),
      });
    }

    // Add charts without data at the end
    if (!hasMeasurementsData) {
      charts.push({
        type: "measurements",
        component: (
          <ProgramMeasurementsLineChart
            key="measurements"
            programId={program.id}
          />
        ),
      });
    }
    if (!hasPresiteData) {
      charts.push({
        type: "presite",
        component: (
          <PresiteInterviewsLineChart key="presite" programId={program.id} />
        ),
      });
    }
    if (!hasOnsiteData) {
      charts.push({
        type: "onsite",
        component: (
          <OnsiteInterviewsLineChart key="onsite" programId={program.id} />
        ),
      });
    }

    return charts;
  }, [program, programMeasurements]);

  return (
    <>
      <div className="space-y-6 mb-8">
        <EditableProgramDetails
          program={program}
          onUpdate={handleProgramUpdate}
        />

        <div className="grid grid-cols-1 gap-6">
          {chartPriority.map((chart) => chart.component)}
        </div>

        <div className="mt-8">
          <DangerZone
            onDeleteClick={handleDeleteClick}
            isDeleting={deleteProgramMutation.isPending}
          />
        </div>
      </div>
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        programName={program.name}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteProgramMutation.isPending}
      />
    </>
  );
}
