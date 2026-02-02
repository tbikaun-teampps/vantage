import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings, Loader2 } from "lucide-react";
import type { WidgetComponentProps } from "./types";
import { useWidgetData } from "@/hooks/widgets";
import type { GetMetricWidgetResponseData } from "@/types/api/dashboard";
import {
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const MetricWidget: React.FC<WidgetComponentProps> = ({ config }) => {
  const metricConfig = config?.metric;
  const { data, isLoading, isFetching, error } = useWidgetData(
    "metric",
    config!
  );

  const metricData = data as GetMetricWidgetResponseData | undefined;

  const isLoadingData = isLoading || isFetching;

  // If no config exists, show muted alert
  if (!metricConfig) {
    return (
      <>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">-</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="bg-muted/30 border-muted">
            <Settings className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span className="text-sm">Configure this metric to see data</span>
            </AlertDescription>
          </Alert>
        </CardContent>
      </>
    );
  }

  if (!metricData || !isLoadingData) {
    return (
      <>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">-</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="bg-muted/30 border-muted">
            <AlertDescription className="text-sm">
              No data available for this metric
            </AlertDescription>
          </Alert>
        </CardContent>
      </>
    );
  }

  return (
    <>
      <CardHeader>
        <CardDescription>{metricData.title}</CardDescription>
        <CardTitle className="text-2xl font-semibold">
          {isLoadingData ? "-" : metricData.value || "Key Metric"}
        </CardTitle>
        <CardAction className="flex items-center gap-2">
          {isLoadingData ? (
            <Loader2 className="animate-spin text-muted" />
          ) : (
            <>
              {metricData.phaseBadge && (
                <Badge
                  className="text-xs capitalize"
                  variant="outline"
                  style={{
                    color: metricData.phaseBadge.color,
                    borderColor: metricData.phaseBadge.borderColor,
                  }}
                >
                  {metricData.phaseBadge.text}
                </Badge>
              )}
              {metricData.badges &&
                metricData.badges.map((badge, index) => (
                  <Badge
                    key={index}
                    className="text-xs capitalize ml-2"
                    variant="outline"
                    style={{
                      color: badge.color,
                      borderColor: badge.borderColor,
                    }}
                  >
                    {badge.text}
                  </Badge>
                ))}
            </>
          )}
        </CardAction>
      </CardHeader>
      {error && (
        <CardContent>
          <Alert className="bg-destructive/10 border-destructive">
            <AlertDescription className="text-sm">
              Error loading metric: {error.message}
            </AlertDescription>
          </Alert>
        </CardContent>
      )}
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="flex items-center gap-3 w-full">
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">high priority</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">from interviews</span>
          </div>
        </div>
        <div className="text-muted-foreground">
          Actions identified from interview responses
        </div>
      </CardFooter>
    </>
  );
};

export default MetricWidget;
