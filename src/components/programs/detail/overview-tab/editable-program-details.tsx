import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { InlineFieldEditor } from "@/components/ui/inline-field-editor";
import { InlineSelectEditor } from "@/components/ui/inline-select-editor";
import type { SelectOption } from "@/components/ui/inline-select-editor";
import {
  IconCalendar,
  IconTarget,
  IconClipboardList,
  IconCircleCheckFilled,
  IconClock,
  IconPencil,
  IconEye,
  IconArchive,
} from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import type { ProgramDetailResponseData } from "@/types/api/programs";

interface EditableProgramDetailsProps {
  program: ProgramDetailResponseData;
  onUpdate: (data: {
    name?: string;
    description?: string;
    status?: string;
  }) => Promise<void>;
}

export function EditableProgramDetails({
  program,
  onUpdate,
}: EditableProgramDetailsProps) {
  // Validation functions
  const validateName = (value: string): string | null => {
    if (!value || value.trim().length === 0) {
      return "Name is required";
    }
    if (value.length > 255) {
      return "Name must be less than 255 characters";
    }
    return null;
  };

  const validateDescription = (value: string): string | null => {
    if (value && value.length > 1000) {
      return "Description must be less than 1000 characters";
    }
    return null;
  };

  // Individual field update handlers
  const handleNameSave = async (newValue: string) => {
    await onUpdate({ name: newValue });
  };

  const handleStatusSave = async (newValue: string) => {
    await onUpdate({ status: newValue });
  };

  const handleDescriptionSave = async (newValue: string) => {
    await onUpdate({ description: newValue });
  };

  // Status icon helper
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <IconCircleCheckFilled className="h-4 w-4 text-green-500" />;
      case "active":
        return <IconClock className="h-4 w-4 text-blue-500" />;
      case "draft":
        return <IconPencil className="h-4 w-4 text-red-500" />;
      case "under_review":
        return <IconEye className="h-4 w-4 text-yellow-500" />;
      case "archived":
        return <IconArchive className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  // Status options with icons
  const statusOptions: SelectOption[] = [
    {
      value: "draft",
      label: "Draft",
      icon: getStatusIcon("draft"),
    },
    {
      value: "active",
      label: "Active",
      icon: getStatusIcon("active"),
    },
    {
      value: "under_review",
      label: "Under Review",
      icon: getStatusIcon("under_review"),
    },
    {
      value: "completed",
      label: "Completed",
      icon: getStatusIcon("completed"),
    },
    {
      value: "archived",
      label: "Archived",
      icon: getStatusIcon("archived"),
    },
  ];

  return (
    <Card className="shadow-none border-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconTarget className="h-5 w-5" />
          Program Details
        </CardTitle>
        <CardDescription>Basic information about this program</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Row 1: Program Name + Status */}
          <div className="grid gap-4 md:grid-cols-2">
            <InlineFieldEditor
              label="Name"
              value={program.name}
              placeholder="Enter program name"
              type="input"
              onSave={handleNameSave}
              validation={validateName}
              maxLength={255}
            />

            <InlineSelectEditor
              label="Status"
              value={program.status}
              options={statusOptions}
              placeholder="Select status"
              onSave={handleStatusSave}
            />
          </div>

          {/* Row 2: Description */}
          <InlineFieldEditor
            label="Description"
            value={program.description || ""}
            placeholder="Enter program description (optional)"
            type="textarea"
            onSave={handleDescriptionSave}
            validation={validateDescription}
            maxLength={1000}
            minRows={3}
          />

          {/* Row 3: Read-only fields */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Created</Label>
              <div className="flex items-center gap-2">
                <IconCalendar className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">
                  {formatDistanceToNow(new Date(program.created_at), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Current Sequence Number
              </Label>
              <p className="text-sm">
                {program.current_sequence_number || "-"}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Linked Self-Audit Questionnaire
              </Label>
              <div className="flex items-center gap-2">
                <IconClipboardList className="h-4 w-4 text-muted-foreground" />
                {program.presite_questionnaire ? (
                  <p className="text-sm">
                    {program.presite_questionnaire.name}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No self-audit questionnaire linked
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Linked Onsite-Audit Questionnaire
              </Label>
              <div className="flex items-center gap-2">
                <IconClipboardList className="h-4 w-4 text-muted-foreground" />
                {program.onsite_questionnaire ? (
                  <p className="text-sm">{program.onsite_questionnaire.name}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No onsite questionnaire linked
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
