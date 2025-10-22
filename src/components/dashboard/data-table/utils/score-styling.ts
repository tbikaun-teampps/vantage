export const getScoreStyle = (percentage: number): string => {
  if (percentage >= 85) {
    return "cursor-help bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-700 dark:hover:bg-emerald-950/70 font-medium";
  } else if (percentage >= 70) {
    return "cursor-help bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-950/50 dark:text-green-400 dark:border-green-700 dark:hover:bg-green-950/70 font-medium";
  } else if (percentage >= 50) {
    return "cursor-help bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-700 dark:hover:bg-amber-950/70 font-medium";
  } else {
    return "cursor-help bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-950/50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-950/70 font-medium";
  }
};