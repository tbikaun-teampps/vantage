import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateProgramFormData,
  Program,
} from "@/types/program";
import type { ProgramUpdateFormData } from "@/components/programs/detail/overview-tab/program-update-schema";
import { toast } from "sonner";
import {
  createProgram,
  createPhase,
  createProgramInterviews,
  deletePhase,
  deleteProgram,
  getCurrentProgramPhase,
  getProgramById,
  getPrograms,
  updatePhase,
  updateProgram,
  updateProgramOnsiteQuestionnaire,
  updateProgramPresiteQuestionnaire,
  type CreatePhaseData,
  type UpdatePhaseData,
} from "@/lib/api/programs";

// Query key factory for cache management
export const programKeys = {
  all: ["programs"] as const,
  lists: () => [...programKeys.all, "list"] as const,
  list: (companyId?: string) =>
    [...programKeys.lists(), { companyId }] as const,
  details: () => [...programKeys.all, "detail"] as const,
  detail: (id: number) => [...programKeys.details(), id] as const,
  phases: () => [...programKeys.all, "phases"] as const,
  currentPhase: (programId: number) =>
    [...programKeys.phases(), "current", programId] as const,
};

// Hook to fetch programs with optional company filtering
export function usePrograms(companyId: string) {
  return useQuery({
    queryKey: programKeys.list(companyId),
    queryFn: () => getPrograms(companyId),
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

// Hook to fetch the current program phase
export function useCurrentProgramPhase(programId: number) {
  return useQuery({
    queryKey: programKeys.currentPhase(programId),
    queryFn: () => getCurrentProgramPhase(programId),
    staleTime: 2 * 60 * 1000, // 2 minutes - phase status changes more frequently
    enabled: !!programId, // Only run if programId is provided
  });
}

export function useCreateProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProgramFormData) => createProgram(data),
    onSuccess: (program: Program) => {
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
      updateData: ProgramUpdateFormData;
    }) => updateProgram(programId, updateData),
    onSuccess: (program: Program) => {
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
      phaseId,
      updateData,
    }: {
      phaseId: number;
      updateData: UpdatePhaseData;
    }) => updatePhase(phaseId, updateData),
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
      phaseData,
    }: {
      programId: number;
      phaseData: CreatePhaseData;
    }) => createPhase(programId, phaseData),
    onSuccess: (phase, variables) => {
      // Invalidate program queries to refresh phase data
      queryClient.invalidateQueries({ queryKey: programKeys.all });

      const message = variables.phaseData.activate
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
    mutationFn: (phaseId: number) => deletePhase(phaseId),
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
      isPublic = false,
      roleIds = [],
      contactIds,
      interviewType,
    }: {
      programId: number;
      phaseId: number;
      isPublic?: boolean;
      roleIds?: number[];
      contactIds: number[];
      interviewType: "onsite" | "presite";
    }) =>
      createProgramInterviews({
        programId,
        phaseId,
        isPublic,
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

      const interviewCount = variables.isPublic
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
