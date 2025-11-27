// import { useMemo } from "react";
// import { DashboardDataTable } from "@/components/dashboard/data-table";
// import { SectionCards } from "@/components/dashboard/section-cards";
// import { QuickActions } from "@/components/dashboard/quick-actions";
// import {
//   useQuestionAnalytics,
//   useDashboardMetricsWithAnalytics,
// } from "@/hooks/useDashboard";
// import { useAssessments } from "@/hooks/useAssessments";
// import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";

// export function OverviewTabContent() {
//   const companyId = useCompanyFromUrl();
//   const { data: assessments = [], isLoading: assessmentsLoading } =
//     useAssessments(companyId);

//   // Get assessment IDs for dashboard queries
//   const assessmentIds = useMemo(
//     () => assessments.map((a) => a.id),
//     [assessments]
//   );

//   // Load dashboard metrics with analytics enhancement
//   const { data: metrics, isLoading: metricsLoading } =
//     useDashboardMetricsWithAnalytics(companyId, assessmentIds);

//   // Load question analytics separately for the table
//   const { data: questionAnalytics = [], isLoading: questionAnalyticsLoading } =
//     useQuestionAnalytics({ assessmentIds, limit: 20 });

//   // Unified loading state
//   const isLoading = metricsLoading || questionAnalyticsLoading;

//   // Calculate assessment counts
//   const { activeCount, completedCount } = useMemo(() => {
//     const active = assessments.filter((a) => a.status === "active").length;
//     const completed = assessments.filter(
//       (a) => a.status === "completed"
//     ).length;
//     return { activeCount: active, completedCount: completed };
//   }, [assessments]);

//   // Calculate high-risk count from question analytics
//   const highRiskCount = useMemo(() => {
//     const highRiskQuestions = questionAnalytics.filter(
//       (question) => question.risk_level === "high"
//     );
//     // Count unique locations with high-risk questions
//     const uniqueLocations = new Set(
//       highRiskQuestions.map((question) => question.location)
//     );
//     return uniqueLocations.size;
//   }, [questionAnalytics]);

//   // Calculate average compliance and critical risk count
//   const { avgCompliance, criticalRiskCount } = useMemo(() => {
//     if (questionAnalytics.length === 0) {
//       return { avgCompliance: 0, criticalRiskCount: 0 };
//     }

//     // Calculate average compliance score across all questions
//     const totalCompliance = questionAnalytics.reduce(
//       (sum, question) => sum + question.avg_score_percentage,
//       0
//     );
//     const avgCompliance = Math.round(
//       totalCompliance / questionAnalytics.length
//     );

//     // Count questions with critical risk level
//     const criticalRiskCount = questionAnalytics.filter(
//       (question) => question.risk_level === "critical"
//     ).length;

//     return { avgCompliance, criticalRiskCount };
//   }, [questionAnalytics]);

//   // Calculate worst performing domain metrics
//   const worstDomainMetrics = useMemo(() => {
//     if (questionAnalytics.length === 0) {
//       return null;
//     }

//     // Find the domain with the lowest average score (worst performing)
//     const domainGroups = questionAnalytics.reduce(
//       (acc, question) => {
//         const domain = question.domain;
//         if (!acc[domain]) {
//           acc[domain] = [];
//         }
//         acc[domain].push(question);
//         return acc;
//       },
//       {} as Record<string, typeof questionAnalytics>
//     );

//     // Calculate average score per domain and find worst
//     const domainScores = Object.entries(domainGroups).map(
//       ([domain, questions]) => {
//         const avgScore =
//           questions.reduce((sum, q) => sum + q.avg_score_percentage, 0) /
//           questions.length;
//         return { domain, avgScore, questions };
//       }
//     );

//     const worstDomain = domainScores.sort((a, b) => a.avgScore - b.avgScore)[0];

//     if (!worstDomain) return null;

//     // Calculate metrics for worst domain
//     const questionCount = worstDomain.questions.length;
//     const uniqueLocations = new Set(
//       worstDomain.questions.map((q) => q.location)
//     );
//     const locationCount = uniqueLocations.size;
//     const totalActions = worstDomain.questions.reduce(
//       (sum, q) => sum + q.action_count,
//       0
//     );
//     const avgCompliance = Math.round(worstDomain.avgScore);

//     // Split domain hierarchy (assuming domains might be hierarchical like "Category > Subcategory")
//     const domainParts = worstDomain.domain.split(" > ");
//     const domainName = domainParts[domainParts.length - 1]; // Last part (main domain)
//     const domainParent =
//       domainParts.length > 1 ? domainParts.slice(0, -1).join(" > ") : null; // Parent categories

//     return {
//       name: worstDomain.domain,
//       questionCount,
//       locationCount,
//       actionCount: totalActions,
//       avgCompliance,
//       domainHierarchy: {
//         fullName: worstDomain.domain,
//         domainName,
//         parentCategories: domainParent,
//       },
//     };
//   }, [questionAnalytics]);

//   return (
//     <div className="flex-1 min-h-0 overflow-auto">
//       <div className="flex flex-col gap-4 py-4">
//         <div className="@container/main" data-tour="dashboard-cards">
//           {isLoading ? (
//             <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
//               {Array.from({ length: 4 }).map((_, i) => (
//                 <div key={i} className="animate-pulse">
//                   <div className="h-32 bg-muted/50 border rounded-lg"></div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <SectionCards
//               metrics={{
//                 assessments: metrics?.assessments || {
//                   total: 0,
//                   trend: 0,
//                   status: "up",
//                 },
//                 generatedActions: metrics?.generatedActions,
//                 worstPerformingArea: {
//                   name:
//                     worstDomainMetrics?.name ||
//                     metrics?.worstPerformingArea?.name,
//                   avgScore:
//                     worstDomainMetrics?.avgCompliance ||
//                     metrics?.worstPerformingArea?.avgScore,
//                   affectedLocations:
//                     worstDomainMetrics?.locationCount ||
//                     metrics?.worstPerformingArea?.affectedLocations,
//                   // Store additional computed metrics as custom properties
//                   ...(worstDomainMetrics && {
//                     questionCount: worstDomainMetrics.questionCount,
//                     actionCount: worstDomainMetrics.actionCount,
//                     domainHierarchy: worstDomainMetrics.domainHierarchy,
//                   }),
//                 },
//                 peopleInterviewed: metrics?.peopleInterviewed || {
//                   total: 0,
//                   trend: 0,
//                   status: "up",
//                 },
//                 criticalAssets: {
//                   ...(metrics?.criticalAssets || {}),
//                   count: highRiskCount,
//                   avgCompliance: avgCompliance,
//                   riskBreakdown: {
//                     ...(metrics?.criticalAssets?.riskBreakdown || {}),
//                     critical: criticalRiskCount,
//                     high: highRiskCount,
//                     medium: 0,
//                     low: 0,
//                   },
//                 },
//               }}
//             />
//           )}
//         </div>

//         {/* Quick Actions Section */}
//         <div data-tour="dashboard-quick-actions">
//           {isLoading || assessmentsLoading ? (
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               {Array.from({ length: 3 }).map((_, i) => (
//                 <div key={i} className="animate-pulse">
//                   <div className="h-10 bg-card border rounded-lg"></div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <QuickActions
//               activeCount={activeCount}
//               completedCount={completedCount}
//             />
//           )}
//         </div>

//         {/* <div className="px-4 lg:px-6" data-tour="dashboard-chart">
//             {isLoading ? (
//               <div className="animate-pulse">
//                 <div className="h-64 bg-muted/50 border rounded-lg"></div>
//               </div>
//             ) : (
//               <ChartAreaInteractive />
//             )}
//           </div> */}
//         <div data-tour="dashboard-table">
//           {isLoading ? (
//             <div className="animate-pulse space-y-4 p-6">
//               <div className="h-8 bg-muted/50 rounded w-1/3"></div>
//               <div className="border rounded-lg">
//                 <div className="h-12 bg-muted/30 border-b"></div>
//                 {Array.from({ length: 5 }).map((_, i) => (
//                   <div
//                     key={i}
//                     className="h-16 border-b last:border-b-0 bg-muted/20"
//                   ></div>
//                 ))}
//               </div>
//             </div>
//           ) : (
//             <DashboardDataTable
//               data={questionAnalytics}
//               isLoading={isLoading}
//             />
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
