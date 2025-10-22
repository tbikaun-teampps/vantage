import {
  IconPlus,
  IconClock,
  IconCircleCheckFilled,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useCompanyAwareNavigate } from "@/hooks/useCompanyAwareNavigate";
import { routes } from "@/router/routes";

interface QuickActionsProps {
  activeCount?: number;
  completedCount?: number;
  isLoading?: boolean;
}

export function QuickActions({
  activeCount = 0,
  completedCount = 0,
}: QuickActionsProps) {
  const navigate = useCompanyAwareNavigate();

  const handleStartNew = () => {
    navigate(routes.newAssessment);
  };

  const handleContinueInProgress = () => {
    navigate(`${routes.assessments}?tab=active`);
  };

  const handleReviewCompleted = () => {
    navigate(`${routes.assessments}?tab=completed`);
  };

  const hasActiveAssessments = activeCount > 0;
  const hasCompletedAssessments = completedCount > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Start New Assessment */}
      <Card
        className="bg-card border cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
        onClick={handleStartNew}
        data-tour="quick-action-start-new"
      >
        <CardContent className="flex items-center justify-center gap-3 p-3 h-10">
          <IconPlus className="h-6 w-6 text-primary flex-shrink-0" />
          <div className="flex flex-col items-start">
            <div className="font-medium">Start New</div>
            <div className="text-xs text-muted-foreground">Assessment</div>
          </div>
        </CardContent>
      </Card>

      {/* Continue In-Progress */}
      <Card
        className={`bg-card border transition-colors group ${
          hasActiveAssessments
            ? "cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-950/30"
            : "opacity-60"
        }`}
        onClick={hasActiveAssessments ? handleContinueInProgress : undefined}
        data-tour="quick-action-continue"
      >
        <CardContent className="flex items-center justify-center gap-3 p-3 h-10">
          <IconClock
            className={`h-6 w-6 flex-shrink-0 ${
              hasActiveAssessments ? "text-amber-600" : "text-muted-foreground"
            }`}
          />
          <div className="flex flex-col items-start">
            <div className="font-medium">Continue</div>
            <div className="text-xs text-muted-foreground">Assessments</div>
          </div>
          <Badge
            variant={hasActiveAssessments ? "secondary" : "outline"}
            className={`text-xs ${
              !hasActiveAssessments ? "text-muted-foreground" : ""
            }`}
          >
            {activeCount} active
          </Badge>
        </CardContent>
      </Card>

      {/* Review Completed */}
      <Card
        className={`bg-card border transition-colors group ${
          hasCompletedAssessments
            ? "cursor-pointer hover:bg-green-50 dark:hover:bg-green-950/30"
            : "opacity-60"
        }`}
        onClick={hasCompletedAssessments ? handleReviewCompleted : undefined}
        data-tour="quick-action-review"
      >
        <CardContent className="flex items-center justify-center gap-3 p-3 h-10">
          <IconCircleCheckFilled
            className={`h-6 w-6 flex-shrink-0 ${
              hasCompletedAssessments
                ? "text-green-600"
                : "text-muted-foreground"
            }`}
          />
          <div className="flex flex-col items-start">
            <div className="font-medium">Review</div>
            <div className="text-xs text-muted-foreground">Assessments</div>
          </div>
          <Badge
            variant={hasCompletedAssessments ? "secondary" : "outline"}
            className={`text-xs ${
              !hasCompletedAssessments ? "text-muted-foreground" : ""
            }`}
          >
            {completedCount} completed
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}
