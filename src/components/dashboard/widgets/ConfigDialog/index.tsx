import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React, { useState } from "react";
import type { WidgetType } from "../types";
import type { WidgetConfig } from "@/hooks/useDashboardLayouts";
import { MetricConfigurationForm } from "./MetricConfig";
import { ActionsWidgetConfig } from "./ActionsConfig";
import { ActivityWidgetConfig } from "./ActivityConfig";
import { TableWidgetConfig } from "./TableConfig";

interface ConfigDialogProps {
  isOpen: boolean;
  widgetId: string;
  widgetType: WidgetType;
  config?: WidgetConfig;
  onClose: () => void;
  onSave?: (widgetId: string, config: WidgetConfig) => void;
}

export function ConfigDialog({
  isOpen,
  widgetId,
  widgetType,
  config,
  onClose,
  onSave,
}: ConfigDialogProps) {
  const [pendingConfig, setPendingConfig] = useState<WidgetConfig | null>(null);

  const handleSave = () => {
    if (pendingConfig && onSave) {
      onSave(widgetId, pendingConfig);
    }
    onClose();
  };

  const renderConfigComponent = () => {
    switch (widgetType) {
      case "metric":
        return (
          <MetricConfigurationForm
            config={config?.metric}
            onConfigChange={setPendingConfig}
          />
        );
      case "actions":
        return (
          <ActionsWidgetConfig
            config={config?.entity}
            onConfigChange={setPendingConfig}
          />
        );
      case "activity":
        return (
          <ActivityWidgetConfig
            config={config?.entity}
            currentScope={config?.scope}
            onConfigChange={setPendingConfig}
          />
        );
      case "chart":
        return <div>Chart Widget Config Placeholder</div>;
      case "table":
        return (
          <TableWidgetConfig
            config={config?.table}
            currentScope={config?.scope}
            onConfigChange={setPendingConfig}
          />
        );
      default:
        return <div>No configuration available for this widget.</div>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Configure{" "}
            {widgetType
              ? widgetType.charAt(0).toUpperCase() + widgetType.slice(1)
              : ""}{" "}
            Widget
          </DialogTitle>
        </DialogHeader>
        {renderConfigComponent()}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!pendingConfig}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
