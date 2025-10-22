import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import type { WidgetComponentProps } from "./types";
import { useTableData } from "@/hooks/widgets";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TableWidget: React.FC<WidgetComponentProps> = ({ config }) => {
  const tableConfig = config?.table;
  const { data, isLoading, isFetching, error } = useTableData(config);

  // If no config exists, show placeholder
  if (!tableConfig) {
    return (
      <>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">
            Analytics Table
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 flex-1 min-h-0">
          <div className="h-full bg-muted/30 rounded flex items-center justify-center">
            <span className="text-muted-foreground">
              Configure this table to see data
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
            {tableConfig.entityType}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 flex-1 min-h-0">
          <div className="h-full flex items-center justify-center">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-muted-foreground">
                Loading table data...
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
            {tableConfig.entityType}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 flex-1 min-h-0">
          <div className="h-full flex items-center justify-center p-4">
            <Alert className="bg-destructive/10 border-destructive max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Failed to load table data
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
          {tableConfig.entityType}
        </CardTitle>
      </CardHeader> */}
      <CardContent className="pt-0 flex-1 min-h-0">
        <div className="h-full flex flex-col relative">
          {isFetching && data && (
            <div className="absolute top-2 right-2 z-10">
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
            </div>
          )}
          <div className="flex items-center pb-3 gap-2">
            <Badge variant="default" className="text-xs capitalize">
              {tableConfig.entityType}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {data?.rows.length || 0} item{data?.rows.length === 1 ? "" : "s"}
            </Badge>
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
          <div className="flex-1 overflow-auto">
            {data && data.rows.length > 0 ? (
              <table className="w-full text-sm">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    {data.columns.map((column) => (
                      <th
                        key={column.key}
                        className="p-2 text-left font-medium"
                      >
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row, index) => (
                    <tr
                      key={row.id || index}
                      className="border-b border-muted/20 hover:bg-muted/30"
                    >
                      {data.columns.map((column) => (
                        <td
                          key={column.key}
                          className="p-2 text-muted-foreground"
                        >
                          {row[column.key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="h-full flex items-center justify-center">
                <span className="text-muted-foreground">No data available</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </>
  );
};

export default TableWidget;
