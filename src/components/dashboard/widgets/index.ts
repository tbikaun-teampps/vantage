import { BarChart3, Activity, Clock, Zap, Table } from "lucide-react";
import MetricWidget from "./MetricWidget";
import ChartWidget from "./ChartWidget";
import ActivityWidget from "./ActivityWidget";
import ActionsWidget from "./ActionsWidget";
import type { Widget, WidgetType } from "./types";
import TableWidget from "./TableWidget";

export const availableWidgets: Widget[] = [
  {
    id: "metric",
    title: "Key Metric",
    category: "Analytics",
    component: MetricWidget,
    defaultSize: { w: 4, h: 3, maxW: 6, maxH: 4, minW: 3, minH: 3 },
    description: "Display key performance metric",
    icon: BarChart3,
  },
  {
    id: "chart",
    title: "Analytics Chart",
    category: "Analytics",
    component: ChartWidget,
    defaultSize: { w: 8, h: 5, maxW: 12, maxH: 8, minW: 6, minH: 4 },
    description: "Interactive analytics visualization",
    icon: Activity,
    disabled: true, // Disabled for now
  },
  {
    id: "table",
    title: "Analytics Table",
    category: "Analytics",
    component: TableWidget,
    defaultSize: { w: 8, h: 5, maxW: 12, maxH: 8, minW: 6, minH: 4 },
    description: "Tabular data representation",
    icon: Table,
  },
  {
    id: "activity",
    title: "Activity",
    category: "Monitoring",
    component: ActivityWidget,
    defaultSize: { w: 3, h: 4, maxW: 4, maxH: 5, minW: 3, minH: 4 },
    description: "Show recent system activity",
    icon: Clock,
  },
  {
    id: "actions",
    title: "Quick Actions",
    category: "Actions",
    component: ActionsWidget,
    defaultSize: { w: 4, h: 3, maxW: 4, maxH: 3, minW: 2, minH: 3 },
    description: "Common action shortcuts",
    icon: Zap,
  },
];

// Helper function to get widget by ID
export const getWidget = (widgetId: WidgetType) =>
  availableWidgets.find((w) => w.id === widgetId);

// Export types and components
export { WidgetContainer } from "./WidgetContainer";
