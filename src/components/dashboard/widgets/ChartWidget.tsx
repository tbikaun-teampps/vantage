import type { WidgetComponentProps } from "./types";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ChartWidget: React.FC<WidgetComponentProps> = ({ config }) => (
  <>
    <CardHeader>
      <CardTitle className="text-2xl font-semibold">Analytics Chart</CardTitle>
    </CardHeader>
    <CardContent className="pt-0 flex-1 min-h-0">
      <div className="h-full bg-muted/30 rounded flex items-center justify-center">
        <span className="text-muted-foreground">Chart Placeholder</span>
      </div>
    </CardContent>
  </>
);

export default ChartWidget;