import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { IconPencil, IconCheck, IconX } from "@tabler/icons-react";
import { toast } from "sonner";
import { useQuestionActions } from "@/hooks/questionnaire/useQuestions";
import { useAllSharedRoles } from "@/hooks/useSharedRoles";
import MultiSelect from "@/components/questionnaires/detail/questions/question-editor/multi-select";
import { useCanAdmin } from "@/hooks/useUserCompanyRole";

interface InlineRolesEditorProps {
  disabled?: boolean;
  questionId: number;
  questionRoles: Array<{
    id: number;
    shared_role_id: number;
    name: string;
    description: string | null;
  }>;
}

export function InlineRolesEditor({
  disabled = false,
  questionId,
  questionRoles,
}: InlineRolesEditorProps) {
  const userCanAdmin = useCanAdmin();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(
    questionRoles?.map((r) => r.name) || []
  );

  const { updateQuestionRoles } = useQuestionActions();
  const { data: sharedRoles = [] } = useAllSharedRoles();

  const handleEdit = () => {
    if (disabled) return;
    setIsEditing(true);
    setSelectedRoles(questionRoles?.map((r) => r.name) || []);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedRoles(questionRoles?.map((r) => r.name) || []);
  };

  const handleSave = async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);
    try {
      // Map role names to role IDs
      const selectedRoleIds = sharedRoles
        .filter((role) => selectedRoles.includes(role.name))
        .map((role) => role.id);

      await updateQuestionRoles({
        questionnaire_question_id: questionId,
        shared_role_ids: selectedRoleIds,
      });

      setIsEditing(false);
      toast.success("Applicable roles updated successfully");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update applicable roles"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="flex flex-col w-full gap-2">
        <div className="grid w-full gap-2">
          <Label htmlFor="applicable-roles">Applicable Roles</Label>
          <div id="applicable-roles" className="space-y-2">
            {questionRoles && questionRoles.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {questionRoles.map((r) => (
                  <Badge key={r.id} variant="secondary" className="text-xs">
                    {r.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="border border-border rounded p-4 text-center">
                <span className="text-sm text-muted-foreground">
                  Applicable to all roles
                </span>
              </div>
            )}
          </div>
        </div>
        {userCanAdmin && (
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="ghost"
              className="cursor-pointer"
              onClick={handleEdit}
              disabled={disabled}
            >
              <IconPencil className="h-3 w-3 mr-1" />
              Edit
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full gap-2">
      <div className="grid w-full gap-2">
        <Label htmlFor="applicable-roles">Applicable Roles</Label>
        {sharedRoles.length === 0 ? (
          <div className="border border-border rounded p-4 text-center">
            <span className="text-sm text-muted-foreground">
              No shared roles available. Create shared roles in settings first.
            </span>
          </div>
        ) : (
          <MultiSelect
            options={sharedRoles.map((role) => ({
              id: role.id,
              name: role.name,
              description: role.description,
            }))}
            value={selectedRoles}
            searchable={true}
            onChange={setSelectedRoles}
            placeholder="Click to select roles or leave empty to apply to all roles..."
            disabled={disabled || isLoading}
          />
        )}
      </div>
      <div className="flex justify-end gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleCancel}
          disabled={isLoading}
        >
          <IconX className="h-3 w-3 mr-1" />
          Cancel
        </Button>
        <Button size="sm" onClick={handleSave} disabled={isLoading}>
          <IconCheck className="h-3 w-3 mr-1" />
          {isLoading ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
