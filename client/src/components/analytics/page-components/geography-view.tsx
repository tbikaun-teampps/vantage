import { useAnalytics } from "@/contexts/AnalyticsContext";
import { OnsiteMap } from "../map/OnsiteMap";
import { DesktopMap } from "../map/DesktopMap";
export function GeographyView() {
  const { assessmentType } = useAnalytics();
  return assessmentType === "onsite" ? <OnsiteMap /> : <DesktopMap />;
}
