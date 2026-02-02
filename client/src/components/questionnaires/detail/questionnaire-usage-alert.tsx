import { Alert, AlertDescription } from "@/components/ui/alert";
import { IconLock } from "@tabler/icons-react";
import type { CheckQuestionnaireUsageResponseData } from "@/types/api/questionnaire";

interface QuestionnaireUsageAlertProps {
  questionnaireUsage: CheckQuestionnaireUsageResponseData;
}

export function QuestionnaireUsageAlert({
  questionnaireUsage,
}: QuestionnaireUsageAlertProps) {
  const { assessmentCount, interviewCount, programCount } = questionnaireUsage;

  // Don't show alert if nothing is using the questionnaire
  if (assessmentCount === 0 && interviewCount === 0 && programCount === 0) {
    return null;
  }

  // Build usage description conditionally
  const usageParts = [];

  if (assessmentCount > 0) {
    usageParts.push(
      `${assessmentCount} assessment${assessmentCount !== 1 ? "s" : ""}`
    );
  }

  if (interviewCount > 0) {
    usageParts.push(
      `${interviewCount} interview${interviewCount !== 1 ? "s" : ""}`
    );
  }

  if (programCount > 0) {
    usageParts.push(`${programCount} program${programCount !== 1 ? "s" : ""}`);
  }

  const usageText =
    usageParts.length > 1
      ? usageParts.slice(0, -1).join(", ") + " and " + usageParts.slice(-1)
      : usageParts[0];

  return (
    <Alert className="bg-amber-100 text-amber-800 dark:bg-amber-900/10 dark:text-amber-400 border-none">
      <IconLock className="h-4 w-4" />
      <AlertDescription className="text-amber-800 dark:text-amber-400">
        This questionnaire is currently in use by {usageText}. You can edit the
        name, description, status, and guidelines, but structural changes
        (adding/editing questions or rating scales) are locked. To make
        structural changes, duplicate this questionnaire or remove it from all
        linked entities.
      </AlertDescription>
    </Alert>
  );
}
