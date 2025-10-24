import type { ProgramUpdateFormData } from "@/components/programs/detail/overview-tab/program-update-schema";
import { apiClient } from "./client";
import type { CreateProgramFormData, ProgramObjective } from "@/types/program";
import type {
  ProgramDetailResponseData,
  ProgramListResponseData,
  ProgramObjectivesListResponseData,
} from "@/types/api/programs";

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

export async function getPrograms(
  companyId: string
): Promise<ProgramListResponseData> {
  const response = await apiClient.get<ApiResponse<ProgramListResponseData>>(
    "/programs",
    {
      params: { companyId },
    }
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch programs");
  }

  return response.data.data;
}

export async function getProgramById(
  programId: number
): Promise<ProgramDetailResponseData> {
  const response = await apiClient.get<ApiResponse<ProgramDetailResponseData>>(
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
): Promise<ProgramObjectivesListResponseData> {
  const response = await apiClient.get<
    ApiResponse<ProgramObjectivesListResponseData>
  >(`/programs/${programId}/objectives`);

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
  name: string;
  activate: boolean;
}

export async function updatePhase(
  programId: number,
  phaseId: number,
  updateData: UpdatePhaseData
): Promise<any> {
  const response = await apiClient.put<ApiResponse<any>>(
    `/programs/${programId}/phases/${phaseId}`,
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
  isIndividualInterview?: boolean;
  roleIds?: number[];
  contactIds: number[];
  interviewType: "onsite" | "presite";
}

export async function createProgramInterviews(
  data: CreateProgramInterviewsData
): Promise<any> {
  const response = await apiClient.post<ApiResponse<any>>(
    `/programs/${data.programId}/interviews`,
    {
      phaseId: data.phaseId,
      isIndividual: data.isIndividualInterview,
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

export async function getProgramMeasurements(
  programId: number,
  includeDefinitions: boolean = false
): Promise<any> {
  const response = await apiClient.get<ApiResponse<any>>(
    `/programs/${programId}/measurements`,
    {
      params: { includeDefinitions },
    }
  );

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to fetch program measurements"
    );
  }

  return response.data.data;
}

export async function getProgramAvailableMeasurements(
  programId: number
): Promise<any> {
  const response = await apiClient.get<ApiResponse<any>>(
    `/programs/${programId}/measurements/available`
  );

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to fetch available program measurements"
    );
  }

  return response.data.data;
}

export async function addMeasurementDefinitionsToProgram(
  programId: number,
  measurementDefinitionIds: number[]
): Promise<any> {
  const response = await apiClient.post<ApiResponse<any>>(
    `/programs/${programId}/measurement-definitions`,
    {
      measurementDefinitionIds,
    }
  );

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to add measurement definitions to program"
    );
  }

  return response.data.data;
}

export async function removeMeasurementDefinitionFromProgram(
  programId: number,
  measurementDefinitionId: number
): Promise<void> {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/programs/${programId}/measurement-definitions/${measurementDefinitionId}`
  );

  if (!response.data.success) {
    throw new Error(
      response.data.error ||
        "Failed to remove measurement definition from program"
    );
  }
}

export async function getProgramCalculatedMeasurements(
  programid: number,
  programPhaseId: number
): Promise<any> {
  const response = await apiClient.get<ApiResponse<any>>(
    `/programs/${programid}/phases/${programPhaseId}/calculated-measurements`
  );

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to fetch program calculated measurements"
    );
  }

  return response.data.data;
}

// ====== Program Phase Measurement Data CRUD ======

export interface LocationParams {
  business_unit_id?: number;
  region_id?: number;
  site_id?: number;
  asset_group_id?: number;
  work_group_id?: number;
  role_id?: number;
}

export async function getProgramPhaseMeasurementData(
  programId: number,
  programPhaseId: number,
  measurementDefinitionId: number,
  location?: LocationParams
): Promise<any> {
  const response = await apiClient.get<ApiResponse<any>>(
    `/programs/${programId}/phases/${programPhaseId}/calculated-measurement`,
    {
      params: {
        measurementId: measurementDefinitionId,
        location,
      },
    }
  );

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to fetch measurement data"
    );
  }

  return response.data.data;
}

export interface CreateMeasurementDataParams extends LocationParams {
  measurement_definition_id: number;
  calculated_value: number;
}

export async function createProgramPhaseMeasurementData(
  programId: number,
  programPhaseId: number,
  data: CreateMeasurementDataParams
): Promise<any> {
  const response = await apiClient.post<ApiResponse<any>>(
    `/programs/${programId}/phases/${programPhaseId}/measurement-data`,
    data
  );

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to create measurement data"
    );
  }

  return response.data.data;
}

export async function updateProgramPhaseMeasurementData(
  programId: number,
  programPhaseId: number,
  measurementId: number,
  calculated_value: number
): Promise<any> {
  const response = await apiClient.put<ApiResponse<any>>(
    `/programs/${programId}/phases/${programPhaseId}/measurement-data/${measurementId}`,
    { calculated_value }
  );

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to update measurement data"
    );
  }

  return response.data.data;
}

export async function deleteProgramPhaseMeasurementData(
  programId: number,
  programPhaseId: number,
  measurementId: number
): Promise<void> {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/programs/${programId}/phases/${programPhaseId}/measurement-data/${measurementId}`
  );

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to delete measurement data"
    );
  }
}
