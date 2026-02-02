import {
  IconCalendar,
  IconChartBar,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";

interface TabSwitcherProps {
  activeTab: "overview" | "setup" | "manage" | "schedule";
  onTabChange: (
    tab: "overview" | "setup" | "manage" | "schedule"
  ) => void;
}

const tabs = [
  {
    id: "overview",
    label: "Overview",
    icon: IconChartBar,
    disabled: false,
    badge: undefined,
  },
  {
    id: "setup",
    label: "Setup",
    icon: IconSettings,
    disabled: false,
    badge: undefined,
  },
  {
    id: "manage",
    label: "Manage",
    icon: IconUsers,
    disabled: false,
    badge: undefined,
  },
  {
    id: "schedule",
    label: "Schedule",
    icon: IconCalendar,
    disabled: true,
    badge: "Coming Soon",
  },
] as const;

export function TabSwitcher({ activeTab, onTabChange }: TabSwitcherProps) {
  return (
    <div className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground gap-2 gap-2">
      {tabs.map(({ id, label, icon: Icon, disabled, badge }) => (
        <button
          key={id}
          onClick={() => !disabled && onTabChange(id)}
          disabled={disabled}
          className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 gap-2 ${
            activeTab === id
              ? "bg-background text-foreground shadow"
              : "hover:bg-background/80"
          }`}
        >
          <Icon className="h-4 w-4" />
          {label}
          {badge && <Badge className="ml-1 text-xs">{badge}</Badge>}
        </button>
      ))}
    </div>
  );
}
