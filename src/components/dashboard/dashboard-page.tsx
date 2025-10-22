import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { BackButton } from "./back-button";
import { BackButtonDynamic } from "./back-button-dynamic";
import type { DashboardPageProps } from "@/types/ui/dashboard";

export function DashboardPage({
  title,
  description,
  headerActions,
  children,
  className,
  showBack = true,
  backHref,
  onBack,
  tourId,
  ref,
}: DashboardPageProps) {
  return (
    <div
      className={cn("flex flex-1 flex-col h-full", className)}
      data-tour={tourId}
      ref={ref}
    >
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between gap-4 px-6 pt-2 pb-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {showBack &&
              // Priority: Custom handler > Static href > Default back
              (onBack ? (
                <BackButtonDynamic onBack={onBack} /> // ✅ Uses onBack
              ) : backHref ? (
                <BackButton href={backHref} />
              ) : (
                <BackButtonDynamic />
              ))}
            <div className="space-y-1 min-w-0 flex-1">
              <h1 className="text-2xl font-bold tracking-tight capitalize">
                {title}
              </h1>
              {description && (
                <div className="text-xs text-muted-foreground">
                  {description}
                </div>
              )}
            </div>
          </div>
          {headerActions && (
            <div className="flex items-center space-x-2 flex-shrink-0">
              {headerActions}
            </div>
          )}
        </div>
        <Separator />
      </div>
      <div className="flex-1 min-h-0 overflow-hidden pb-6">{children}</div>
    </div>
  );
}
