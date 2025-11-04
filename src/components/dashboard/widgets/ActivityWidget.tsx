import { useActivityData } from "@/hooks/widgets/useActivityData";
import type { WidgetComponentProps } from "./types";
import { Badge } from "@/components/ui/badge";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  IconArchive,
  IconCancel,
  IconCircleCheckFilled,
  IconClock,
  IconEye,
  IconPencil,
  IconPlayerPause,
} from "@tabler/icons-react";

/**
 * Get color classes for a given status
 * @param status
 * @returns
 */
const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-500 border border-amber-500 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-200";
    case "in_progress":
      return "bg-blue-100 text-blue-500 border border-blue-500 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-200";
    case "completed":
      return "bg-green-100 text-green-500 border border-green-500 dark:bg-green-950 dark:text-green-200 dark:border-green-200";
    case "cancelled":
      return "bg-red-100 text-red-500 border border-red-500 dark:bg-red-950 dark:text-red-200 dark:border-red-200";
    case "draft":
      return "bg-gray-100 text-gray-500 border border-gray-500 dark:bg-gray-950 dark:text-gray-200 dark:border-gray-200";
    case "active":
      return "bg-blue-100 text-blue-500 border border-blue-500 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-200";
    case "under_review":
      return "bg-orange-100 text-orange-500 border border-orange-500 dark:bg-orange-950 dark:text-orange-200 dark:border-orange-200";
    case "archived":
      return "bg-slate-100 text-slate-500 border border-slate-500 dark:bg-slate-950 dark:text-slate-200 dark:border-slate-200";
    default:
      return "bg-gray-100 text-gray-500 border border-gray-500 dark:bg-gray-950 dark:text-gray-200 dark:border-gray-200";
  }
};

/**
 * Get icon component for a given status
 * @param status 
 * @returns 
 */
const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <IconCircleCheckFilled className="h-3 w-3" />;
    case "active":
      return <IconClock className="h-3 w-3" />;
    case "in_progress":
      return <IconClock className="h-3 w-3" />;
    case "draft":
      return <IconPencil className="h-3 w-3" />;
    case "under_review":
      return <IconEye className="h-3 w-3" />;
    case "archived":
      return <IconArchive className="h-3 w-3" />;
    case "cancelled":
      return <IconCancel className="h-3 w-3" />;
    case "pending":
      return <IconPlayerPause className="h-3 w-3" />;
    default:
      return null;
  }
};

const ActivityWidget: React.FC<WidgetComponentProps> = ({ config }) => {
  const currentEntityType = config?.entity?.entityType;
  const { data, isLoading, isFetching, error } = useActivityData(config);

  const isConfigured = Boolean(currentEntityType);

  // If no entity type is configured, show a placeholder message
  if (!isConfigured) {
    return (
      <>
        <CardHeader>
          <CardTitle className="font-semibold">Activity Widget</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 flex-1 min-h-0">
          <div className="h-full bg-muted/30 rounded flex items-center justify-center">
            <span className="text-muted-foreground p-2 text-center">
              Configure this activity widget to see data
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
        <CardTitle className="font-semibold capitalize">
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

          <div className="flex min-h-0 gap-2">
            {data?.breakdown &&
              Object.entries(data.breakdown).map(([status, count], index) => (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge className={`flex-1 ${getStatusColor(status)}`}>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(status)}
                          <span className="font-medium">{count}</span>
                        </div>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-xs capitalize">
                        {status.replace(/_/g, " ")} {currentEntityType}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
          </div>
        </div>
      </CardContent>
    </>
  );
};

export default ActivityWidget;
