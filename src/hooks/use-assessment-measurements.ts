import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAssessmentMeasurements,
  addAssessmentMeasurement,
  updateAssessmentMeasurement,
  deleteAssessmentMeasurement,
  getAssessmentMeasurementsBarChartData,
  getAssessmentMeasurementDefinitions,
} from "@/lib/api/assessments";
import type {
  AddAssessmentMeasurementBodyData,
  GetAssessmentMeasurementDefinitionsByIdResponseData,
  GetAssessmentMeasurementsResponseData,
  UpdateAssessmentMeasurementBodyData,
} from "@/types/api/assessments";

// Query key factory for assessment measurements
const assessmentMeasurementKeys = {
  all: ["assessment-measurements"] as const,
  definitions: () => [...assessmentMeasurementKeys.all, "definitions"] as const,
  measurements: () =>
    [...assessmentMeasurementKeys.all, "measurements"] as const,
  measurement: (assessmentId: number) =>
    [...assessmentMeasurementKeys.measurements(), assessmentId] as const,
  barChart: (assessmentId: number) =>
    [
      ...assessmentMeasurementKeys.measurements(),
      assessmentId,
      "bar-chart",
    ] as const,
};

/**
 * Hook to fetch and merge measurement definitions with assessment-specific measurements
 *
 * This hook:
 * - Fetches all available measurement definitions (cached globally)
 * - Fetches measurements for a specific assessment
 * - Merges them to show which are uploaded vs available
 * - Provides unified loading/error states
 */
export function useAssessmentMeasurements(assessmentId: number) {
  // Fetch all measurement definitions (shared across all assessments)
  const query = useQuery({
    queryKey: assessmentMeasurementKeys.definitions(),
    queryFn: (): Promise<GetAssessmentMeasurementDefinitionsByIdResponseData> =>
      getAssessmentMeasurementDefinitions(assessmentId),
    enabled: !!assessmentId,
    staleTime: 15 * 60 * 1000, // 15 minutes - definitions change infrequently (invalidated when instances change though.)
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
  };
}

/**
 * Hook for assessment measurement mutations (add, update, delete)
 *
 * Provides functions to mutate assessment measurements with automatic cache invalidation
 * to keep the UI in sync with the server state.
 */
export function useAssessmentMeasurementActions() {
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: ({
      assessmentId,
      data,
    }: {
      assessmentId: number;
      data: AddAssessmentMeasurementBodyData;
    }) => addAssessmentMeasurement(assessmentId, data),
    onMutate: async ({ assessmentId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: assessmentMeasurementKeys.measurement(assessmentId),
      });

      // Snapshot previous state
      const previousMeasurements = queryClient.getQueryData(
        assessmentMeasurementKeys.measurement(assessmentId)
      );

      // // Optimistically add the measurement to the cache
      // queryClient.setQueryData(
      //   assessmentMeasurementKeys.measurement(assessmentId),
      //   (old: any[] | undefined) => {
      //     if (!old) return old;
      //     // Add the new measurement with temporary data
      //     const newMeasurement = {
      //       id: Date.now(), // Temporary ID until server responds
      //       measurement_id: measurementDefinitionId,
      //       assessment_id: assessmentId,
      //       calculated_value: value,
      //       created_at: new Date().toISOString(),
      //       updated_at: new Date().toISOString(),
      //     };
      //     return [...old, newMeasurement];
      //   }
      // );

      return { previousMeasurements };
    },
    onSuccess: (_, { assessmentId }) => {
      // Invalidate and refetch to get the real server data with correct IDs
      queryClient.invalidateQueries({
        queryKey: assessmentMeasurementKeys.measurement(assessmentId),
      });
      // Invalidate bar chart data to reflect the new measurement
      queryClient.invalidateQueries({
        queryKey: assessmentMeasurementKeys.barChart(assessmentId),
      });
    },
    onError: (error, { assessmentId }, context) => {
      // Rollback on error
      if (context?.previousMeasurements) {
        queryClient.setQueryData(
          assessmentMeasurementKeys.measurement(assessmentId),
          context.previousMeasurements
        );
      }
      console.error("Failed to add measurement:", error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      assessmentId,
      measurementId,
      updates,
    }: {
      assessmentId: number;
      measurementId: number;
      updates: UpdateAssessmentMeasurementBodyData;
    }) => updateAssessmentMeasurement(assessmentId, measurementId, updates),
    onMutate: async ({ assessmentId }) => {
      // Cancel outgoing refetches to prevent them from overwriting our optimistic update
      await queryClient.cancelQueries({
        queryKey: assessmentMeasurementKeys.measurement(assessmentId),
      });

      // Snapshot the previous value for rollback
      const previousMeasurements = queryClient.getQueryData(
        assessmentMeasurementKeys.measurement(assessmentId)
      );

      // Return context with snapshot for rollback
      return { previousMeasurements };
    },
    onSuccess: (_, { assessmentId }) => {
      // Invalidate the measurements cache to get updated values from server
      queryClient.invalidateQueries({
        queryKey: assessmentMeasurementKeys.measurement(assessmentId),
      });
      // Invalidate bar chart data to reflect the updated measurement
      queryClient.invalidateQueries({
        queryKey: assessmentMeasurementKeys.barChart(assessmentId),
      });
    },
    onError: (error, { assessmentId }, context) => {
      // Rollback to previous state on error
      if (context?.previousMeasurements) {
        queryClient.setQueryData(
          assessmentMeasurementKeys.measurement(assessmentId),
          context.previousMeasurements
        );
      }
      console.error("Failed to update measurement:", error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({
      assessmentId,
      measurementId,
    }: {
      assessmentId: number;
      measurementId: number;
    }) => deleteAssessmentMeasurement(assessmentId, measurementId),
    onMutate: async ({ assessmentId, measurementId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: assessmentMeasurementKeys.measurement(assessmentId),
      });

      // Snapshot previous state
      const previousMeasurements = queryClient.getQueryData(
        assessmentMeasurementKeys.measurement(assessmentId)
      );

      // Optimistically remove the measurement from cache
      queryClient.setQueryData(
        assessmentMeasurementKeys.measurement(assessmentId),
        (old: GetAssessmentMeasurementsResponseData | undefined) => {
          if (!old) return old;
          return old.filter((m) => m.id !== measurementId);
        }
      );

      return { previousMeasurements };
    },
    onSuccess: (_, { assessmentId }) => {
      // Invalidate to sync with server
      queryClient.invalidateQueries({
        queryKey: assessmentMeasurementKeys.measurement(assessmentId),
      });
      // Invalidate bar chart data to reflect the deleted measurement
      queryClient.invalidateQueries({
        queryKey: assessmentMeasurementKeys.barChart(assessmentId),
      });
    },
    onError: (error, { assessmentId }, context) => {
      // Rollback on error
      if (context?.previousMeasurements) {
        queryClient.setQueryData(
          assessmentMeasurementKeys.measurement(assessmentId),
          context.previousMeasurements
        );
      }
      console.error("Failed to delete measurement:", error);
    },
  });

  return {
    // Actions
    addMeasurement: (
      assessmentId: number,
      data: AddAssessmentMeasurementBodyData
    ) =>
      addMutation.mutateAsync({
        assessmentId,
        data,
      }),
    updateMeasurement: (
      assessmentId: number,
      measurementId: number,
      updates: UpdateAssessmentMeasurementBodyData
    ) => updateMutation.mutateAsync({ assessmentId, measurementId, updates }),
    deleteMeasurement: (assessmentId: number, measurementId: number) =>
      deleteMutation.mutateAsync({ assessmentId, measurementId }),

    // Loading states
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isLoading:
      addMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,

    // Error states
    addError: addMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,

    // Reset error states
    resetErrors: () => {
      addMutation.reset();
      updateMutation.reset();
      deleteMutation.reset();
    },
  };
}

/**
 * Hook to fetch bar chart data for assessment measurements
 *
 * This hook:
 * - Fetches pre-aggregated bar chart data from the API
 * - Data is grouped by measurement definition name with location-based data points
 * - Automatically refreshes when measurements are added/updated/deleted
 */
export function useAssessmentMeasurementsBarChart(assessmentId?: number) {
  const query = useQuery({
    queryKey: assessmentMeasurementKeys.barChart(assessmentId!),
    queryFn: () => getAssessmentMeasurementsBarChartData(assessmentId!),
    enabled: !!assessmentId,
    staleTime: 5 * 60 * 1000, // 5 minutes - matches measurement data staleness
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
  };
}

/**
 * Hook to fetch measurement instances for an assessment with enriched definition data
 */
export function useAssessmentMeasurementInstances(assessmentId?: number) {
  const query = useQuery({
    queryKey: assessmentMeasurementKeys.measurement(assessmentId!),
    queryFn: (): Promise<GetAssessmentMeasurementsResponseData> =>
      getAssessmentMeasurements(assessmentId!),
    enabled: !!assessmentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    instances: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
  };
}
