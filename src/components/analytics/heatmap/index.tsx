import { useAnalytics } from "../../../contexts/AnalyticsContext";
import OnsiteHeatmap from "./OnsiteHeatmap";
import DesktopHeatmap from "./DesktopHeatmap";

export default function AssessmentHeatmap() {
  const { assessmentType } = useAnalytics();

  return assessmentType === "onsite" ? <OnsiteHeatmap /> : <DesktopHeatmap />;
}
