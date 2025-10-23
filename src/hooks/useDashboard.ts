// import { useQuery } from "@tanstack/react-query";
// import { dashboardService } from "@/lib/services/dashboard-services";
// import { useAssessments } from "@/hooks/useAssessments";
// import type { DashboardFilters } from "@/types/domains/dashboard";

// // Query key factory for consistent cache management
// export const dashboardKeys = {
//   all: ["dashboard"] as const,
//   metrics: (companyId: string) =>
//     [...dashboardKeys.all, "metrics", companyId] as const,
//   actions: (filters: DashboardFilters) =>
//     [...dashboardKeys.all, "actions", filters] as const,
//   questionAnalytics: (filters: DashboardFilters) =>
//     [...dashboardKeys.all, "question-analytics", filters] as const,
//   domainAnalytics: (filters: DashboardFilters) =>
//     [...dashboardKeys.all, "domain-analytics", filters] as const,
//   assetRiskAnalytics: (filters: DashboardFilters) =>
//     [...dashboardKeys.all, "asset-risk-analytics", filters] as const,
// };

// /**
//  * Hook to fetch basic dashboard metrics (assessments, interviews, actions)
//  * @param companyId - The company ID to fetch metrics for
//  * @returns React Query result with metrics data, loading states, and error handling
//  */
// export function useDashboardMetrics(companyId: string) {
//   return useQuery({
//     queryKey: dashboardKeys.metrics(companyId),
//     queryFn: () => dashboardService.loadMetrics(companyId),
//     staleTime: 5 * 60 * 1000, // 5 minutes - moderate change frequency
//     enabled: !!companyId,
//   });
// }

// /**
//  * Hook to fetch dashboard actions with full transformations
//  * @param filters - Assessment IDs and other filters
//  * @returns React Query result with actions data, loading states, and error handling
//  */
// export function useDashboardActions(filters: DashboardFilters) {
//   return useQuery({
//     queryKey: dashboardKeys.actions(filters),
//     queryFn: () => dashboardService.loadActions(filters),
//     staleTime: 2 * 60 * 1000, // 2 minutes - user-generated content changes frequently
//     enabled: !!filters.assessmentIds && filters.assessmentIds.length > 0,
//   });
// }

// /**
//  * Hook to fetch question analytics with risk calculations
//  * @param filters - Assessment IDs and limit for results
//  * @returns React Query result with question analytics, loading states, and error handling
//  */
// export function useQuestionAnalytics(filters: DashboardFilters) {
//   return useQuery({
//     queryKey: dashboardKeys.questionAnalytics(filters),
//     queryFn: () => dashboardService.loadQuestionAnalytics(filters),
//     staleTime: 10 * 60 * 1000, // 10 minutes - complex analytical data
//     enabled: !!filters.assessmentIds && filters.assessmentIds.length > 0,
//   });
// }

// /**
//  * Hook to fetch domain analytics with performance calculations
//  * @param filters - Assessment IDs for analysis
//  * @returns React Query result with domain analytics, loading states, and error handling
//  */
// export function useDomainAnalytics(filters: DashboardFilters) {
//   return useQuery({
//     queryKey: dashboardKeys.domainAnalytics(filters),
//     queryFn: () => dashboardService.loadDomainAnalytics(filters),
//     staleTime: 10 * 60 * 1000, // 10 minutes - domain performance is relatively stable
//     enabled: !!filters.assessmentIds && filters.assessmentIds.length > 0,
//   });
// }

// /**
//  * Hook to fetch asset risk analytics with percentile-based classification
//  * @param filters - Assessment IDs for risk analysis
//  * @returns React Query result with asset risk analytics, loading states, and error handling
//  */
// export function useAssetRiskAnalytics(filters: DashboardFilters) {
//   return useQuery({
//     queryKey: dashboardKeys.assetRiskAnalytics(filters),
//     queryFn: () => dashboardService.loadAssetRiskAnalytics(filters),
//     staleTime: 15 * 60 * 1000, // 15 minutes - risk analytics are expensive and stable
//     enabled: !!filters.assessmentIds && filters.assessmentIds.length > 0,
//   });
// }

// /**
//  * Composite hook that combines domain and asset risk analytics to compute enhanced metrics
//  * @param companyId - Company ID for metrics
//  * @param assessmentIds - Assessment IDs for analytics
//  * @returns Combined metrics with analytics-derived data
//  */
// export function useDashboardMetricsWithAnalytics(
//   companyId: string,
//   assessmentIds: number[] | undefined
// ) {
//   const metricsQuery = useDashboardMetrics(companyId);
//   const domainAnalyticsQuery = useDomainAnalytics({ assessmentIds });
//   const assetRiskAnalyticsQuery = useAssetRiskAnalytics({ assessmentIds });

//   // Combine loading states
//   const isLoading =
//     metricsQuery.isLoading ||
//     domainAnalyticsQuery.isLoading ||
//     assetRiskAnalyticsQuery.isLoading;

//   // Combine error states
//   const error =
//     metricsQuery.error ||
//     domainAnalyticsQuery.error ||
//     assetRiskAnalyticsQuery.error;

//   // Compute enhanced metrics when all data is available
//   const enhancedMetrics =
//     metricsQuery.data &&
//     domainAnalyticsQuery.data &&
//     assetRiskAnalyticsQuery.data
//       ? dashboardService.updateMetricsFromAnalytics(
//           metricsQuery.data,
//           domainAnalyticsQuery.data,
//           assetRiskAnalyticsQuery.data
//         )
//       : metricsQuery.data;

//   return {
//     data: enhancedMetrics,
//     isLoading,
//     error,
//     isError: !!error,
//     // Individual query states for granular error handling
//     metrics: {
//       data: metricsQuery.data,
//       isLoading: metricsQuery.isLoading,
//       error: metricsQuery.error,
//     },
//     domainAnalytics: {
//       data: domainAnalyticsQuery.data,
//       isLoading: domainAnalyticsQuery.isLoading,
//       error: domainAnalyticsQuery.error,
//     },
//     assetRiskAnalytics: {
//       data: assetRiskAnalyticsQuery.data,
//       isLoading: assetRiskAnalyticsQuery.isLoading,
//       error: assetRiskAnalyticsQuery.error,
//     },
//   };
// }

// /**
//  * Hook for all dashboard data with proper dependency management
//  * This replaces the complex useEffect orchestration from the original store
//  * @param companyId - Company ID for all dashboard data
//  * @param questionAnalyticsLimit - Limit for question analytics results
//  * @returns All dashboard data with unified loading and error states
//  */
// export function useDashboard(
//   companyId: string,
//   questionAnalyticsLimit: number = 20
// ) {
//   // Get assessments for the company
//   const { data: assessments = [] } = useAssessments(companyId);

//   // Extract assessment IDs
//   const assessmentIds = assessments.map((a) => a.id);

//   // Get basic metrics
//   const metricsQuery = useDashboardMetrics(companyId);

//   // Load all analytics data
//   const actionsQuery = useDashboardActions({ assessmentIds });
//   const questionAnalyticsQuery = useQuestionAnalytics({
//     assessmentIds,
//     limit: questionAnalyticsLimit,
//   });
//   const domainAnalyticsQuery = useDomainAnalytics({ assessmentIds });
//   const assetRiskAnalyticsQuery = useAssetRiskAnalytics({ assessmentIds });

//   // Compute enhanced metrics
//   const enhancedMetrics =
//     metricsQuery.data &&
//     domainAnalyticsQuery.data &&
//     assetRiskAnalyticsQuery.data
//       ? dashboardService.updateMetricsFromAnalytics(
//           metricsQuery.data,
//           domainAnalyticsQuery.data,
//           assetRiskAnalyticsQuery.data
//         )
//       : metricsQuery.data;

//   // Unified loading state
//   const isLoading =
//     metricsQuery.isLoading ||
//     actionsQuery.isLoading ||
//     questionAnalyticsQuery.isLoading ||
//     domainAnalyticsQuery.isLoading ||
//     assetRiskAnalyticsQuery.isLoading;

//   // Unified error state
//   const error =
//     metricsQuery.error ||
//     actionsQuery.error ||
//     questionAnalyticsQuery.error ||
//     domainAnalyticsQuery.error ||
//     assetRiskAnalyticsQuery.error;

//   return {
//     // Unified data
//     metrics: enhancedMetrics,
//     actions: actionsQuery.data || [],
//     questionAnalytics: questionAnalyticsQuery.data || [],
//     domainAnalytics: domainAnalyticsQuery.data || [],
//     assetRiskAnalytics: assetRiskAnalyticsQuery.data || [],

//     // Unified states
//     isLoading,
//     error,
//     isError: !!error,

//     // Individual query states for granular control
//     queries: {
//       metrics: metricsQuery,
//       actions: actionsQuery,
//       questionAnalytics: questionAnalyticsQuery,
//       domainAnalytics: domainAnalyticsQuery,
//       assetRiskAnalytics: assetRiskAnalyticsQuery,
//     },
//   };
// }
