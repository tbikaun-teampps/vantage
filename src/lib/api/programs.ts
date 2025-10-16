import type { ProgramUpdateFormData } from "@/pages/programs/detail/components/overview-tab/program-update-schema";
import { apiClient } from "./client";
import type { CreateProgramFormData, ProgramObjective } from "@/types/program";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface CreateObjectiveData {
  name: string;
  description?: string;
  program_id: number;
}

export interface UpdateObjectiveData {
  name?: string;
  description?: string;
}

export async function getPrograms(companyId: string): Promise<any[]> {
  const response = await apiClient.get<ApiResponse<any[]>>("/programs", {
    params: { companyId },
  });

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch programs");
  }

  return response.data.data;
}

export async function getProgramById(programId: number): Promise<any> {
  const response = await apiClient.get<ApiResponse<any>>(
    `/programs/${programId}`
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch program");
  }

  return response.data.data;
}

export async function getCurrentProgramPhase(programId: number): Promise<any> {
  const response = await apiClient.get<ApiResponse<any>>(
    `/programs/${programId}/current-phase`
  );

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to fetch current program phase"
    );
  }

  return response.data.data;
}

export async function createProgram(data: CreateProgramFormData): Promise<any> {
  const response = await apiClient.post<ApiResponse<any>>("/programs", data);

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to create program");
  }

  return response.data.data;
}

export async function updateProgram(
  programId: number,
  updates: ProgramUpdateFormData
): Promise<any> {
  const response = await apiClient.put<ApiResponse<any>>(
    `/programs/${programId}`,
    updates
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to update program");
  }

  return response.data.data;
}

// ====== Program Objectives ======

export async function getProgramObjectives(
  programId: number
): Promise<ProgramObjective[]> {
  const response = await apiClient.get<ApiResponse<ProgramObjective[]>>(
    `/programs/${programId}/objectives`
  );

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to fetch program objectives"
    );
  }

  return response.data.data;
}

export async function createProgramObjective(
  data: CreateObjectiveData
): Promise<ProgramObjective> {
  const response = await apiClient.post<ApiResponse<ProgramObjective>>(
    `/programs/${data.program_id}/objectives`,
    { name: data.name, description: data.description }
  );

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to create program objective"
    );
  }

  return response.data.data;
}

export async function updateProgramObjective(
  programId: number,
  objectiveId: number,
  updates: UpdateObjectiveData
): Promise<ProgramObjective> {
  const response = await apiClient.put<ApiResponse<ProgramObjective>>(
    `/programs/${programId}/objectives/${objectiveId}`,
    updates
  );

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to update program objective"
    );
  }

  return response.data.data;
}

export async function deleteProgramObjective(
  programId: number,
  objectiveId: number
): Promise<void> {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/programs/${programId}/objectives/${objectiveId}`
  );

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to delete program objective"
    );
  }
}

export async function getProgramObjectiveCount(
  programId: number
): Promise<number> {
  const response = await apiClient.get<ApiResponse<number>>(
    `/programs/${programId}/objectives/count`
  );

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to fetch program objective count"
    );
  }

  return response.data.data;
}

// ====== Program Questionnaires ======

export async function updateProgramOnsiteQuestionnaire(
  programId: number,
  questionnaireId: number | null
): Promise<any> {
  const response = await apiClient.put<ApiResponse<any>>(
    `/programs/${programId}`,
    { onsite_questionnaire_id: questionnaireId }
  );

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to update onsite questionnaire"
    );
  }

  return response.data.data;
}

export async function updateProgramPresiteQuestionnaire(
  programId: number,
  questionnaireId: number | null
): Promise<any> {
  const response = await apiClient.put<ApiResponse<any>>(
    `/programs/${programId}`,
    { presite_questionnaire_id: questionnaireId }
  );

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to update pre-assessment questionnaire"
    );
  }

  return response.data.data;
}

export async function deleteProgram(programId: number): Promise<void> {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/programs/${programId}`
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to delete program");
  }
}

// ====== Program Phases ======

export interface UpdatePhaseData {
  name?: string | null;
  status?: "scheduled" | "in_progress" | "completed" | "archived";
  notes?: string | null;
  planned_start_date?: string | null;
  actual_start_date?: string | null;
  planned_end_date?: string | null;
  actual_end_date?: string | null;
}

export interface CreatePhaseData {
  name?: string | null;
  sequence_number: number;
  activate?: boolean;
}

export async function updatePhase(
  phaseId: number,
  updateData: UpdatePhaseData
): Promise<any> {
  const response = await apiClient.put<ApiResponse<any>>(
    `/programs/phases/${phaseId}`,
    updateData
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to update phase");
  }

  return response.data.data;
}

export async function createPhase(
  programId: number,
  phaseData: CreatePhaseData
): Promise<any> {
  const response = await apiClient.post<ApiResponse<any>>(
    `/programs/${programId}/phases`,
    phaseData
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to create phase");
  }

  return response.data.data;
}

export async function deletePhase(phaseId: number): Promise<void> {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/programs/phases/${phaseId}`
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to delete phase");
  }
}

// ====== Program Interviews ======

export interface CreateProgramInterviewsData {
  programId: number;
  phaseId: number;
  isPublic?: boolean;
  roleIds?: number[];
  contactIds: number[];
  interviewType: "onsite" | "presite";
}

export async function createProgramInterviews(
  data: CreateProgramInterviewsData
): Promise<any> {
  const response = await apiClient.post<ApiResponse<any>>(
    `/programs/${data.programId}/phases/${data.phaseId}/interviews`,
    {
      isPublic: data.isPublic,
      roleIds: data.roleIds,
      contactIds: data.contactIds,
      interviewType: data.interviewType,
    }
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to create interviews");
  }

  return response.data.data;
}
