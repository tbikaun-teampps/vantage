interface QuestionnairesEmptyStateProps {
  type: "error";
  error?: string;
  onRetry?: () => void;
}

export function QuestionnairesEmptyState({ type, error, onRetry }: QuestionnairesEmptyStateProps) {
  if (type === "error") {
    return (
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-destructive">
                  Error Loading Questionnaires
                </h3>
                <p className="text-sm text-muted-foreground">{error}</p>
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="text-sm text-primary hover:underline"
                  >
                    Try again
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}