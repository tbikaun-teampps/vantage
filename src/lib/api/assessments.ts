import { apiClient } from "./client";
import type {
  AssessmentWithQuestionnaire,
  CreateAssessmentData,
  Assessment,
  AssessmentFilters,
  DesktopAssessment,
  InterviewWithDetails,
} from "@/types/assessment";
import type { UpdateInput } from "@/types";
import type { MeasurementBarChartsResponseData } from "@/types/api/assessments";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export async function getAssessments(
  companyId: string,
  filters?: AssessmentFilters
): Promise<any[]> {
  const response = await apiClient.get<ApiResponse<any[]>>(
    `/companies/${companyId}/assessments`,
    { params: filters }
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch assessments");
  }

  return response.data.data;
}

export async function getAssessmentById(
  id: number
): Promise<AssessmentWithQuestionnaire | DesktopAssessment> {
  const response = await apiClient.get<
    ApiResponse<AssessmentWithQuestionnaire | DesktopAssessment>
  >(`/assessments/${id}`);

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch assessment");
  }

  if (response.data.data.type === "onsite") {
    return response.data.data as AssessmentWithQuestionnaire;
  } else if (response.data.data.type === "desktop") {
    return response.data.data as DesktopAssessment;
  } else {
    throw new Error("Unknown assessment type");
  }
}

export async function getCommentsByAssessmentId(id: number): Promise<any[]> {
  const response = await apiClient.get<ApiResponse<any[]>>(
    `/assessments/${id}/comments`
  );

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to fetch assessment comments"
    );
  }

  return response.data.data;
}

export async function getEvidenceByAssessmentId(id: number): Promise<any[]> {
  const response = await apiClient.get<ApiResponse<any[]>>(
    `/assessments/${id}/evidence`
  );

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to fetch assessment evidence"
    );
  }

  return response.data.data;
}

export async function getActionsByAssessmentId(id: number): Promise<any[]> {
  const response = await apiClient.get<ApiResponse<any[]>>(
    `/assessments/${id}/actions`
  );

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to fetch assessment actions"
    );
  }

  return response.data.data;
}

export async function getInterviewsByAssessmentId(
  id: number
): Promise<InterviewWithDetails[]> {
  const response = await apiClient.get<ApiResponse<InterviewWithDetails[]>>(
    `/assessments/${id}/interviews`
  );

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to fetch assessment interviews"
    );
  }

  return response.data.data;
}

export async function createAssessment(
  data: CreateAssessmentData
): Promise<Assessment> {
  const response = await apiClient.post<ApiResponse<Assessment>>(
    "/assessments",
    data
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to create assessment");
  }

  return response.data.data;
}

export async function updateAssessment(
  id: number,
  updates: UpdateInput<"assessments">
): Promise<Assessment> {
  const response = await apiClient.put<ApiResponse<Assessment>>(
    `/assessments/${id}`,
    updates
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to update assessment");
  }

  return response.data.data;
}

export async function deleteAssessment(id: number): Promise<void> {
  const response = await apiClient.delete<ApiResponse<null>>(
    `/assessments/${id}`
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to delete assessment");
  }
}

export async function duplicateAssessment(id: number): Promise<Assessment> {
  const response = await apiClient.post<ApiResponse<Assessment>>(
    `/assessments/${id}/duplicate`
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to duplicate assessment");
  }

  return response.data.data;
}

// ====== Measurements ======

export async function getAssessmentMeasurements(assessmentId: number) {
  const response = await apiClient.get<ApiResponse<any[]>>(
    `/assessments/${assessmentId}/measurements`
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch measurements");
  }

  return response.data.data;
}

export async function addAssessmentMeasurement(
  assessmentId: number,
  measurementDefinitionId: number,
  value: number,
  location?: {
    id: number;
    type:
      | "business_unit"
      | "region"
      | "site"
      | "asset_group"
      | "work_group"
      | "role";
  }
): Promise<any> {
  const response = await apiClient.post<ApiResponse<any>>(
    `/assessments/${assessmentId}/measurements`,
    {
      measurement_definition_id: measurementDefinitionId,
      calculated_value: value,
      location,
    }
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to add measurement");
  }

  return response.data.data;
}

export async function updateAssessmentMeasurement(
  assessmentId: number,
  measurementId: number,
  updates: { calculated_value?: number }
): Promise<any> {
  const response = await apiClient.put<ApiResponse<any>>(
    `/assessments/${assessmentId}/measurements/${measurementId}`,
    updates
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to update measurement");
  }

  return response.data.data;
}

export async function deleteAssessmentMeasurement(
  assessmentId: number,
  measurementId: number
): Promise<void> {
  const response = await apiClient.delete<ApiResponse<any>>(
    `/assessments/${assessmentId}/measurements/${measurementId}`
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to delete measurement");
  }
  return response.data.data;
}

export async function getAssessmentMeasurementsBarChartData(
  assessmentId: number
): Promise<MeasurementBarChartsResponseData> {
  const response = await apiClient.get<
    ApiResponse<MeasurementBarChartsResponseData>
  >(`/assessments/${assessmentId}/measurements/bar-charts`);

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch bar chart data");
  }

  return response.data.data;
}
