import { useState, useCallback, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import {
  IconPlus,
  IconCheck,
  IconLoader2,
  IconTrash,
} from "@tabler/icons-react";
import {
  useUpdatePhase,
  useCreatePhase,
  useDeletePhase,
} from "@/hooks/useProgram";
import type { ProgramWithRelations, ProgramPhase } from "@/types/program";
import { Interviews } from "./interviews";
import { useProgramValidation } from "@/hooks/useProgramValidation";
// import { CalculatedMetrics } from "@/components/metrics/calculated-metrics";
import { DeletePhaseConfirmationDialog } from "./delete-phase-confirmation-dialog";
import { PhaseDetails } from "./phase-details";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTrigger,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface ManageTabPops {
  program?: ProgramWithRelations;
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
  program?: ProgramWithRelations;
  programValidation: ReturnType<typeof useProgramValidation>;
  onEditPhase: (phase: ProgramPhase) => void;
}

function PhaseTabContent({
  phase,
  program,
  programValidation,
  onEditPhase,
}: PhaseTabContentProps) {
  return (
    <>
      <PhaseDetails phase={phase} onEditPhase={onEditPhase} />

      {program && (
        <>
          <Interviews
            programId={program.id}
            programPhaseId={phase.id}
            disabled={!programValidation.canCreatePresiteInterviews}
            disabledReason={programValidation.presiteQuestionnaire.reason}
            questionnaireId={program.presite_questionnaire?.id}
            hasQuestionnaire={!!program.presite_questionnaire}
            interviewType="presite"
          />
          <Interviews
            programId={program.id}
            programPhaseId={phase.id}
            disabled={!programValidation.canCreateOnsiteAssessments}
            disabledReason={programValidation.onsiteQuestionnaire.reason}
            hasQuestionnaire={!!program.onsite_questionnaire}
            questionnaireId={program.onsite_questionnaire?.id}
            interviewType="onsite"
          />
          {/* <CalculatedMetrics
            programId={program.id}
            programPhaseId={phase.id}
            companyId={program.company_id}
            title="Desktop Analysis Measurements"
            description="Calculated values for this assessment in the program"
          /> */}
        </>
      )}
    </>
  );
}

export function ManageTab({ program }: ManageTabPops) {
  const [selectedPhaseForManagement, setSelectedPhaseForManagement] =
    useState<ProgramPhase | null>(null);

  const phases = useMemo(
    () =>
      program?.phases?.sort((a, b) => a.sequence_number - b.sequence_number) ||
      [],
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

  const programValidation = useProgramValidation(program || null);

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
                    key={phase.id}
                    value={phase.id.toString()}
                    className="flex items-center gap-2"
                  >
                    <span>
                      {phase.name || `Phase ${phase.sequence_number}`}
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
                key={activePhase.id}
                value={activePhase.id.toString()}
                className="space-y-4"
              >
                <PhaseTabContent
                  phase={activePhase}
                  program={program}
                  programValidation={programValidation}
                  onEditPhase={setSelectedPhaseForManagement}
                />
              </TabsContent>
            )}
          </Tabs>
        )}
      </div>

      {selectedPhaseForManagement && program && (
        <PhaseManagementSheet
          phase={selectedPhaseForManagement}
          program={program!}
          programValidation={programValidation}
          onClose={() => setSelectedPhaseForManagement(null)}
        />
      )}
    </div>
  );
}

interface PhaseManagementSheetProps {
  phase: ProgramPhase;
  program: ProgramWithRelations;
  programValidation: ReturnType<typeof useProgramValidation>;
  onClose: () => void;
}

function PhaseManagementSheet({ phase, onClose }: PhaseManagementSheetProps) {
  const updatePhaseMutation = useUpdatePhase();
  const deletePhaseMutation = useDeletePhase();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: phase.name || "",
    notes: phase.notes || "",
    planned_start_date: phase.planned_start_date
      ? new Date(phase.planned_start_date).toISOString().split("T")[0]
      : "",
    actual_start_date: phase.actual_start_date
      ? new Date(phase.actual_start_date).toISOString().split("T")[0]
      : "",
    planned_end_date: phase.planned_end_date
      ? new Date(phase.planned_end_date).toISOString().split("T")[0]
      : "",
    actual_end_date: phase.actual_end_date
      ? new Date(phase.actual_end_date).toISOString().split("T")[0]
      : "",
  });

  const handleStatusChange = useCallback(
    (status: string) => {
      updatePhaseMutation.mutate({
        phaseId: phase.id,
        updateData: {
          status: status as
            | "scheduled"
            | "in_progress"
            | "completed"
            | "archived",
        },
      });
    },
    [phase.id, updatePhaseMutation]
  );

  const handleSave = async () => {
    try {
      await updatePhaseMutation.mutateAsync({
        phaseId: phase.id,
        updateData: {
          name: formData.name || null,
          notes: formData.notes || null,
          planned_start_date: formData.planned_start_date || null,
          actual_start_date: formData.actual_start_date || null,
          planned_end_date: formData.planned_end_date || null,
          actual_end_date: formData.actual_end_date || null,
        },
      });
      onClose();
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const handleDelete = () => {
    deletePhaseMutation.mutate(phase.id, {
      onSuccess: () => {
        setShowDeleteDialog(false);
        onClose();
      },
    });
  };

  const isDirty =
    formData.name !== (phase.name || "") ||
    formData.notes !== (phase.notes || "") ||
    formData.planned_start_date !==
      (phase.planned_start_date
        ? new Date(phase.planned_start_date).toISOString().split("T")[0]
        : "") ||
    formData.actual_start_date !==
      (phase.actual_start_date
        ? new Date(phase.actual_start_date).toISOString().split("T")[0]
        : "") ||
    formData.planned_end_date !==
      (phase.planned_end_date
        ? new Date(phase.planned_end_date).toISOString().split("T")[0]
        : "") ||
    formData.actual_end_date !==
      (phase.actual_end_date
        ? new Date(phase.actual_end_date).toISOString().split("T")[0]
        : "");

  return (
    <Sheet open={true} onOpenChange={() => onClose()}>
      <SheetContent side="right" className="w-[800px] sm:max-w-[800px]">
        <SheetHeader>
          <SheetTitle>
            Manage {phase.name || `${phase.sequence_number}`} Assessment
          </SheetTitle>
          <SheetDescription>Edit assessment details.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-6 px-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phase-name">Assessment Name</Label>
                <Input
                  id="phase-name"
                  value={formData.name}
                  placeholder={`Phase ${phase.sequence_number}`}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phase-status">Status</Label>
                <Select value={phase.status} onValueChange={handleStatusChange}>
                  <SelectTrigger id="phase-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="planned-start">Planned Start Date</Label>
                <Input
                  id="planned-start"
                  type="date"
                  value={formData.planned_start_date}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      planned_start_date: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="actual-start">Actual Start Date</Label>
                <Input
                  id="actual-start"
                  type="date"
                  value={formData.actual_start_date}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      actual_start_date: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="planned-end">Planned End Date</Label>
                <Input
                  id="planned-end"
                  type="date"
                  value={formData.planned_end_date}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      planned_end_date: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="actual-end">Actual End Date</Label>
                <Input
                  id="actual-end"
                  type="date"
                  value={formData.actual_end_date}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      actual_end_date: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phase-notes">Notes</Label>
              <Textarea
                id="phase-notes"
                value={formData.notes}
                placeholder="Add notes about this assessment..."
                rows={3}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
              />
            </div>
          </div>
        </div>

        <SheetFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <IconTrash className="h-4 w-4 mr-2" />
            Delete Assessment
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!isDirty || updatePhaseMutation.isPending}
            >
              {updatePhaseMutation.isPending ? (
                <IconLoader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <IconCheck className="h-4 w-4 mr-2" />
              )}
              {updatePhaseMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </SheetFooter>

        <DeletePhaseConfirmationDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          phase={phase}
          onConfirm={handleDelete}
          isDeleting={deletePhaseMutation.isPending}
        />
      </SheetContent>
    </Sheet>
  );
}

interface AddPhaseSheetProps {
  program: ProgramWithRelations;
  onPhaseAdded: (phaseId: number) => void;
}

function AddPhaseDialog({ program, onPhaseAdded }: AddPhaseSheetProps) {
  const [open, setOpen] = useState(false);
  const [phaseName, setPhaseName] = useState("");
  const [activatePhase, setActivatePhase] = useState(false);

  const createPhaseMutation = useCreatePhase();

  const nextSequenceNumber =
    Math.max(...(program.phases?.map((p) => p.sequence_number) || [-1])) + 1;

  const handleSubmit = () => {
    createPhaseMutation.mutate(
      {
        programId: program.id,
        phaseData: {
          name: phaseName || null,
          sequence_number: nextSequenceNumber,
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
              placeholder={`Phase ${nextSequenceNumber}`}
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
