import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function QuestionsFormSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-9 w-36" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Section skeletons */}
        {Array.from({ length: 2 }).map((_, sectionIndex) => (
          <div key={sectionIndex} className="space-y-4">
            {/* Section header */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-64" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>

            {/* Question skeletons */}
            <div className="ml-4 space-y-3">
              {Array.from({ length: 3 }).map((_, questionIndex) => (
                <div
                  key={questionIndex}
                  className="p-4 border rounded-lg space-y-3"
                >
                  {/* Question header */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-64" />
                      <Skeleton className="h-4 w-full max-w-lg" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>

                  {/* Question details */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-16 w-full" />
                  </div>

                  {/* Rating scales */}
                  <div className="flex gap-2">
                    {Array.from({ length: 5 }).map((_, ratingIndex) => (
                      <Skeleton
                        key={ratingIndex}
                        className="h-8 w-16"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Add section button */}
        <div className="pt-4 border-t">
          <Skeleton className="h-10 w-36" />
        </div>
      </CardContent>
    </Card>
  );
}