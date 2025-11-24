import { apiClient } from "./client";
import type {
  AddMeasurementDefinitionsToProgramBodyData,
  AddMeasurementDefinitionsToProgramResponseData,
  CreateProgramBodyData,
  CreateProgramInterviewsBodyData,
  CreateProgramInterviewsResponseData,
  CreateProgramObjectiveBodyData,
  CreateProgramObjectiveResponseData,
  CreateProgramPhaseBodyData,
  CreateProgramPhaseMeasurementBodyData,
  CreateProgramPhaseMeasurementResponseData,
  CreateProgramPhaseResponseData,
  CreateProgramResponseData,
  GetProgramAllowedMeasurementDefinitionsResponseData,
  GetProgramAvailableMeasurementsResponseData,
  GetProgramByIdResponseData,
  GetProgramCalculatedMeasurementsParams,
  GetProgramCalculatedMeasurementsResponseData,
  GetProgramMeasurementsParams,
  GetProgramMeasurementsResponseData,
  GetProgramObjectivesResponseData,
  GetProgramPhaseMeasurementsParams,
  GetProgramPhaseMeasurementsResponseData,
  GetProgramsParams,
  GetProgramsResponseData,
  UpdateProgramBodyData,
  UpdateProgramObjectiveBodyData,
  UpdateProgramObjectiveResponseData,
  UpdateProgramOnsiteQuestionnaireResponseData,
  UpdateProgramPhaseBodyData,
  UpdateProgramPhaseMeasurementBodyData,
  UpdateProgramPhaseMeasurementResponseData,
  UpdateProgramPhaseResponseData,
  UpdateProgramPresiteQuestionnaireResponseData,
  UpdateProgramResponseData,
} from "@/types/api/programs";
import type { ApiResponse } from "./utils";

export async function getPrograms(
  params: GetProgramsParams
): Promise<GetProgramsResponseData> {
  const response = await apiClient.get<ApiResponse<GetProgramsResponseData>>(
    "/programs",
    {
      params,
    }
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch programs");
  }

  return response.data.data;
}

export async function getProgramById(
  programId: number
): Promise<GetProgramByIdResponseData> {
  const response = await apiClient.get<ApiResponse<GetProgramByIdResponseData>>(
    `/programs/${programId}`
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch program");
  }

  return response.data.data;
}

export async function createProgram(
  data: CreateProgramBodyData
): Promise<CreateProgramResponseData> {
  const response = await apiClient.post<ApiResponse<CreateProgramResponseData>>(
    "/programs",
    data
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to create program");
  }

  return response.data.data;
}

export async function updateProgram(
  programId: number,
  updates: UpdateProgramBodyData
): Promise<UpdateProgramResponseData> {
  const response = await apiClient.put<ApiResponse<UpdateProgramResponseData>>(
    `/programs/${programId}`,
    updates
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to update program");
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

// ====== Program Objectives ======

export async function getProgramObjectives(
  programId: number
): Promise<GetProgramObjectivesResponseData> {
  const response = await apiClient.get<
    ApiResponse<GetProgramObjectivesResponseData>
  >(`/programs/${programId}/objectives`);

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to fetch program objectives"
    );
  }

  return response.data.data;
}

export async function createProgramObjective(
  programId: number,
  data: CreateProgramObjectiveBodyData
): Promise<CreateProgramObjectiveResponseData> {
  const response = await apiClient.post<
    ApiResponse<CreateProgramObjectiveResponseData>
  >(`/programs/${programId}/objectives`, data);

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
  updates: UpdateProgramObjectiveBodyData
): Promise<UpdateProgramObjectiveResponseData> {
  const response = await apiClient.put<
    ApiResponse<UpdateProgramObjectiveResponseData>
  >(`/programs/${programId}/objectives/${objectiveId}`, updates);

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
): Promise<UpdateProgramOnsiteQuestionnaireResponseData> {
  const response = await apiClient.put<
    ApiResponse<UpdateProgramOnsiteQuestionnaireResponseData>
  >(`/programs/${programId}`, { onsite_questionnaire_id: questionnaireId });

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
): Promise<UpdateProgramPresiteQuestionnaireResponseData> {
  const response = await apiClient.put<
    ApiResponse<UpdateProgramPresiteQuestionnaireResponseData>
  >(`/programs/${programId}`, { presite_questionnaire_id: questionnaireId });

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to update pre-assessment questionnaire"
    );
  }

  return response.data.data;
}

// ====== Program Phases ======

export async function updatePhase(
  programId: number,
  phaseId: number,
  updates: UpdateProgramPhaseBodyData
): Promise<UpdateProgramPhaseResponseData> {
  const response = await apiClient.put<
    ApiResponse<UpdateProgramPhaseResponseData>
  >(`/programs/${programId}/phases/${phaseId}`, updates);

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to update phase");
  }

  return response.data.data;
}

export async function createPhase(
  programId: number,
  data: CreateProgramPhaseBodyData
): Promise<CreateProgramPhaseResponseData> {
  const response = await apiClient.post<
    ApiResponse<CreateProgramPhaseResponseData>
  >(`/programs/${programId}/phases`, data);

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to create phase");
  }

  return response.data.data;
}

export async function deletePhase(
  programId: number,
  phaseId: number
): Promise<void> {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/programs/${programId}/phases/${phaseId}`
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to delete phase");
  }
}

// ====== Program Interviews ======

export async function createProgramInterviews(
  programId: number,
  data: CreateProgramInterviewsBodyData
): Promise<CreateProgramInterviewsResponseData> {
  const response = await apiClient.post<
    ApiResponse<CreateProgramInterviewsResponseData>
  >(`/programs/${programId}/interviews`, data);

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to create interviews");
  }

  return response.data.data;
}

// ====== Program Measurements ======

export async function getProgramMeasurements(
  programId: number,
  params: GetProgramMeasurementsParams
): Promise<GetProgramMeasurementsResponseData> {
  const response = await apiClient.get<
    ApiResponse<GetProgramMeasurementsResponseData>
  >(`/programs/${programId}/measurements`, {
    params,
  });

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to fetch program measurements"
    );
  }

  return response.data.data;
}

export async function getProgramAvailableMeasurements(
  programId: number
): Promise<GetProgramAvailableMeasurementsResponseData> {
  const response = await apiClient.get<
    ApiResponse<GetProgramAvailableMeasurementsResponseData>
  >(`/programs/${programId}/measurements/available`);

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to fetch available program measurements"
    );
  }

  return response.data.data;
}

export async function addMeasurementDefinitionsToProgram(
  programId: number,
  data: AddMeasurementDefinitionsToProgramBodyData
): Promise<AddMeasurementDefinitionsToProgramResponseData> {
  const response = await apiClient.post<
    ApiResponse<AddMeasurementDefinitionsToProgramResponseData>
  >(`/programs/${programId}/measurement-definitions`, data);

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
  programId: number,
  programPhaseId: number,
  params: GetProgramCalculatedMeasurementsParams
): Promise<GetProgramCalculatedMeasurementsResponseData> {
  const response = await apiClient.get<
    ApiResponse<GetProgramCalculatedMeasurementsResponseData>
  >(`/programs/${programId}/phases/${programPhaseId}/calculated-measurements`, {
    params,
  });

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to fetch program calculated measurements"
    );
  }

  return response.data.data;
}

// ====== Program Phase Measurement Data CRUD ======

export async function getProgramPhaseMeasurementData(
  programId: number,
  programPhaseId: number,
  params: GetProgramPhaseMeasurementsParams
): Promise<GetProgramPhaseMeasurementsResponseData> {
  const response = await apiClient.get<
    ApiResponse<GetProgramPhaseMeasurementsResponseData>
  >(`/programs/${programId}/phases/${programPhaseId}/calculated-measurement`, {
    params,
  });

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch measurement data");
  }

  return response.data.data;
}

export async function createProgramPhaseMeasurementData(
  programId: number,
  programPhaseId: number,
  data: CreateProgramPhaseMeasurementBodyData
): Promise<CreateProgramPhaseMeasurementResponseData> {
  const response = await apiClient.post<
    ApiResponse<CreateProgramPhaseMeasurementResponseData>
  >(`/programs/${programId}/phases/${programPhaseId}/measurement-data`, data);

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to create measurement data");
  }

  return response.data.data;
}

export async function updateProgramPhaseMeasurementData(
  programId: number,
  programPhaseId: number,
  measurementId: number,
  data: UpdateProgramPhaseMeasurementBodyData
): Promise<UpdateProgramPhaseMeasurementResponseData> {
  const response = await apiClient.put<
    ApiResponse<UpdateProgramPhaseMeasurementResponseData>
  >(
    `/programs/${programId}/phases/${programPhaseId}/measurement-data/${measurementId}`,
    data
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to update measurement data");
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
    throw new Error(response.data.error || "Failed to delete measurement data");
  }
}

export async function getProgramAllowedMeasurementDefinitions(
  programId: number
): Promise<GetProgramAllowedMeasurementDefinitionsResponseData> {
  const response = await apiClient.get<
    ApiResponse<GetProgramAllowedMeasurementDefinitionsResponseData>
  >(`/programs/${programId}/measurement-definitions/allowed`);

  if (!response.data.success) {
    throw new Error(
      response.data.error ||
        "Failed to fetch program allowed measurement definitions"
    );
  }

  return response.data.data;
}
