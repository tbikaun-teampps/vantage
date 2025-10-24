import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { IconPlus } from "@tabler/icons-react";
import { useCreatePhase } from "@/hooks/useProgram";
import type { ProgramPhase } from "@/types/program";
import { Interviews } from "./interviews";
import { useProgramValidation } from "@/hooks/useProgramValidation";
import { CalculatedMeasurements } from "@/components/measurements/calculated-measurements";
import { PhaseDetails } from "./phase-details";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTrigger,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { ProgramDetailResponseData } from "@/types/api/programs";

interface ManageTabProps {
  program: ProgramDetailResponseData;
}

const statusColors = {
  scheduled: "bg-blue-100 text-blue-800 border-blue-200",
  in_progress: "bg-yellow-100 text-yellow-800 border-yellow-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  archived: "bg-gray-100 text-gray-800 border-gray-200",
} as const;

const statusLabels = {
  scheduled: "Scheduled",
  in_progress: "In Progress",
  completed: "Completed",
  archived: "Archived",
} as const;

interface PhaseTabContentProps {
  phase: ProgramPhase;
  program: ProgramDetailResponseData;
  programValidation: ReturnType<typeof useProgramValidation>;
}

function PhaseTabContent({
  phase,
  program,
  programValidation,
}: PhaseTabContentProps) {
  if (!phase) {
    return (
      <p className="text-muted-foreground">No program phase data available.</p>
    );
  }

  return (
    <>
      <PhaseDetails phase={phase} />
      <Interviews
        programId={program.id}
        programPhaseId={phase.id}
        disabled={!programValidation.canCreatePresiteInterviews}
        disabledReason={programValidation.presiteQuestionnaire.reason}
        questionnaireId={program.presite_questionnaire_id}
        hasQuestionnaire={!!program.presite_questionnaire_id}
        interviewType="presite"
      />
      <Interviews
        programId={program.id}
        programPhaseId={phase.id}
        disabled={!programValidation.canCreateOnsiteAssessments}
        disabledReason={programValidation.onsiteQuestionnaire.reason}
        hasQuestionnaire={!!program.onsite_questionnaire_id}
        questionnaireId={program.onsite_questionnaire_id}
        interviewType="onsite"
      />
      <CalculatedMeasurements
        programId={program.id}
        programPhaseId={phase.id}
        title="Desktop Analysis Measurements"
        description="Calculated values for this assessment in the program"
      />
    </>
  );
}

export function ManageTab({ program }: ManageTabProps) {
  const phases = useMemo(
    () =>
      program?.phases?.sort(
        (a, b) => (a.sequence_number ?? 0) - (b.sequence_number ?? 0)
      ) || [],
    [program?.phases]
  );

  // Use the first phase as default, update when phases change
  const defaultPhaseId = phases[0]?.id;
  const [activePhaseId, setActivePhaseId] = useState<number | undefined>(
    defaultPhaseId
  );

  // Sync activePhaseId when phases change or if current selection is invalid
  const validActivePhaseId = useMemo(() => {
    if (activePhaseId && phases.some((p) => p.id === activePhaseId)) {
      return activePhaseId;
    }
    return defaultPhaseId;
  }, [activePhaseId, phases, defaultPhaseId]);

  const activePhase = useMemo(() => {
    return phases.find((phase) => phase.id === validActivePhaseId);
  }, [phases, validActivePhaseId]);

  const programValidation = useProgramValidation(program);

  return (
    <div className="space-y-6 mb-6">
      <div>
        {phases.length === 0 ? (
          <p className="text-muted-foreground">
            No phases found for this program.
          </p>
        ) : (
          <Tabs
            value={validActivePhaseId?.toString() || ""}
            onValueChange={(value) => setActivePhaseId(parseInt(value, 10))}
          >
            <div className="flex items-center justify-between gap-4">
              <TabsList className="flex w-full justify-start overflow-x-auto">
                {phases.map((phase) => (
                  <TabsTrigger
                    key={phase.id ?? `phase-${phase.sequence_number}`}
                    value={(phase.id ?? 0).toString()}
                    className="flex items-center gap-2"
                  >
                    <span>
                      {phase.name || `Phase ${phase.sequence_number ?? 0}`}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-xs ${statusColors[phase.status as keyof typeof statusColors]}`}
                    >
                      {statusLabels[phase.status as keyof typeof statusLabels]}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
              <div className="flex gap-4">
                {program && (
                  <AddPhaseDialog
                    program={program}
                    onPhaseAdded={(newPhaseId) => setActivePhaseId(newPhaseId)}
                  />
                )}
              </div>
            </div>

            {activePhase && (
              <TabsContent
                key={activePhase.id ?? 0}
                value={(activePhase.id ?? 0).toString()}
                className="space-y-4"
              >
                <PhaseTabContent
                  phase={activePhase as ProgramPhase}
                  program={program}
                  programValidation={programValidation}
                />
              </TabsContent>
            )}
          </Tabs>
        )}
      </div>
    </div>
  );
}

interface AddPhaseSheetProps {
  program: ProgramDetailResponseData;
  onPhaseAdded: (phaseId: number) => void;
}

function AddPhaseDialog({ program, onPhaseAdded }: AddPhaseSheetProps) {
  const [open, setOpen] = useState(false);
  const [phaseName, setPhaseName] = useState("");
  const [activatePhase, setActivatePhase] = useState(false);

  const createPhaseMutation = useCreatePhase();

  const handleSubmit = () => {
    if (!phaseName) return;

    createPhaseMutation.mutate(
      {
        programId: program.id,
        phaseData: {
          name: phaseName,
          activate: activatePhase,
        },
      },
      {
        onSuccess: (newPhase) => {
          onPhaseAdded(newPhase.id);
          setOpen(false);
          setPhaseName("");
          setActivatePhase(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <IconPlus className="h-4 w-4 mr-2" />
          Add Assessment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Add New Assessment</DialogTitle>
        <DialogDescription>
          Create a new assessment for this program. You can optionally make it
          the active assessment.
        </DialogDescription>

        <div className="flex-1 overflow-y-auto space-y-4 py-6">
          <div>
            <Label htmlFor="new-phase-name" className="mb-2">
              Assessment Name (Optional)
            </Label>
            <Input
              id="new-phase-name"
              value={phaseName}
              placeholder="e.g., Initial Assessment, 60-Day Review"
              onChange={(e) => setPhaseName(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="activate-phase"
              checked={activatePhase}
              onCheckedChange={(checked) =>
                setActivatePhase(checked as boolean)
              }
            />
            <Label htmlFor="activate-phase" className="text-sm font-normal">
              Make this the active phase (update program to this phase)
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={createPhaseMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createPhaseMutation.isPending}
          >
            {createPhaseMutation.isPending ? "Creating..." : "Create Phase"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
