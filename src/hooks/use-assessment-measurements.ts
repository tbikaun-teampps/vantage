import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMeasurementDefinitions } from "@/lib/api/shared";
import {
  getAssessmentMeasurements,
  addAssessmentMeasurement,
  updateAssessmentMeasurement,
  deleteAssessmentMeasurement,
  getAssessmentMeasurementsBarChartData,
} from "@/lib/api/assessments";
import type {
  MeasurementInstance,
  EnrichedMeasurementInstance,
} from "@/types/assessment-measurements";
// import type { AssessmentMeasurement } from "@/pages/assessments/desktop/detail/types";

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
export function useAssessmentMeasurements(assessmentId?: number) {
  // Fetch all measurement definitions (shared across all assessments)
  const definitionsQuery = useQuery({
    queryKey: assessmentMeasurementKeys.definitions(),
    queryFn: getMeasurementDefinitions,
    staleTime: 15 * 60 * 1000, // 15 minutes - definitions change infrequently
  });

  // Fetch measurements specific to this assessment
  const measurementsQuery = useQuery({
    queryKey: assessmentMeasurementKeys.measurement(assessmentId!),
    queryFn: () => getAssessmentMeasurements(assessmentId!),
    enabled: !!assessmentId,
    staleTime: 5 * 60 * 1000, // 5 minutes - assessment data changes moderately
  });

  // Merge definitions with assessment measurements to create unified view
  const allMeasurements = useMemo(() => {
    if (!definitionsQuery.data) return [];

    const uploadedMeasurements = measurementsQuery.data || [];

    return definitionsQuery.data.map((definition) => {
      // Count how many instances exist for this measurement definition
      const instances = uploadedMeasurements.filter(
        (m) => m.measurement_id === definition.id
      );
      const instanceCount = instances.length;

      // For backwards compatibility, use the first instance if it exists
      const uploaded = instances[0];

      if (uploaded) {
        return {
          ...definition,
          ...uploaded,
          id: definition.id, // CRITICAL: Preserve definition ID, don't let uploaded.id overwrite it
          status: "in_use" as const,
          isInUse: true,
          measurementRecordId: uploaded.id, // Store the calculated_measurements.id for deletion
          instanceCount, // Add count of all instances for this definition
        };
      }

      return {
        ...definition,
        status: definition.active ? "available" : "unavailable",
        updated_at: null,
        isInUse: false,
        instanceCount: 0, // No instances for this definition
      };
    });
  }, [definitionsQuery.data, measurementsQuery.data]);

  const isLoading = definitionsQuery.isLoading || measurementsQuery.isLoading;
  const error = definitionsQuery.error || measurementsQuery.error;

  return {
    allMeasurements,
    isLoading,
    error,
    refetch: measurementsQuery.refetch,
    isRefetching: measurementsQuery.isRefetching,
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
      measurementDefinitionId,
      value,
      location,
    }: {
      assessmentId: number;
      measurementDefinitionId: number;
      value: number;
      location?: {
        business_unit_id?: number;
        region_id?: number;
        site_id?: number;
        asset_group_id?: number;
        work_group_id?: number;
        role_id?: number;
      };
    }) =>
      addAssessmentMeasurement(
        assessmentId,
        measurementDefinitionId,
        value,
        location
      ),
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
    onSuccess: (data, { assessmentId }) => {
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
      updates: { calculated_value?: number };
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
        (old: any[] | undefined) => {
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
      measurementDefinitionId: number,
      value: number,
      location?: {
        business_unit_id?: number;
        region_id?: number;
        site_id?: number;
        asset_group_id?: number;
        work_group_id?: number;
        role_id?: number;
      }
    ) =>
      addMutation.mutateAsync({
        assessmentId,
        measurementDefinitionId,
        value,
        location,
      }),
    updateMeasurement: (
      assessmentId: number,
      measurementId: number,
      updates: {
        calculated_value?: number;
        location?: {
          business_unit_id?: number;
          region_id?: number;
          site_id?: number;
          asset_group_id?: number;
          work_group_id?: number;
          role_id?: number;
        };
      }
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
 *
 * This hook:
 * - Fetches raw measurement instances from the API
 * - Enriches them with measurement definition names and descriptions
 * - Returns instances with denormalized measurement metadata
 */
export function useAssessmentMeasurementInstances(assessmentId?: number) {
  // Fetch all measurement definitions (for enrichment)
  const definitionsQuery = useQuery({
    queryKey: assessmentMeasurementKeys.definitions(),
    queryFn: getMeasurementDefinitions,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  // Fetch measurement instances for this assessment
  const instancesQuery = useQuery({
    queryKey: assessmentMeasurementKeys.measurement(assessmentId!),
    queryFn: () => getAssessmentMeasurements(assessmentId!),
    enabled: !!assessmentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Enrich instances with measurement definition metadata
  const enrichedInstances = useMemo<EnrichedMeasurementInstance[]>(() => {
    if (!instancesQuery.data || !definitionsQuery.data) return [];

    return instancesQuery.data.map((instance: MeasurementInstance) => {
      const definition = definitionsQuery.data.find(
        (def) => def.id === instance.measurement_id
      );

      return {
        ...instance,
        measurement_name: definition?.name || "Unknown Measurement",
        measurement_description: definition?.description,
      };
    });
  }, [instancesQuery.data, definitionsQuery.data]);

  const isLoading = definitionsQuery.isLoading || instancesQuery.isLoading;
  const error = definitionsQuery.error || instancesQuery.error;

  return {
    instances: enrichedInstances,
    isLoading,
    error,
    refetch: instancesQuery.refetch,
    isRefetching: instancesQuery.isRefetching,
  };
}
