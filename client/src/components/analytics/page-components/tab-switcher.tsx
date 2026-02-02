import {
  IconChartBar,
  IconMap,
  IconBuilding,
  IconDeviceDesktop,
} from "@tabler/icons-react";
import { useAnalytics } from "../../../contexts/AnalyticsContext";

const assessmentTypes = [
  { id: "onsite" as const, label: "Onsite", icon: IconBuilding },
  { id: "desktop" as const, label: "Desktop", icon: IconDeviceDesktop },
] as const;

const tabs = [
  { id: "metrics" as const, label: "Metrics", icon: IconChartBar },
  { id: "geography" as const, label: "Geography", icon: IconMap },
] as const;

export function TabSwitcher() {
  const { assessmentType, setAssessmentType, activeView, setActiveView } =
    useAnalytics();

  return (
    <div className="inline-flex items-center gap-3">
      {/* Assessment Type Selector */}
      <div
        className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground gap-1"
        data-tour="analytics-type-switcher"
      >
        {assessmentTypes.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setAssessmentType(id)}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 gap-2 ${
              assessmentType === id
                ? "bg-background text-foreground shadow"
                : "hover:bg-background/80"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-border" />

      {/* View Selector */}
      <div
        className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground gap-1"
        data-tour="analytics-view-switcher"
      >
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveView(id)}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 gap-2 ${
              activeView === id
                ? "bg-background text-foreground shadow"
                : "hover:bg-background/80"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}