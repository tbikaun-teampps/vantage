import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  availableWidgets,
  type Widget,
} from "@/components/dashboard/widgets";
import type { WidgetType } from "../widgets/types";

interface AddWidgetsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWidget: (widgetType: WidgetType) => void;
}

export const AddWidgetsDialog: React.FC<AddWidgetsDialogProps> = ({
  isOpen,
  onClose,
  onAddWidget,
}) => {
  // Group widgets by category
  const widgetsByCategory = availableWidgets.reduce(
    (acc: Record<string, Widget[]>, widget: Widget) => {
      if (!acc[widget.category]) acc[widget.category] = [];
      acc[widget.category].push(widget);
      return acc;
    },
    {} as Record<string, Widget[]>
  );

  const handleAddWidget = (widgetType: WidgetType) => {
    onAddWidget(widgetType);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Widget</DialogTitle>
          <DialogDescription>
            Choose a widget to add to your dashboard
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {Object.entries(widgetsByCategory).map(([category, widgets]) => (
            <div key={category}>
              <h4 className="font-medium text-sm text-muted-foreground mb-3">
                {category}
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {widgets.map((widget: Widget) => (
                  <button
                    key={widget.id}
                    onClick={() => !widget.disabled && handleAddWidget(widget.id as WidgetType)}
                    disabled={widget.disabled}
                    className={`p-4 bg-card text-left border border-border rounded-lg transition-colors ${
                      widget.disabled
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-muted/50 hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <widget.icon
                        size={20}
                        className="text-muted-foreground mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">
                          {widget.title}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {widget.description}
                        </div>
                      </div>
                      {widget.disabled ? (
                        <Badge variant="secondary" className="flex-shrink-0">
                          Coming Soon
                        </Badge>
                      ) : (
                        <Plus
                          size={16}
                          className="text-muted-foreground flex-shrink-0"
                        />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
