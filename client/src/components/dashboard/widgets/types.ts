import type { WidgetConfig } from "@/types/api/dashboard";

export interface WidgetComponentProps {
  config?: WidgetConfig;
}

export interface Widget {
  id: string;
  title: string;
  category: string;
  component: React.ComponentType<WidgetComponentProps>;
  defaultSize: {
    w: number;
    h: number;
    maxW?: number;
    maxH?: number;
    minW?: number;
    minH?: number;
  };
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  disabled?: boolean; // Optional disabled flag
}