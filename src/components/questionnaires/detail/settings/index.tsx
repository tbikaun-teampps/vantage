import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconCheck, IconCopy, IconTrash } from "@tabler/icons-react";
import { AlertTriangle } from "lucide-react";
import SettingsForm from "./settings-form";
import { useCanAdmin } from "@/hooks/useUserCompanyRole";
import { useQuestionnaireDetail } from "@/contexts/QuestionnaireDetailContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useCompanyRoutes } from "@/hooks/useCompanyRoutes";

export function Settings() {
  const navigate = useNavigate();
  const userCanAdmin = useCanAdmin();
  const routes = useCompanyRoutes();

  const {
    getGeneralStatus,
    questionnaireUsage,
    isProcessing,
    questionnaire,
    deleteQuestionnaire,
    duplicateQuestionnaire,
  } = useQuestionnaireDetail();

  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [deleteConfirmationText, setDeleteConfirmationText] =
    useState<string>("");

  const isDeleteAllowed =
    questionnaire && deleteConfirmationText.trim() === questionnaire.name;

  const handleDeleteQuestionnaire = async () => {
    if (!questionnaire) {
      toast.error("No questionnaire selected for deletion");
      return;
    }

    if (deleteConfirmationText.trim() !== questionnaire.name) {
      toast.error(
        "Questionnaire name does not match. Please type the exact name to confirm deletion."
      );
      return;
    }

    try {
      await deleteQuestionnaire(questionnaire.id);
      toast.success("Questionnaire deleted successfully");
      navigate(routes.questionnaires());
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete questionnaire. Please try again."
      );
    }
  };

  const openDeleteDialog = () => {
    setDeleteConfirmationText("");
    setShowDeleteDialog(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      setDeleteConfirmationText("");
    }
    setShowDeleteDialog(open);
  };

  const handleDuplicateQuestionnaire = async () => {
    if (!questionnaire) return;

    try {
      const duplicatedQuestionnaire = await duplicateQuestionnaire(
        questionnaire.id
      );
      navigate(`/questionnaires/${duplicatedQuestionnaire.id}`);
      toast.success("Questionnaire duplicated successfully");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to duplicate questionnaire. Please try again."
      );
    }
  };

  if (!questionnaire) {
    return null;
  }

  return (
    <>
      <Card
        data-tour="questionnaire-general-settings"
        className="h-full overflow-hidden border-none shadow-none max-w-[1600px] mx-auto p-0"
      >
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                General Settings
                {getGeneralStatus() === "complete" ? (
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                  >
                    <IconCheck className="h-3 w-3" />
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    <AlertTriangle className="h-3 w-3" />
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Configure basic questionnaire information
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto space-y-6">
          <SettingsForm />

          {userCanAdmin && (
            <div className="border-t pt-6 space-y-4">
              {/* Duplicate Zone */}
              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Duplicate Questionnaire
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Create a copy of this questionnaire with all its settings
                      and structure.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDuplicateQuestionnaire}
                    disabled={isProcessing}
                    className="border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    <IconCopy className="h-4 w-4 mr-2" />
                    Duplicate
                  </Button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-red-700 dark:text-red-300">
                      Danger Zone
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      Permanently delete this questionnaire and all its data.
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={openDeleteDialog}
                    disabled={isProcessing || questionnaireUsage.isInUse}
                  >
                    <IconTrash className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={showDeleteDialog}
        onOpenChange={handleDialogOpenChange}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Questionnaire</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the questionnaire{" "}
              <strong className="select-text">{questionnaire.name}</strong>
              ?
              <br />
              <br />
              <strong>This action is permanent and cannot be undone</strong>. It
              will remove all associated data, including any child nodes.
              <br />
              <br />
              To confirm, please type the questionnaire name below:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div>
            <Label
              htmlFor="delete-confirmation"
              className="text-sm font-medium"
            >
              Questionnaire name
            </Label>
            <Input
              id="delete-confirmation"
              type="text"
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              placeholder={questionnaire.name}
              className="mt-1"
              disabled={isProcessing}
              onKeyDown={(e) => {
                if (e.key === "Enter" && isDeleteAllowed) {
                  handleDeleteQuestionnaire();
                }
              }}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteQuestionnaire}
              disabled={
                !isDeleteAllowed || isProcessing || questionnaireUsage?.isInUse
              }
              className="bg-destructive  hover:bg-destructive/90"
            >
              {isProcessing ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
