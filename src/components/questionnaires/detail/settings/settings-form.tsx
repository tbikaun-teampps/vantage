import {
  IconCircleCheckFilled,
  IconPencil,
  IconUsersGroup,
  IconArchive,
} from "@tabler/icons-react";
import { InlineFieldEditor } from "@/components/ui/inline-field-editor";
import { InlineSelectEditor } from "@/components/ui/inline-select-editor";
import type { SelectOption } from "@/components/ui/inline-select-editor";
import { useQuestionnaireActions } from "@/hooks/useQuestionnaires";
import { useQuestionnaireDetail } from "@/contexts/QuestionnaireDetailContext";

export default function SettingsForm() {
  const { updateQuestionnaire } = useQuestionnaireActions();

  const { questionnaire } = useQuestionnaireDetail();

  if (!questionnaire) {
    return null;
  }

  // Validation functions
  const validateName = (value: string): string | null => {
    if (!value || value.trim().length === 0) {
      return "Name is required";
    }
    if (value.length > 100) {
      return "Name must be less than 100 characters";
    }
    return null;
  };

  const validateDescription = (value: string): string | null => {
    if (!value || value.trim().length === 0) {
      return "Description is required";
    }
    if (value.length > 500) {
      return "Description must be less than 500 characters";
    }
    return null;
  };

  const validateGuidelines = (value: string): string | null => {
    if (value && value.length > 1000) {
      return "Guidelines must be less than 1000 characters";
    }
    return null;
  };

  // Update handlers
  const handleUpdateName = async (newValue: string) => {
    await updateQuestionnaire({
      id: questionnaire.id,
      updates: { name: newValue },
    });
  };

  const handleUpdateDescription = async (newValue: string) => {
    await updateQuestionnaire({
      id: questionnaire.id,
      updates: { description: newValue },
    });
  };

  const handleUpdateGuidelines = async (newValue: string) => {
    await updateQuestionnaire({
      id: questionnaire.id,
      updates: { guidelines: newValue },
    });
  };

  const handleUpdateStatus = async (newValue: string) => {
    await updateQuestionnaire({
      id: questionnaire.id,
      updates: {
        status: newValue as "draft" | "active" | "under_review" | "archived",
      },
    });
  };

  // Status options with icons
  const statusOptions: SelectOption[] = [
    {
      value: "draft",
      label: "Draft",
      icon: <IconPencil className="h-4 w-4 text-yellow-500" />,
    },
    {
      value: "active",
      label: "Active",
      icon: (
        <IconCircleCheckFilled className="h-4 w-4 fill-green-500 dark:fill-green-400" />
      ),
    },
    {
      value: "under_review",
      label: "Under Review",
      icon: <IconUsersGroup className="h-4 w-4 text-blue-500" />,
    },
    {
      value: "archived",
      label: "Archived",
      icon: <IconArchive className="h-4 w-4 text-gray-500" />,
    },
  ];

  return (
    <div className="space-y-6">
      <InlineFieldEditor
        label="Questionnaire Name"
        value={questionnaire.name || ""}
        placeholder="Enter questionnaire name"
        type="input"
        onSave={handleUpdateName}
        validation={validateName}
        maxLength={100}
      />

      <InlineFieldEditor
        label="Description"
        value={questionnaire.description || ""}
        placeholder="Describe the purpose and content of this questionnaire"
        type="textarea"
        onSave={handleUpdateDescription}
        validation={validateDescription}
        maxLength={500}
        minRows={3}
      />

      <InlineFieldEditor
        label="Guidelines (Optional)"
        value={questionnaire.guidelines || ""}
        placeholder="Additional guidelines or instructions for this questionnaire"
        type="textarea"
        onSave={handleUpdateGuidelines}
        validation={validateGuidelines}
        maxLength={1000}
        minRows={3}
      />

      <InlineSelectEditor
        label="Status"
        value={questionnaire.status}
        options={statusOptions}
        placeholder="Select status"
        onSave={handleUpdateStatus}
      />
    </div>
  );
}
