import type { WidgetComponentProps } from "./types";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type EntityType = "interviews" | "assessments" | "programs";

interface ActionItem {
  label: string;
  onClick: () => void;
}

const ACTION_SETS: Record<EntityType, ActionItem[]> = {
  interviews: [
    {
      label: "Create Interview",
      onClick: () => console.log("Create Interview"),
    },
    {
      label: "View Interviews",
      onClick: () => console.log("View Interviews"),
    },
    {
      label: "View Questionnaires",
      onClick: () => console.log("View Questionnaires"),
    },
  ],
  assessments: [
    {
      label: "Create Onsite Assessment",
      onClick: () => console.log("Create Onsite Assessment"),
    },
    {
      label: "Create Desktop Assessment",
      onClick: () => console.log("Create Desktop Assessment"),
    },
    { label: "View Assessments", onClick: () => console.log("View Results") },
  ],
  programs: [
    { label: "Create Program", onClick: () => console.log("Create Program") },
    { label: "View Programs", onClick: () => console.log("View Programs") },
  ],
};

const ActionsWidget: React.FC<WidgetComponentProps> = ({ config }) => {
  const currentEntityType = config?.entity?.entityType || "assessments";
  const actions = ACTION_SETS[currentEntityType];

  return (
    <>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 flex-1 min-h-0">
        <div className="space-y-2">
          {actions.map((action, index) => (
            <button
              key={index}
              className="w-full text-left text-sm p-2 hover:bg-muted/50 rounded"
              onClick={action.onClick}
            >
              {action.label}
            </button>
          ))}
        </div>
      </CardContent>
    </>
  );
};

export default ActionsWidget;
