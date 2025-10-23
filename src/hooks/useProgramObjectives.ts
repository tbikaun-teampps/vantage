import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getProgramObjectives,
  createProgramObjective,
  updateProgramObjective,
  deleteProgramObjective,
} from "@/lib/api/programs";
import type {
  CreateObjectiveData,
  UpdateObjectiveData,
} from "@/lib/api/programs";

export function useProgramObjectives(programId: number) {
  return useQuery({
    queryKey: ["program-objectives", programId],
    queryFn: () => getProgramObjectives(programId),
    enabled: !!programId,
  });
}

export function useCreateObjective() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateObjectiveData) => createProgramObjective(data),
    onSuccess: (_, variables) => {
      toast.success("Objective created successfully");
      queryClient.invalidateQueries({
        queryKey: ["program-objectives", variables.program_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["program", variables.program_id],
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to create objective", {
        description: error.message,
      });
    },
  });
}

export function useUpdateObjective() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      programId,
      data,
    }: {
      id: number;
      programId: number;
      data: UpdateObjectiveData;
    }) => updateProgramObjective(programId, id, data),
    onSuccess: (objective) => {
      toast.success("Objective updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["program-objectives", objective.program_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["program", objective.program_id],
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to update objective", {
        description: error.message,
      });
    },
  });
}

export function useDeleteObjective() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, programId }: { id: number; programId: number }) => {
      return deleteProgramObjective(programId, id).then(() => ({ programId }));
    },
    onSuccess: (result) => {
      toast.success("Objective deleted successfully");
      queryClient.invalidateQueries({
        queryKey: ["program-objectives", result.programId],
      });
      queryClient.invalidateQueries({
        queryKey: ["program", result.programId],
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to delete objective", {
        description: error.message,
      });
    },
  });
}
