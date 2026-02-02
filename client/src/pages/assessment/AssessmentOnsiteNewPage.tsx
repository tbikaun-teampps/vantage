import { NewAssessmentForm } from "@/components/assessment/new/new-assessment-form";
import { usePageTitle } from "@/hooks/usePageTitle";

export function AssessmentOnsiteNewPage() {
  usePageTitle("New Assessment");
  return <NewAssessmentForm />;
}
