import { NewAssessmentForm } from "@/components/assessment/new/new-assessment-form";
import { usePageTitle } from "@/hooks/usePageTitle";

export function AssessmentDesktopNewPage() {
  usePageTitle("New Desktop Assessment");
  return <NewAssessmentForm />;
}
