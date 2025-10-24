import { Card, CardHeader, CardContent } from "@/components/ui/card";
import type { ProgramPhase } from "@/types/program";
import { useUpdatePhase } from "@/hooks/useProgram";
import { InlineFieldEditor } from "@/components/ui/inline-field-editor";
import {
  InlineSelectEditor,
  type SelectOption,
} from "@/components/ui/inline-select-editor";
import { InlineDateEditor } from "@/components/ui/inline-date-editor";
import {
  IconCalendarEvent,
  IconLoader,
  IconCircleCheckFilled,
  IconArchive,
} from "@tabler/icons-react";

interface PhaseDetailsProps {
  phase: ProgramPhase;
}

const statusOptions: SelectOption[] = [
  {
    value: "scheduled",
    label: "Scheduled",
    icon: <IconCalendarEvent className="h-4 w-4 text-blue-500" />,
  },
  {
    value: "in_progress",
    label: "In Progress",
    icon: <IconLoader className="h-4 w-4 text-yellow-500" />,
  },
  {
    value: "completed",
    label: "Completed",
    icon: (
      <IconCircleCheckFilled className="h-4 w-4 fill-green-500 dark:fill-green-400" />
    ),
  },
  {
    value: "archived",
    label: "Archived",
    icon: <IconArchive className="h-4 w-4 text-gray-500" />,
  },
];

export function PhaseDetails({ phase }: PhaseDetailsProps) {
  const updatePhaseMutation = useUpdatePhase();

  const handleUpdateField = async (
    field: keyof ProgramPhase,
    value: string | null
  ) => {
    await updatePhaseMutation.mutateAsync({
      programId: phase.program_id,
      phaseId: phase.id,
      updateData: { [field]: value },
    });
  };

  return (
    <Card className="shadow-none border-none">
      <CardHeader>
        <h3 className="text-lg font-medium">Assessment Details</h3>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-4 gap-6">
          {/* Name Field */}
          <InlineFieldEditor
            label="Assessment Name"
            value={phase.name || `Assessment ${phase.sequence_number}`}
            placeholder="Enter assessment name"
            onSave={(value) => handleUpdateField("name", value)}
          />

          {/* Status Field */}
          <InlineSelectEditor
            label="Status"
            value={phase.status}
            options={statusOptions}
            onSave={(value) => handleUpdateField("status", value)}
          />

          {/* Date Fields */}
          <InlineDateEditor
            label="Planned Start Date"
            value={phase.planned_start_date}
            placeholder="Select planned start date"
            onSave={(value) => handleUpdateField("planned_start_date", value)}
          />

          <InlineDateEditor
            label="Actual Start Date"
            value={phase.actual_start_date}
            placeholder="Select actual start date"
            onSave={(value) => handleUpdateField("actual_start_date", value)}
          />

          <InlineDateEditor
            label="Planned End Date"
            value={phase.planned_end_date}
            placeholder="Select planned end date"
            onSave={(value) => handleUpdateField("planned_end_date", value)}
          />

          <InlineDateEditor
            label="Actual End Date"
            value={phase.actual_end_date}
            placeholder="Select actual end date"
            onSave={(value) => handleUpdateField("actual_end_date", value)}
          />

          {/* Notes Field - Full Width */}
          <div className="col-span-2">
            <InlineFieldEditor
              label="Notes"
              value={phase.notes || ""}
              placeholder="Add notes about this assessment phase"
              type="textarea"
              onSave={(value) => handleUpdateField("notes", value || null)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
