import { Card, CardContent } from "@/components/ui/card";

export function DashboardLoadingSkeleton() {
  return (
    <div className="flex flex-1 flex-col overflow-auto pb-6">
      <div className="flex-1 min-h-0 overflow-auto">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Section Cards Skeleton */}
          <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-muted/50 border rounded-lg"></div>
              </div>
            ))}
          </div>

          {/* Quick Actions Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 lg:px-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="bg-card border">
                <CardContent className="flex items-center justify-center gap-3 p-3 h-10">
                  <div className="h-6 w-6 bg-muted animate-pulse rounded flex-shrink-0" />
                  <div className="flex flex-col gap-1">
                    <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                  </div>
                  <div className="h-5 w-12 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Chart Skeleton */}
          <div className="px-4 lg:px-6">
            <div className="animate-pulse">
              <div className="h-64 bg-muted/50 border rounded-lg"></div>
            </div>
          </div>

          {/* Table Skeleton */}
          <div className="animate-pulse space-y-4 p-6">
            <div className="h-8 bg-muted/50 rounded w-1/3"></div>
            <div className="border rounded-lg">
              <div className="h-12 bg-muted/30 border-b"></div>
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 border-b last:border-b-0 bg-muted/20"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
