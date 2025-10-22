import { useActivityData } from "@/hooks/widgets/useActivityData";
import type { WidgetComponentProps } from "./types";
import { Badge } from "@/components/ui/badge";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const getStatusColor = (status: string) => {
  switch (status) {
    // Interview statuses
    case "pending":
      return "bg-amber-300 text-amber-800";
    case "in_progress":
      return "bg-blue-300 text-blue-800";
    case "completed":
      return "bg-green-300 text-green-800";
    case "cancelled":
      return "bg-red-300 text-red-800";
    // Assessment statuses
    case "draft":
      return "bg-gray-300 text-gray-800";
    case "active":
      return "bg-blue-300 text-blue-800";
    case "under_review":
      return "bg-orange-300 text-orange-800";
    case "archived":
      return "bg-slate-300 text-slate-800";
    default:
      return "bg-gray-300 text-gray-800";
  }
};

const ActivityWidget: React.FC<WidgetComponentProps> = ({ config }) => {
  const currentEntityType = config?.entity?.entityType;
  const { data, isLoading, isFetching, error } = useActivityData(config);

  // If no entity type is configured, show a placeholder message
  if (!currentEntityType) {
    return (
      <>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">
            Activity Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 flex-1 min-h-0">
          <div className="h-full bg-muted/30 rounded flex items-center justify-center">
            <span className="text-muted-foreground">
              Configure this widget to see data
            </span>
          </div>
        </CardContent>
      </>
    );
  }

  // Loading state (initial load or refresh)
  if (isLoading || (isFetching && !data)) {
    return (
      <>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold capitalize">
            {currentEntityType}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 flex-1 min-h-0">
          <div className="h-full flex items-center justify-center">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-muted-foreground">
                Loading activity data...
              </span>
            </div>
          </div>
        </CardContent>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold capitalize">
            {currentEntityType}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 flex-1 min-h-0">
          <div className="h-full flex items-center justify-center p-4">
            <Alert className="bg-destructive/10 border-destructive max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Failed to load activity data
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </>
    );
  }

  return (
    <>
      {/* <CardHeader>
        <CardTitle className="text-2xl font-semibold capitalize">
          {currentEntityType}
        </CardTitle>
      </CardHeader> */}
      <CardContent className="pt-0 flex-1 min-h-0">
        <div className="flex flex-col h-full min-h-0">
          <div className="flex items-center pb-3 gap-2">
            <Badge variant="default" className="text-xs capitalize">
              {currentEntityType}
            </Badge>
            <Badge variant="secondary">{data?.total} total</Badge>
            {data?.scope?.assessmentName && (
              <Badge variant="secondary" className="text-xs">
                Assessment: {data.scope.assessmentName}
              </Badge>
            )}
            {data?.scope?.programName && (
              <Badge variant="secondary">
                Program: {data.scope.programName}
              </Badge>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
            {data?.breakdown &&
              Object.entries(data.breakdown).map(([status, count], index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm flex-shrink-0"
                >
                  <div className="flex items-center gap-2">
                    <span className="capitalize">
                      {status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{count}</span>
                    <div
                      className={`w-2 h-2 rounded-full ${getStatusColor(status).split(" ")[0]}`}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </>
  );
};

export default ActivityWidget;
