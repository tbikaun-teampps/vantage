import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface QuickOverviewProps {
  totalInterviewsCount: number;
  completedInterviewsCount: number;
  inProgressInterviewsCount: number;
  pendingInterviewsCount: number;
}

export function QuickOverview({
  totalInterviewsCount,
  completedInterviewsCount,
  inProgressInterviewsCount,
  pendingInterviewsCount,
}: QuickOverviewProps) {
  return (
    <Card
      className="h-full shadow-none border-none"
      data-tour="quick-overview-card"
    >
      <CardHeader>
        <CardTitle className="text-base">Quick Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Total Interviews
            </span>
            <Badge variant="outline">{totalInterviewsCount}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Completed</span>
            <Badge
              variant="outline"
              className="text-green-500 border-green-200  dark:border-green-800"
            >
              {completedInterviewsCount}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">In Progress</span>
            <Badge
              variant="outline"
              className="text-blue-500 border-blue-200  dark:border-blue-800"
            >
              {inProgressInterviewsCount}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Pending</span>
            <Badge
              variant="outline"
              className="text-yellow-500 border-yellow-200 dark:border-yellow-800"
            >
              {pendingInterviewsCount}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
