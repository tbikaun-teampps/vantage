import { Button } from "@/components/ui/button";
import type { WidgetComponentProps } from "./types";
import { CardContent } from "@/components/ui/card";
import { IconExternalLink, IconEye, IconPencil } from "@tabler/icons-react";

type EntityType = "interviews" | "assessments" | "programs";

interface ActionItem {
  label: string;
  onClick: () => void;
  icon: React.ReactNode;
}

const ACTION_SETS: Record<EntityType, ActionItem[]> = {
  interviews: [
    {
      label: "Create Interview",
      onClick: () => console.log("Create Interview"),
      icon: <IconPencil />,
    },
    {
      label: "View Interviews",
      onClick: () => console.log("View Interviews"),
      icon: <IconEye />,
    },
    {
      label: "View Questionnaires",
      onClick: () => console.log("View Questionnaires"),
      icon: <IconEye />,
    },
  ],
  assessments: [
    {
      label: "Create Onsite Assessment",
      onClick: () => console.log("Create Onsite Assessment"),
      icon: <IconPencil />,
    },
    {
      label: "Create Desktop Assessment",
      onClick: () => console.log("Create Desktop Assessment"),
      icon: <IconPencil />,
    },
    {
      label: "View Assessments",
      onClick: () => console.log("View Results"),

      icon: <IconEye />,
    },
  ],
  programs: [
    {
      label: "Create Program",
      onClick: () => console.log("Create Program"),
      icon: <IconPencil />,
    },
    {
      label: "View Programs",
      onClick: () => console.log("View Programs"),
      icon: <IconEye />,
    },
  ],
};

const ActionsWidget: React.FC<WidgetComponentProps> = ({ config }) => {
  const currentEntityType = config?.entity?.entityType || "assessments";
  const actions = ACTION_SETS[currentEntityType];

  return (
    <CardContent className="pt-0 flex-1 min-h-0">
      <div className="space-y-2">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            className="w-full cursor-pointer"
            onClick={action.onClick}
          >
            {action.icon}
            <div className="flex-1 text-left truncate">{action.label}</div>
            <IconExternalLink className="ml-2" />
          </Button>
        ))}
      </div>
    </CardContent>
  );
};

export default ActionsWidget;
