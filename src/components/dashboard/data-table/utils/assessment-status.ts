export const calculateDaysAgo = (dateString: string): number => {
  const date = new Date(dateString);
  const today = new Date();
  const diffTime = today.getTime() - date.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

export interface AssessmentStatus {
  variant: "destructive" | "default" | "secondary" | "outline";
  label: string;
  tooltip: string;
  className: string;
}

export const getAssessmentStatus = (
  dateString: string,
  assessmentType: "onsite" | "desktop"
): AssessmentStatus => {
  const daysAgo = calculateDaysAgo(dateString);
  const monthsAgo = Math.floor(daysAgo / 30);
  const yearsAgo = Math.floor(daysAgo / 365);

  if (assessmentType === "desktop") {
    if (daysAgo > 180) {
      return {
        variant: "destructive",
        label: "Overdue",
        tooltip: `${daysAgo} days ago (${monthsAgo} months)`,
        className:
          "cursor-help bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-950/50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-950/70 font-semibold",
      };
    } else if (daysAgo <= 30) {
      return {
        variant: "default",
        label: "Recent",
        tooltip: `${daysAgo} days ago`,
        className:
          "cursor-help bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-700 dark:hover:bg-emerald-950/70 font-medium",
      };
    } else if (daysAgo <= 90) {
      return {
        variant: "secondary",
        label: "Current",
        tooltip: `${daysAgo} days ago (${monthsAgo} months)`,
        className:
          "cursor-help bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-700 dark:hover:bg-blue-950/70 font-medium",
      };
    } else {
      return {
        variant: "outline",
        label: "Due Soon",
        tooltip: `${daysAgo} days ago (${monthsAgo} months)`,
        className:
          "cursor-help bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-700 dark:hover:bg-amber-950/70 font-medium",
      };
    }
  } else {
    // onsite
    if (daysAgo > 730) {
      return {
        variant: "destructive",
        label: "Critical",
        tooltip: `${daysAgo} days ago (${yearsAgo} years)`,
        className:
          "cursor-help bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-950/50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-950/70 font-semibold",
      };
    } else if (daysAgo <= 180) {
      return {
        variant: "default",
        label: "Recent",
        tooltip: `${daysAgo} days ago (${monthsAgo} months)`,
        className:
          "cursor-help bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-700 dark:hover:bg-emerald-950/70 font-medium",
      };
    } else if (daysAgo <= 365) {
      return {
        variant: "secondary",
        label: "Current",
        tooltip: `${daysAgo} days ago (${monthsAgo} months)`,
        className:
          "cursor-help bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-700 dark:hover:bg-blue-950/70 font-medium",
      };
    } else {
      return {
        variant: "outline",
        label: "Due Soon",
        tooltip: `${daysAgo} days ago (${monthsAgo} months)`,
        className:
          "cursor-help bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-700 dark:hover:bg-amber-950/70 font-medium",
      };
    }
  }
};