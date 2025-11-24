import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createProgram,
  createPhase,
  createProgramInterviews,
  deletePhase,
  deleteProgram,
  getProgramById,
  getPrograms,
  updatePhase,
  updateProgram,
  updateProgramOnsiteQuestionnaire,
  updateProgramPresiteQuestionnaire,
  getProgramMeasurements,
  getProgramAvailableMeasurements,
  addMeasurementDefinitionsToProgram,
  removeMeasurementDefinitionFromProgram,
  getProgramCalculatedMeasurements,
  getProgramPhaseMeasurementData,
  createProgramPhaseMeasurementData,
  updateProgramPhaseMeasurementData,
  deleteProgramPhaseMeasurementData,
  getProgramAllowedMeasurementDefinitions,
} from "@/lib/api/programs";
import { getMeasurementDefinitionById } from "@/lib/api/shared";
import type {
  CreateProgramBodyData,
  CreateProgramPhaseBodyData,
  CreateProgramPhaseMeasurementBodyData,
  CreateProgramResponseData,
  GetProgramAllowedMeasurementDefinitionsResponseData,
  GetProgramCalculatedMeasurementsResponseData,
  GetProgramPhaseMeasurementsParams,
  GetProgramPhaseMeasurementsResponseData,
  GetProgramsResponseData,
  UpdateProgramBodyData,
  UpdateProgramPhaseBodyData,
  UpdateProgramResponseData,
} from "@/types/api/programs";
import type { GetMeasurementDefinitionByIdResponseData } from "@/types/api/shared";

// Query key factory for cache management
const programKeys = {
  all: ["programs"] as const,
  lists: () => [...programKeys.all, "list"] as const,
  list: (companyId?: string) =>
    [...programKeys.lists(), { companyId }] as const,
  details: () => [...programKeys.all, "detail"] as const,
  detail: (id: number) => [...programKeys.details(), id] as const,
  phases: () => [...programKeys.all, "phases"] as const,
  currentPhase: (programId: number) =>
    [...programKeys.phases(), "current", programId] as const,
  programMeasurements: () =>
    [...programKeys.all, "program-measurements"] as const,
  programMeasurement: (
    programId: number,
    includeDefinitions: boolean = false
  ) =>
    [
      ...programKeys.programMeasurements(),
      { programId, includeDefinitions },
    ] as const,
  programMeasurementsWithDefinitions: (programId: number) =>
    [
      ...programKeys.programMeasurements(),
      "with-definitions",
      programId,
    ] as const,
};

// Hook to fetch programs with optional company filtering
export function usePrograms(companyId: string) {
  return useQuery({
    queryKey: programKeys.list(companyId),
    queryFn: (): Promise<GetProgramsResponseData> => getPrograms({ companyId }),
    staleTime: 5 * 60 * 1000, // 5 minutes - program data changes moderately
    enabled: !!companyId, // Only run if companyId is provided
  });
}

// Hook to fetch a specific program by ID with objectives
export function useProgramById(id: number) {
  return useQuery({
    queryKey: programKeys.detail(id),
    queryFn: () => getProgramById(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!id, // Only run if id is provided
  });
}

export function useCreateProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProgramBodyData) => createProgram(data),
    onSuccess: (program: CreateProgramResponseData) => {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      toast.success(`${program.name} has been created successfully.`);
    },
    onError: (error) => {
      console.error("Failed to create program:", error);
      toast.error("Failed to create program. Please try again.");
    },
  });
}

export function useUpdateProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      programId,
      updateData,
    }: {
      programId: number;
      updateData: UpdateProgramBodyData;
    }) => updateProgram(programId, updateData),
    onSuccess: (program: UpdateProgramResponseData) => {
      queryClient.invalidateQueries({
        queryKey: programKeys.detail(program.id),
      });
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      toast.success("Program details updated successfully.");
    },
    onError: (error) => {
      console.error("Failed to update program:", error);
      toast.error("Failed to update program. Please try again.");
    },
  });
}

export function useUpdateProgramOnsiteQuestionnaire() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      programId,
      questionnaireId,
    }: {
      programId: number;
      questionnaireId: number | null;
    }) => updateProgramOnsiteQuestionnaire(programId, questionnaireId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: programKeys.detail(variables.programId),
      });
      queryClient.invalidateQueries({ queryKey: ["programs"] });

      if (variables.questionnaireId) {
        toast.success("Onsite questionnaire linked to program successfully.");
      } else {
        toast.success(
          "Onsite questionnaire unlinked from program successfully."
        );
      }
    },
    onError: (error) => {
      console.error("Failed to update program onsite questionnaire:", error);
      toast.error("Failed to update onsite questionnaire. Please try again.");
    },
  });
}

export function useUpdateProgramPresiteQuestionnaire() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      programId,
      questionnaireId,
    }: {
      programId: number;
      questionnaireId: number | null;
    }) => updateProgramPresiteQuestionnaire(programId, questionnaireId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: programKeys.detail(variables.programId),
      });
      queryClient.invalidateQueries({ queryKey: ["programs"] });

      if (variables.questionnaireId) {
        toast.success(
          "Pre-assessment questionnaire linked to program successfully."
        );
      } else {
        toast.success(
          "Pre-assessment questionnaire unlinked from program successfully."
        );
      }
    },
    onError: (error) => {
      console.error("Failed to update program presite questionnaire:", error);
      toast.error(
        "Failed to update pre-assessment questionnaire. Please try again."
      );
    },
  });
}

export function useDeleteProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteProgram(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      toast.success("Program has been deleted successfully.");
    },
    onError: (error) => {
      console.error("Failed to delete program:", error);
      toast.error("Failed to delete program. Please try again.");
    },
  });
}

export function useUpdatePhase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      programId,
      phaseId,
      updates,
    }: {
      programId: number;
      phaseId: number;
      updates: UpdateProgramPhaseBodyData;
    }) => updatePhase(programId, phaseId, updates),
    onSuccess: () => {
      // Invalidate program queries to refresh phase data
      queryClient.invalidateQueries({ queryKey: programKeys.all });
    },
    onError: (error) => {
      console.error("Failed to update phase:", error);
      toast.error("Failed to update phase. Please try again.");
    },
  });
}

export function useCreatePhase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      programId,
      data,
    }: {
      programId: number;
      data: CreateProgramPhaseBodyData;
    }) => createPhase(programId, data),
    onSuccess: (phase, variables) => {
      // Invalidate program queries to refresh phase data
      queryClient.invalidateQueries({ queryKey: programKeys.all });

      const message = variables.data.activate
        ? `Phase "${phase.name || `Phase ${phase.sequence_number}`}" created and activated successfully.`
        : `Phase "${phase.name || `Phase ${phase.sequence_number}`}" created successfully.`;

      toast.success(message);
    },
    onError: (error) => {
      console.error("Failed to create phase:", error);
      toast.error("Failed to create phase. Please try again.");
    },
  });
}

export function useDeletePhase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      programId,
      phaseId,
    }: {
      programId: number;
      phaseId: number;
    }) => deletePhase(programId, phaseId),
    onSuccess: () => {
      // Invalidate program queries to refresh phase data
      queryClient.invalidateQueries({ queryKey: programKeys.all });
      toast.success("Phase has been deleted successfully.");
    },
    onError: (error) => {
      console.error("Failed to delete phase:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to delete phase. Please try again.";

      if (errorMessage.includes("Cannot delete the only remaining phase")) {
        toast.error(
          "Cannot delete the only remaining phase. Programs must have at least one phase."
        );
      } else if (errorMessage.includes("violates foreign key constraint")) {
        toast.error(
          "Cannot delete phase. Please remove associated interviews and calculated metrics first."
        );
      } else {
        toast.error(errorMessage);
      }
    },
  });
}

export function useCreateProgramInterviews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      programId,
      phaseId,
      isIndividualInterview = false,
      roleIds = [],
      contactIds,
      interviewType,
    }: {
      programId: number;
      phaseId: number;
      isIndividualInterview?: boolean;
      roleIds?: number[];
      contactIds: number[];
      interviewType: "onsite" | "presite";
    }) =>
      createProgramInterviews(programId, {
        phaseId,
        isIndividual: isIndividualInterview,
        roleIds,
        contactIds,
        interviewType,
      }),
    onSuccess: (_, variables) => {
      // Invalidate relevant queries to refresh interview data
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
      queryClient.invalidateQueries({
        queryKey: programKeys.detail(variables.programId),
      });

      const interviewCount = variables.isIndividualInterview
        ? variables.contactIds.length
        : 1;
      const interviewText = interviewCount === 1 ? "interview" : "interviews";
      const typeText =
        variables.interviewType === "onsite" ? "onsite" : "pre-assessment";

      toast.success(
        `${interviewCount} ${typeText} ${interviewText} created successfully.`
      );
    },
    onError: (error) => {
      console.error("Failed to create program interviews:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create interviews. Please try again.";
      toast.error(errorMessage);
    },
  });
}

// Program Measurements queries
export function useProgramMeasurements(
  programId: number,
  includeDefinitions: boolean = false
) {
  return useQuery({
    queryKey: programKeys.programMeasurement(programId, includeDefinitions),
    queryFn: () => getProgramMeasurements(programId, { includeDefinitions }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!programId,
  });
}

export function useProgramAvailableMeasurements(programId: number) {
  return useQuery({
    queryKey: programKeys.programMeasurementsWithDefinitions(programId),
    queryFn: () => getProgramAvailableMeasurements(programId),
    staleTime: 5 * 60 * 1000,
    enabled: !!programId,
  });
}

export function useAddMeasurementDefinitionsToProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      programId,
      measurementDefinitionIds,
    }: {
      programId: number;
      measurementDefinitionIds: number[];
    }) => {
      return addMeasurementDefinitionsToProgram(programId, {
        measurementDefinitionIds,
      });
    },
    onSuccess: (_, variables) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({
        queryKey: programKeys.programMeasurements(),
      });
      queryClient.invalidateQueries({
        queryKey: programKeys.programMeasurementsWithDefinitions(
          variables.programId
        ),
      });
      queryClient.invalidateQueries({
        queryKey: [
          "program",
          variables.programId,
          "allowed-measurement-definitions",
        ],
      });
      toast.success("Measurements added to program successfully.");
    },
    onError: (error) => {
      console.error("Failed to add measurements to program:", error);
      toast.error("Failed to add measurements to program. Please try again.");
    },
  });
}

export function useRemoveMeasurementDefinitionFromProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      programId,
      measurementDefinitionId,
    }: {
      programId: number;
      measurementDefinitionId: number;
    }) =>
      removeMeasurementDefinitionFromProgram(
        programId,
        measurementDefinitionId
      ),
    onSuccess: (_, variables) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({
        queryKey: programKeys.programMeasurements(),
      });
      queryClient.invalidateQueries({
        queryKey: programKeys.programMeasurementsWithDefinitions(
          variables.programId
        ),
      });
      queryClient.invalidateQueries({
        queryKey: [
          "program",
          variables.programId,
          "allowed-measurement-definitions",
        ],
      });
      toast.success("Measurement removed from program successfully.");
    },
    onError: (error) => {
      console.error("Failed to remove measurement from program:", error);
      toast.error(
        "Failed to remove measurement from program. Please try again."
      );
    },
  });
}

export function useProgramPhaseCalculatedMeasurements(
  programId: number,
  programPhaseId: number,
  filters?: { measurementDefinitionId?: number }
) {
  return useQuery({
    queryKey: [
      "program",
      programId,
      "calculated-measurements",
      programPhaseId,
      filters,
    ],
    queryFn: (): Promise<GetProgramCalculatedMeasurementsResponseData> =>
      getProgramCalculatedMeasurements(programId, programPhaseId, filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!programId && !!programPhaseId,
  });
}

// ====== Program Phase Measurement Data Hooks ======

export function useProgramPhaseMeasurementData(
  programId: number,
  programPhaseId: number,
  params: GetProgramPhaseMeasurementsParams
) {
  return useQuery({
    queryKey: [
      "program",
      programId,
      "phase",
      programPhaseId,
      "measurement-data",
      params?.measurementDefinitionId,
      params?.location_id,
      params?.location_type,
    ],
    queryFn: (): Promise<GetProgramPhaseMeasurementsResponseData> =>
      getProgramPhaseMeasurementData(programId, programPhaseId, params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled:
      !!programId && !!programPhaseId && !!params?.measurementDefinitionId,
    retry: false, // Don't retry if measurement doesn't exist
  });
}

export function useCreateProgramPhaseMeasurementData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      programId,
      programPhaseId,
      data,
    }: {
      programId: number;
      programPhaseId: number;
      data: CreateProgramPhaseMeasurementBodyData;
    }) => createProgramPhaseMeasurementData(programId, programPhaseId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "program",
          variables.programId,
          "phase",
          variables.programPhaseId,
          "measurement-data",
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [
          "program",
          variables.programId,
          "calculated-measurements",
          variables.programPhaseId,
        ],
      });
      toast.success("Measurement data created successfully.");
    },
    onError: (error) => {
      console.error("Failed to create measurement data:", error);
      toast.error("Failed to create measurement data. Please try again.");
    },
  });
}

export function useUpdateProgramPhaseMeasurementData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      programId,
      programPhaseId,
      measurementId,
      calculated_value,
    }: {
      programId: number;
      programPhaseId: number;
      measurementId: number;
      calculated_value: number;
    }) =>
      updateProgramPhaseMeasurementData(
        programId,
        programPhaseId,
        measurementId,
        { calculated_value }
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "program",
          variables.programId,
          "phase",
          variables.programPhaseId,
          "measurement-data",
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [
          "program",
          variables.programId,
          "calculated-measurements",
          variables.programPhaseId,
        ],
      });
      toast.success("Measurement data updated successfully.");
    },
    onError: (error) => {
      console.error("Failed to update measurement data:", error);
      toast.error("Failed to update measurement data. Please try again.");
    },
  });
}

export function useDeleteProgramPhaseMeasurementData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      programId,
      programPhaseId,
      measurementId,
    }: {
      programId: number;
      programPhaseId: number;
      measurementId: number;
    }) =>
      deleteProgramPhaseMeasurementData(
        programId,
        programPhaseId,
        measurementId
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "program",
          variables.programId,
          "phase",
          variables.programPhaseId,
          "measurement-data",
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [
          "program",
          variables.programId,
          "calculated-measurements",
          variables.programPhaseId,
        ],
      });
      toast.success("Measurement data deleted successfully.");
    },
    onError: (error) => {
      console.error("Failed to delete measurement data:", error);
      toast.error("Failed to delete measurement data. Please try again.");
    },
  });
}

export function useProgramAllowedMeasurementDefinitions(programId: number) {
  return useQuery({
    queryKey: ["program", programId, "allowed-measurement-definitions"],
    queryFn: (): Promise<GetProgramAllowedMeasurementDefinitionsResponseData> =>
      getProgramAllowedMeasurementDefinitions(programId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!programId,
  });
}

export function useMeasurementDefinition(measurementDefinitionId: number) {
  return useQuery({
    queryKey: ["measurement-definition", measurementDefinitionId],
    queryFn: (): Promise<GetMeasurementDefinitionByIdResponseData> =>
      getMeasurementDefinitionById(measurementDefinitionId),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!measurementDefinitionId,
  });
}
