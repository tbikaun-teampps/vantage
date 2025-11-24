import { apiClient } from "./client";
import type {
  GetAssessmentsResponseData,
  AddAssessmentMeasurementBodyData,
  AddAssessmentMeasurementResponseData,
  CreateAssessmentBodyData,
  CreateAssessmentResponseData,
  DuplicateAssessmentResponseData,
  GetActionsByAssessmentIdResponseData,
  GetAssessmentByIdResponseData,
  GetAssessmentMeasurementBarChartResponseData,
  GetAssessmentMeasurementsResponseData,
  GetCommentsByAssessmentIdResponseData,
  GetEvidenceByAssessmentIdResponseData,
  GetInterviewsByAssessmentIdResponseData,
  UpdateAssessmentBodyData,
  UpdateAssessmentMeasurementBodyData,
  UpdateAssessmentMeasurementResponseData,
  UpdateAssessmentResponseData,
  GetAssessmentsParams,
  GetAssessmentMeasurementDefinitionsByIdResponseData,
} from "@/types/api/assessments";
import type { ApiResponse } from "./utils";

export async function getAssessments(
  companyId: string,
  params: GetAssessmentsParams
): Promise<GetAssessmentsResponseData> {
  const response = await apiClient.get<ApiResponse<GetAssessmentsResponseData>>(
    `/companies/${companyId}/assessments`,
    { params }
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch assessments");
  }

  return response.data.data;
}

export async function getAssessmentById(
  id: number
): Promise<GetAssessmentByIdResponseData> {
  // AssessmentWithQuestionnaire | DesktopAssessment
  const response = await apiClient.get<
    ApiResponse<GetAssessmentByIdResponseData> // AssessmentWithQuestionnaire | DesktopAssessment
  >(`/assessments/${id}`);

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch assessment");
  }

  return response.data.data;

  // if (response.data.data.type === "onsite") {
  //   return response.data.data as AssessmentWithQuestionnaire;
  // } else if (response.data.data.type === "desktop") {
  //   return response.data.data as DesktopAssessment;
  // } else {
  //   throw new Error("Unknown assessment type");
  // }
}

export async function getCommentsByAssessmentId(
  id: number
): Promise<GetCommentsByAssessmentIdResponseData> {
  const response = await apiClient.get<
    ApiResponse<GetCommentsByAssessmentIdResponseData>
  >(`/assessments/${id}/comments`);

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to fetch assessment comments"
    );
  }

  return response.data.data;
}

export async function getEvidenceByAssessmentId(
  id: number
): Promise<GetEvidenceByAssessmentIdResponseData> {
  const response = await apiClient.get<
    ApiResponse<GetEvidenceByAssessmentIdResponseData>
  >(`/assessments/${id}/evidence`);

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to fetch assessment evidence"
    );
  }

  return response.data.data;
}

export async function getActionsByAssessmentId(
  id: number
): Promise<GetActionsByAssessmentIdResponseData> {
  const response = await apiClient.get<
    ApiResponse<GetActionsByAssessmentIdResponseData>
  >(`/assessments/${id}/actions`);

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to fetch assessment actions"
    );
  }

  return response.data.data;
}

export async function getInterviewsByAssessmentId(
  id: number
): Promise<GetInterviewsByAssessmentIdResponseData> {
  const response = await apiClient.get<
    ApiResponse<GetInterviewsByAssessmentIdResponseData>
  >(`/assessments/${id}/interviews`);

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to fetch assessment interviews"
    );
  }

  return response.data.data;
}

export async function createAssessment(
  data: CreateAssessmentBodyData
): Promise<CreateAssessmentResponseData> {
  const response = await apiClient.post<
    ApiResponse<CreateAssessmentResponseData>
  >("/assessments", data);

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to create assessment");
  }

  return response.data.data;
}

export async function updateAssessment(
  id: number,
  updates: UpdateAssessmentBodyData
): Promise<UpdateAssessmentResponseData> {
  const response = await apiClient.put<
    ApiResponse<UpdateAssessmentResponseData>
  >(`/assessments/${id}`, updates);

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to update assessment");
  }

  return response.data.data;
}

export async function deleteAssessment(id: number): Promise<void> {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/assessments/${id}`
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to delete assessment");
  }
}

export async function duplicateAssessment(
  id: number
): Promise<DuplicateAssessmentResponseData> {
  const response = await apiClient.post<
    ApiResponse<DuplicateAssessmentResponseData>
  >(`/assessments/${id}/duplicate`);

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to duplicate assessment");
  }

  return response.data.data;
}

// ====== Measurements ======

export async function getAssessmentMeasurementDefinitions(
  assessmentId: number
): Promise<GetAssessmentMeasurementDefinitionsByIdResponseData> {
  const response = await apiClient.get<
    ApiResponse<GetAssessmentMeasurementDefinitionsByIdResponseData>
  >(`/assessments/${assessmentId}/measurement-definitions`);

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to fetch measurement definitions"
    );
  }

  return response.data.data;
}

export async function getAssessmentMeasurements(
  assessmentId: number
): Promise<GetAssessmentMeasurementsResponseData> {
  const response = await apiClient.get<
    ApiResponse<GetAssessmentMeasurementsResponseData>
  >(`/assessments/${assessmentId}/measurements`);

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch measurements");
  }

  return response.data.data;
}

export async function addAssessmentMeasurement(
  assessmentId: number,
  data: AddAssessmentMeasurementBodyData
  // measurementDefinitionId: number,
  // value: number,
  // location?: {
  //   id: number;
  //   type:
  //     | "business_unit"
  //     | "region"
  //     | "site"
  //     | "asset_group"
  //     | "work_group"
  //     | "role";
  // }
): Promise<AddAssessmentMeasurementResponseData> {
  const response = await apiClient.post<
    ApiResponse<AddAssessmentMeasurementResponseData>
  >(`/assessments/${assessmentId}/measurements`, data);

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to add measurement");
  }

  return response.data.data;
}

export async function updateAssessmentMeasurement(
  assessmentId: number,
  measurementId: number,
  updates: UpdateAssessmentMeasurementBodyData
): Promise<UpdateAssessmentMeasurementResponseData> {
  const response = await apiClient.put<
    ApiResponse<UpdateAssessmentMeasurementResponseData>
  >(`/assessments/${assessmentId}/measurements/${measurementId}`, updates);

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to update measurement");
  }

  return response.data.data;
}

export async function deleteAssessmentMeasurement(
  assessmentId: number,
  measurementId: number
): Promise<void> {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/assessments/${assessmentId}/measurements/${measurementId}`
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to delete measurement");
  }
}

export async function getAssessmentMeasurementsBarChartData(
  assessmentId: number
): Promise<GetAssessmentMeasurementBarChartResponseData> {
  const response = await apiClient.get<
    ApiResponse<GetAssessmentMeasurementBarChartResponseData>
  >(`/assessments/${assessmentId}/measurements/bar-charts`);

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch bar chart data");
  }

  return response.data.data;
}
