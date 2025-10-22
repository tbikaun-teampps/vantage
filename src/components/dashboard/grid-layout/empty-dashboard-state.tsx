import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface EmptyDashboardStateProps {
  onAddWidgets: () => void;
}

export const EmptyDashboardState: React.FC<EmptyDashboardStateProps> = ({
  onAddWidgets,
}) => {
  return (
    <div className="flex items-center justify-center min-h-[400px] z-50">
      <div className="text-center max-w-md p-8 bg-card border border-border rounded-lg">
        <div className="mb-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted/30 rounded-full flex items-center justify-center">
            <Plus size={32} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Dashboard is empty</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Get started by adding widgets to track key metrics and insights.
          </p>
        </div>
        <Button onClick={onAddWidgets} className="flex items-center gap-2 mx-auto">
          <Plus size={16} />
          Add Widgets
        </Button>
      </div>
    </div>
  );
};