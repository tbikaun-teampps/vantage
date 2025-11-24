// import * as React from "react";
// import {
//   SimpleDataTable,
//   type SimpleDataTableTab,
// } from "@/components/simple-data-table";
// import type { QuestionAnalytics } from "@/types/domains/dashboard";
// import type { DashboardDataTableProps } from "./types";
// import { createDashboardColumns } from "./columns";
// import { ActionsDialog, ResponsesDialog, AssessmentsDialog } from "./dialogs";

// export function DashboardDataTable({
//   data,
//   isLoading = false,
// }: DashboardDataTableProps) {
//   // Dialog state
//   const [actionsDialogOpen, setActionsDialogOpen] = React.useState(false);
//   const [responsesDialogOpen, setResponsesDialogOpen] = React.useState(false);
//   const [assessmentsDialogOpen, setAssessmentsDialogOpen] =
//     React.useState(false);
//   const [selectedQuestion, setSelectedQuestion] =
//     React.useState<QuestionAnalytics | null>(null);

//   // Action handlers
//   const handleViewActions = (question: QuestionAnalytics) => {
//     setSelectedQuestion(question);
//     setActionsDialogOpen(true);
//   };

//   const handleViewResponses = (question: QuestionAnalytics) => {
//     setSelectedQuestion(question);
//     setResponsesDialogOpen(true);
//   };

//   const handleViewAssessments = (question: QuestionAnalytics) => {
//     setSelectedQuestion(question);
//     setAssessmentsDialogOpen(true);
//   };

//   // Create columns with handlers
//   const columns = React.useMemo(
//     () =>
//       createDashboardColumns({
//         onViewActions: handleViewActions,
//         onViewResponses: handleViewResponses,
//         onViewAssessments: handleViewAssessments,
//       }),
//     []
//   );

//   // Sort data by action count (highest first) by default and memoize filtering
//   const { sortedData, tabs } = React.useMemo(() => {
//     // Sort data by action count (highest first)
//     const sorted = [...data].sort((a, b) => b.action_count - a.action_count);

//     // Filter data by assessment type for tabs
//     // const onsiteQuestions = data.filter((q) => q.assessment_type === "onsite");
//     // const desktopQuestions = data.filter((q) => q.assessment_type === "desktop");
//     // const questionsWithActions = data.filter((q) => q.action_count > 0);

//     // // Score-based filters
//     // const criticalQuestions = data.filter((q) => q.avg_score < 60);
//     // const warningQuestions = data.filter(
//     //   (q) => q.avg_score >= 60 && q.avg_score < 80
//     // );

//     // Define tabs
//     const tabsConfig: SimpleDataTableTab[] = [
//       {
//         value: "all",
//         label: "All Questions",
//         data: sorted,
//         emptyStateTitle: "No assessments analysed",
//         emptyStateDescription: "No data available yet.",
//       },
//     ];

//     return { sortedData: sorted, tabs: tabsConfig };
//   }, [data]);

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="text-center space-y-2">
//           <div className="text-lg font-semibold">
//             Loading assessment analytics...
//           </div>
//           <div className="text-sm text-muted-foreground">
//             Analysing performance data
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <>
//       <SimpleDataTable
//         data={sortedData}
//         columns={columns}
//         getRowId={(row) => `${row.question_id}-${row.location}`}
//         tabs={tabs}
//         defaultTab="all"
//         enableSorting={true}
//         enableFilters={true}
//         enableColumnVisibility={true}
//         filterPlaceholder="Search questions..."
//         filterColumnId="question_title"
//         onRowClick={(question) => handleViewActions(question)}
//       />

//       <ActionsDialog
//         open={actionsDialogOpen}
//         onOpenChange={setActionsDialogOpen}
//         selectedQuestion={selectedQuestion}
//       />

//       <ResponsesDialog
//         open={responsesDialogOpen}
//         onOpenChange={setResponsesDialogOpen}
//         selectedQuestion={selectedQuestion}
//       />

//       <AssessmentsDialog
//         open={assessmentsDialogOpen}
//         onOpenChange={setAssessmentsDialogOpen}
//         selectedQuestion={selectedQuestion}
//       />
//     </>
//   );
// }
