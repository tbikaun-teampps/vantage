// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { metricsService } from "@/lib/supabase/metrics-service";
// import type { CreateCalculatedMetricData, CalculatedMetric } from "@/lib/supabase/metrics-service";
// import { toast } from "sonner";

// // Query key factory for cache management
// export const metricsKeys = {
//   all: ["metrics"] as const,
//   definitions: () => [...metricsKeys.all, "definitions"] as const,
//   definition: (id: number) => [...metricsKeys.definitions(), id] as const,
//   programMetrics: () => [...metricsKeys.all, "program-metrics"] as const,
//   programMetric: (programId?: number) => [...metricsKeys.programMetrics(), { programId }] as const,
//   programMetricsWithDefinitions: (programId: number) => [...metricsKeys.programMetrics(), "with-definitions", programId] as const,
//   availableMetrics: (programId: number) => [...metricsKeys.all, "available", programId] as const,
//   calculatedMetrics: () => [...metricsKeys.all, "calculated"] as const,
//   calculatedMetric: (programPhaseId?: number, companyId?: string) => [
//     ...metricsKeys.calculatedMetrics(), 
//     { programPhaseId, companyId }
//   ] as const,
// };

// // Metric Definitions queries
// export function useMetricDefinitions() {
//   return useQuery({
//     queryKey: metricsKeys.definitions(),
//     queryFn: () => metricsService.getMetricDefinitions(),
//     staleTime: 10 * 60 * 1000, // 10 minutes - definitions are fairly static
//   });
// }

// export function useMetricDefinitionById(id: number) {
//   return useQuery({
//     queryKey: metricsKeys.definition(id),
//     queryFn: () => metricsService.getMetricDefinitionById(id),
//     staleTime: 10 * 60 * 1000,
//     enabled: !!id,
//   });
// }

// // Program Metrics queries
// export function useProgramMetrics(programId?: number) {
//   return useQuery({
//     queryKey: metricsKeys.programMetric(programId),
//     queryFn: () => metricsService.getProgramMetrics(programId),
//     staleTime: 5 * 60 * 1000, // 5 minutes
//     enabled: !!programId,
//   });
// }

// export function useProgramMetricsWithDefinitions(programId: number) {
//   return useQuery({
//     queryKey: metricsKeys.programMetricsWithDefinitions(programId),
//     queryFn: () => metricsService.getProgramMetricsWithDefinitions(programId),
//     staleTime: 5 * 60 * 1000,
//     enabled: !!programId,
//   });
// }

// export function useAvailableMetricsForProgram(programId: number) {
//   return useQuery({
//     queryKey: metricsKeys.availableMetrics(programId),
//     queryFn: () => metricsService.getAvailableMetricsForProgram(programId),
//     staleTime: 5 * 60 * 1000,
//     enabled: !!programId,
//   });
// }

// // Program Metrics mutations
// export function useAddMetricToProgram() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: ({ programId, metricId }: { programId: number; metricId: number }) =>
//       metricsService.addMetricToProgram(programId, metricId),
//     onSuccess: (_, variables) => {
//       // Invalidate all related queries
//       queryClient.invalidateQueries({ queryKey: metricsKeys.programMetrics() });
//       queryClient.invalidateQueries({ queryKey: metricsKeys.availableMetrics(variables.programId) });
//       queryClient.invalidateQueries({ queryKey: metricsKeys.programMetricsWithDefinitions(variables.programId) });
//       toast.success("Metric added to program successfully.");
//     },
//     onError: (error) => {
//       console.error("Failed to add metric to program:", error);
//       if (error instanceof Error && error.message.includes("already added")) {
//         toast.error("This metric is already added to the program.");
//       } else {
//         toast.error("Failed to add metric to program. Please try again.");
//       }
//     },
//   });
// }

// export function useRemoveMetricFromProgram() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: ({ programId, metricId }: { programId: number; metricId: number }) =>
//       metricsService.removeMetricFromProgram(programId, metricId),
//     onSuccess: (_, variables) => {
//       // Invalidate all related queries
//       queryClient.invalidateQueries({ queryKey: metricsKeys.programMetrics() });
//       queryClient.invalidateQueries({ queryKey: metricsKeys.availableMetrics(variables.programId) });
//       queryClient.invalidateQueries({ queryKey: metricsKeys.programMetricsWithDefinitions(variables.programId) });
//       toast.success("Metric removed from program successfully.");
//     },
//     onError: (error) => {
//       console.error("Failed to remove metric from program:", error);
//       toast.error("Failed to remove metric from program. Please try again.");
//     },
//   });
// }

// // Calculated Metrics queries
// export function useCalculatedMetrics(programPhaseId?: number, companyId?: string) {
//   return useQuery({
//     queryKey: metricsKeys.calculatedMetric(programPhaseId, companyId),
//     queryFn: () => metricsService.getCalculatedMetrics(programPhaseId, companyId),
//     staleTime: 2 * 60 * 1000, // 2 minutes - calculated data changes more frequently
//     enabled: !!(programPhaseId || companyId),
//   });
// }

// // Calculated Metrics mutations
// export function useCreateCalculatedMetric() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (data: CreateCalculatedMetricData) => metricsService.createCalculatedMetric(data),
//     onSuccess: (metric: CalculatedMetric) => {
//       queryClient.invalidateQueries({ queryKey: metricsKeys.calculatedMetrics() });
//       toast.success(`Calculated metric "${metric.name}" created successfully.`);
//     },
//     onError: (error) => {
//       console.error("Failed to create calculated metric:", error);
//       toast.error("Failed to create calculated metric. Please try again.");
//     },
//   });
// }

// export function useUpdateCalculatedMetric() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: ({ id, updateData }: { id: number; updateData: Partial<CalculatedMetric> }) =>
//       metricsService.updateCalculatedMetric(id, updateData),
//     onSuccess: (metric: CalculatedMetric) => {
//       queryClient.invalidateQueries({ queryKey: metricsKeys.calculatedMetrics() });
//       toast.success(`Calculated metric "${metric.name}" updated successfully.`);
//     },
//     onError: (error) => {
//       console.error("Failed to update calculated metric:", error);
//       toast.error("Failed to update calculated metric. Please try again.");
//     },
//   });
// }

// export function useDeleteCalculatedMetric() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (id: number) => metricsService.deleteCalculatedMetric(id),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: metricsKeys.calculatedMetrics() });
//       toast.success("Calculated metric deleted successfully.");
//     },
//     onError: (error) => {
//       console.error("Failed to delete calculated metric:", error);
//       toast.error("Failed to delete calculated metric. Please try again.");
//     },
//   });
// }