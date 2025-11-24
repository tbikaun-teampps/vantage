import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import {
  IconPlus,
  IconClock,
  IconProgress,
  IconCircleCheck,
  IconArchive
} from "@tabler/icons-react";
import { formatDistanceToNow, format, addWeeks, addMonths } from "date-fns";
import { useCreatePhase, useDeletePhase } from "@/hooks/useProgram";
import { Interviews } from "./interviews";
import { useProgramValidation } from "@/hooks/useProgramValidation";
import { CalculatedMeasurements } from "@/components/measurements/calculated-measurements";
import { PhaseDetails } from "./phase-details";
import { DeletePhaseConfirmationDialog } from "./delete-phase-confirmation-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTrigger,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { GetProgramByIdResponseData, ProgramPhase } from "@/types/api/programs";

interface ManageTabProps {
  program: GetProgramByIdResponseData;
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

const statusIcons = {
  scheduled: IconClock,
  in_progress: IconProgress,
  completed: IconCircleCheck,
  archived: IconArchive,
} as const;

interface PhaseTabContentProps {
  phase: ProgramPhase;
  program: GetProgramByIdResponseData;
  programValidation: ReturnType<typeof useProgramValidation>;
}

function PhaseTabContent({
  phase,
  program,
  programValidation,
}: PhaseTabContentProps) {
  if (!phase) {
    return (
      <p className="text-muted-foreground">
        No program assessment data available.
      </p>
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
      {/* <div className="shadow-none text-center border-dashed border-2 border-border m-4 rounded-lg bg-background">
        <div className="p-8">
          <div className="text-center py-8">
            <IconSettings className="mx-auto mb-4 h-8 w-8 text-muted-foreground" />
            <div className="text-muted-foreground text-sm">
              Interview and measurement management features will be available once the program has
              been set up. Navigate to the <strong>Setup</strong> tab to configure the program.
            </div>
          </div>
        </div>
      </div> */}
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

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const deletePhaseMutation = useDeletePhase();

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (activePhase && program && activePhase.id) {
      deletePhaseMutation.mutate(
        { programId: program.id, phaseId: activePhase.id },
        {
          onSuccess: () => {
            setShowDeleteDialog(false);
            // activePhaseId will auto-update via validActivePhaseId useMemo
          },
        }
      );
    }
  };

  return (
    <div className="relative h-full w-full">
      <SidebarProvider>
        <div className="absolute inset-0 flex">
          <Sidebar className="border-r bg-transparent" collapsible="none">
            <SidebarContent className="px-2 py-4">
              {program && (
                <AddPhaseDialog
                  program={program}
                  onPhaseAdded={(newPhaseId) => setActivePhaseId(newPhaseId)}
                />
              )}
              {phases.length === 0 ? (
                <div className="p-2">
                  <p className="text-sm text-muted-foreground">
                    No assessments found for this program.
                  </p>
                </div>
              ) : (
                <SidebarMenu>
                  {phases.map((phase) => {
                    const phaseName =
                      phase.name || `Phase ${phase.sequence_number ?? 0}`;
                    return (
                      <SidebarMenuItem
                        key={phase.id ?? `phase-${phase.sequence_number}`}
                      >
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <SidebarMenuButton
                              onClick={() => setActivePhaseId(phase.id)}
                              isActive={phase.id === validActivePhaseId}
                              className="flex items-start justify-between py-3 cursor-pointer h-auto"
                            >
                              <div className="flex flex-col gap-1 min-w-0 flex-1">
                                <span className="font-medium truncate">
                                  {phaseName}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {phase.created_at &&
                                    formatDistanceToNow(
                                      new Date(phase.created_at),
                                      {
                                        addSuffix: true,
                                      }
                                    )}
                                </span>
                              </div>
                              <Badge
                                variant="outline"
                                className={`p-1 flex-shrink-0 ml-2 ${statusColors[phase.status as keyof typeof statusColors]}`}
                                title={
                                  statusLabels[
                                    phase.status as keyof typeof statusLabels
                                  ]
                                }
                              >
                                {(() => {
                                  const Icon =
                                    statusIcons[
                                      phase.status as keyof typeof statusIcons
                                    ];
                                  return <Icon className="h-3 w-3" />;
                                })()}
                              </Badge>
                            </SidebarMenuButton>
                          </TooltipTrigger>
                          <TooltipContent side="right" sideOffset={8}>
                            <div className="flex flex-col gap-1">
                              <span className="font-medium">{phaseName}</span>
                              {phase.created_at && (
                                <span className="text-xs opacity-80">
                                  {format(new Date(phase.created_at), "PPP")}
                                </span>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              )}
            </SidebarContent>
          </Sidebar>

          <main className="flex-1 overflow-y-auto">
            {activePhase ? (
              <div className="space-y-4">
                <PhaseTabContent
                  phase={activePhase as ProgramPhase}
                  program={program}
                  programValidation={programValidation}
                />

                {/* Danger Zone */}
                <div className="p-4">
                  <Card className="border-destructive/50">
                    <CardHeader>
                      <CardTitle className="text-destructive">
                        Danger Zone
                      </CardTitle>
                      <CardDescription>
                        Irreversible actions that will permanently delete this
                        assessment.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium">
                            Delete Assessment
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {phases.length === 1
                              ? "Cannot delete the only remaining assessment. Programs must have at least one assessment."
                              : "Permanently delete this assessment and all associated interviews and calculated metrics. This action cannot be undone."}
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          onClick={handleDeleteClick}
                          disabled={
                            phases.length === 1 || deletePhaseMutation.isPending
                          }
                        >
                          Delete Assessment
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">
                No program assessment data available.
              </p>
            )}
          </main>
        </div>
      </SidebarProvider>

      {activePhase && (
        <DeletePhaseConfirmationDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          phase={activePhase}
          onConfirm={handleDeleteConfirm}
          isDeleting={deletePhaseMutation.isPending}
        />
      )}
    </div>
  );
}

interface AddPhaseSheetProps {
  program: GetProgramByIdResponseData;
  onPhaseAdded: (phaseId: number) => void;
}

function AddPhaseDialog({ program, onPhaseAdded }: AddPhaseSheetProps) {
  const [open, setOpen] = useState(false);
  const [phaseName, setPhaseName] = useState("");
  const [activatePhase, setActivatePhase] = useState(false);
  const [plannedStartDate, setPlannedStartDate] = useState<Date | undefined>();
  const [plannedEndDate, setPlannedEndDate] = useState<Date | undefined>();

  const createPhaseMutation = useCreatePhase();

  // Find the previous phase (highest sequence_number) to anchor date helpers
  const previousPhase = useMemo(() => {
    if (!program.phases || program.phases.length === 0) return null;
    return [...program.phases].sort(
      (a, b) => (b.sequence_number ?? 0) - (a.sequence_number ?? 0)
    )[0];
  }, [program.phases]);

  // Get anchor date for helpers (previous phase end date or today)
  const anchorDate = useMemo(() => {
    if (previousPhase?.planned_end_date) {
      return new Date(previousPhase.planned_end_date);
    }
    return new Date();
  }, [previousPhase]);

  // Helper function to set dates based on interval
  const handleDateHelper = (weeksToAdd?: number, monthsToAdd?: number) => {
    let newStartDate = anchorDate;

    if (weeksToAdd) {
      newStartDate = addWeeks(anchorDate, weeksToAdd);
    } else if (monthsToAdd) {
      newStartDate = addMonths(anchorDate, monthsToAdd);
    }

    // Also suggest end date with the same interval
    let newEndDate = newStartDate;
    if (weeksToAdd) {
      newEndDate = addWeeks(newStartDate, weeksToAdd);
    } else if (monthsToAdd) {
      newEndDate = addMonths(newStartDate, monthsToAdd);
    }

    setPlannedStartDate(newStartDate);
    setPlannedEndDate(newEndDate);
  };

  const handleSubmit = () => {
    // Validate all required fields
    if (!phaseName || !plannedStartDate || !plannedEndDate) return;

    // Validate that end date is after start date
    if (plannedEndDate <= plannedStartDate) {
      alert("Planned end date must be after planned start date");
      return;
    }

    createPhaseMutation.mutate(
      {
        programId: program.id,
        data: {
          name: phaseName,
          activate: activatePhase,
          planned_start_date: plannedStartDate.toISOString(),
          planned_end_date: plannedEndDate.toISOString(),
        },
      },
      {
        onSuccess: (newPhase) => {
          onPhaseAdded(newPhase.id);
          setOpen(false);
          setPhaseName("");
          setActivatePhase(false);
          setPlannedStartDate(undefined);
          setPlannedEndDate(undefined);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
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

        <div className="flex-1 overflow-y-auto space-y-4">
          <div>
            <Label htmlFor="new-phase-name" className="mb-2">
              Assessment Name (Required)
            </Label>
            <Input
              id="new-phase-name"
              value={phaseName}
              placeholder="e.g., Initial Assessment, 60-Day Review"
              onChange={(e) => setPhaseName(e.target.value)}
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="planned-start-date">
                Planned Start Date (Required)
              </Label>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDateHelper(1)}
                  className="h-7 text-xs"
                >
                  +1 Week
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDateHelper(undefined, 1)}
                  className="h-7 text-xs"
                >
                  +1 Month
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDateHelper(undefined, 6)}
                  className="h-7 text-xs"
                >
                  +6 Months
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              Quick dates based on{" "}
              {previousPhase
                ? "the previous assessment's end date"
                : "today's date"}
              . Both start and end dates will be set with the selected interval.
            </p>
            <DatePicker
              date={plannedStartDate}
              setDate={setPlannedStartDate}
              placeholder="Select start date"
              disablePastDates={true}
            />
          </div>

          <div>
            <Label htmlFor="planned-end-date" className="mb-2">
              Planned End Date (Required)
            </Label>
            <DatePicker
              date={plannedEndDate}
              setDate={setPlannedEndDate}
              placeholder="Select end date"
              disablePastDates={true}
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
              Make this the active assessment (update program to this
              assessment)
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
            disabled={
              createPhaseMutation.isPending ||
              !phaseName ||
              !plannedStartDate ||
              !plannedEndDate
            }
          >
            {createPhaseMutation.isPending
              ? "Creating..."
              : "Create Assessment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
