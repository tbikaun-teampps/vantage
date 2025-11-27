import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { QuestionnaireStatusEnum } from "@/types/api/questionnaire";

interface StatusBadgeProps {
  status: QuestionnaireStatusEnum;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const statusConfig = {
  draft: {
    label: "Draft",
    variant: "secondary" as const,
    className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700",
  },
  under_review: {
    label: "Under Review",
    variant: "secondary" as const,
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/30",
  },
  published: {
    label: "Published",
    variant: "secondary" as const,
    className: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/30",
  },
  archived: {
    label: "Archived",
    variant: "secondary" as const,
    className: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/30",
  },
};

export function StatusBadge({ status, onClick, disabled, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  if (onClick && !disabled) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "h-auto px-3 py-1 rounded-full font-medium text-xs transition-colors",
          config.className,
          className
        )}
      >
        {config.label}
      </Button>
    );
  }

  return (
    <Badge
      variant={config.variant}
      className={cn(
        config.className,
        "font-medium",
        className
      )}
    >
      {config.label}
    </Badge>
  );
}

export function getStatusTransitions(currentStatus: QuestionnaireStatusEnum): Array<{
  status: QuestionnaireStatusEnum;
  label: string;
  description: string;
}> {
  switch (currentStatus) {
    case "draft":
      return [
        {
          status: "under_review",
          label: "Submit for Review",
          description: "Send questionnaire for review and approval",
        },
        {
          status: "published",
          label: "Publish Directly",
          description: "Make questionnaire published and available for use",
        },
      ];
    case "under_review":
      return [
        {
          status: "draft",
          label: "Return to Draft",
          description: "Move back to draft for further editing",
        },
        {
          status: "published",
          label: "Approve & Publish",
          description: "Approve and make questionnaire published",
        },
      ];
    case "published":
      return [
        {
          status: "archived",
          label: "Archive",
          description: "Archive questionnaire (can be reactivated later)",
        },
      ];
    case "archived":
      return [
        {
          status: "published",
          label: "Reactivate",
          description: "Make questionnaire published again",
        },
      ];
    default:
      return [];
  }
}