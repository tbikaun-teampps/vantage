import { apiClient } from "./client";
import type { ApiResponse } from "./utils";
import type {
  BatchCreateQuestionnaireRatingScalesBodyData,
  BatchCreateQuestionnaireRatingScalesResponseData,
  CheckQuestionnaireUsageResponseData,
  CreateQuestionnaireBodyData,
  CreateQuestionnaireQuestionBodyData,
  CreateQuestionnaireQuestionResponseData,
  CreateQuestionnaireRatingScaleBodyData,
  CreateQuestionnaireRatingScaleResponseData,
  CreateQuestionnaireResponseData,
  CreateQuestionnaireSectionBodyData,
  CreateQuestionnaireSectionResponseData,
  CreateQuestionnaireStepBodyData,
  CreateQuestionnaireStepResponseData,
  CreateQuestionPartBodyData,
  CreateQuestionPartResponseData,
  DuplicateQuestionnaireQuestionResponseData,
  DuplicateQuestionnaireResponseData,
  DuplicateQuestionPartResponseData,
  GetQuestionnaireByIdResponseData,
  GetQuestionnaireRatingScalesResponseData,
  GetQuestionnairesResponseData,
  GetQuestionPartsResponseData,
  GetQuestionRatingScaleMappingResponseData,
  ReorderQuestionPartsResponse,
  UpdateQuestionApplicableRolesBodyData,
  UpdateQuestionApplicableRolesResponseData,
  UpdateQuestionnaireBodyData,
  UpdateQuestionnaireQuestionBodyData,
  UpdateQuestionnaireQuestionResponseData,
  UpdateQuestionnaireRatingScaleResponseData,
  UpdateQuestionnaireResponseData,
  UpdateQuestionnaireSectionBodyData,
  UpdateQuestionnaireSectionResponseData,
  UpdateQuestionnaireStepBodyData,
  UpdateQuestionnaireStepResponseData,
  UpdateQuestionPartBodyData,
  UpdateQuestionPartResponseData,
  UpdateQuestionRatingScaleBodyData,
  UpdateQuestionRatingScaleMappingBodyData,
  UpdateQuestionRatingScaleMappingResponseData,
  UpdateRatingScaleBodyData,
  UpdateRatingScaleResponseData,
} from "@/types/api/questionnaire";

// ============================================================================
// QUESTIONNAIRE OPERATIONS
// ============================================================================

export async function getQuestionnaires(
  companyId: string
): Promise<GetQuestionnairesResponseData> {
  const response = await apiClient.get<
    ApiResponse<GetQuestionnairesResponseData>
  >(`/companies/${companyId}/questionnaires`);

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to fetch questionnaires for company"
    );
  }

  return response.data.data;
}

export async function getQuestionnaireById(
  id: number
): Promise<GetQuestionnaireByIdResponseData> {
  const response = await apiClient.get<
    ApiResponse<GetQuestionnaireByIdResponseData>
  >(`/questionnaires/${id}`);

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch questionnaire");
  }

  return response.data.data;
}

export async function createQuestionnaire(
  data: CreateQuestionnaireBodyData
): Promise<CreateQuestionnaireResponseData> {
  const response = await apiClient.post<
    ApiResponse<CreateQuestionnaireResponseData>
  >("/questionnaires", data);

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to create questionnaire");
  }

  return response.data.data;
}

export async function updateQuestionnaire(
  id: number,
  updates: UpdateQuestionnaireBodyData
): Promise<UpdateQuestionnaireResponseData> {
  const response = await apiClient.put<
    ApiResponse<UpdateQuestionnaireResponseData>
  >(`/questionnaires/${id}`, updates);

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to update questionnaire");
  }

  return response.data.data;
}

export async function deleteQuestionnaire(id: number): Promise<void> {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/questionnaires/${id}`
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to delete questionnaire");
  }
}

export async function duplicateQuestionnaire(
  id: number
): Promise<DuplicateQuestionnaireResponseData> {
  const response = await apiClient.post<
    ApiResponse<DuplicateQuestionnaireResponseData>
  >(`/questionnaires/${id}/duplicate`);

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to duplicate questionnaire");
  }

  return response.data.data;
}

export async function checkQuestionnaireUsage(
  id: number
): Promise<CheckQuestionnaireUsageResponseData> {
  const response = await apiClient.get<
    ApiResponse<CheckQuestionnaireUsageResponseData>
  >(`/questionnaires/${id}/usage`);

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to check questionnaire usage"
    );
  }

  return response.data.data;
}

// ============================================================================
// SECTION OPERATIONS
// ============================================================================

export async function createSection(
  data: CreateQuestionnaireSectionBodyData
): Promise<CreateQuestionnaireSectionResponseData> {
  const response = await apiClient.post<
    ApiResponse<CreateQuestionnaireSectionResponseData>
  >(`/questionnaires/sections`, data);

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to create section");
  }

  return response.data.data;
}

export async function updateSection(
  sectionId: number,
  updates: UpdateQuestionnaireSectionBodyData
): Promise<UpdateQuestionnaireSectionResponseData> {
  const response = await apiClient.put<
    ApiResponse<UpdateQuestionnaireSectionResponseData>
  >(`/questionnaires/sections/${sectionId}`, updates);

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to update section");
  }

  return response.data.data;
}

export async function deleteSection(sectionId: number): Promise<void> {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/questionnaires/sections/${sectionId}`
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to delete section");
  }
}

// ============================================================================
// STEP OPERATIONS
// ============================================================================

export async function createStep(
  data: CreateQuestionnaireStepBodyData
): Promise<CreateQuestionnaireStepResponseData> {
  const response = await apiClient.post<
    ApiResponse<CreateQuestionnaireStepResponseData>
  >("/questionnaires/steps", {
    questionnaire_section_id: data.questionnaire_section_id,
    title: data.title,
  });

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to create step");
  }

  return response.data.data;
}

export async function updateStep(
  id: number,
  updates: UpdateQuestionnaireStepBodyData
): Promise<UpdateQuestionnaireStepResponseData> {
  const response = await apiClient.put<
    ApiResponse<UpdateQuestionnaireStepResponseData>
  >(`/questionnaires/steps/${id}`, updates);

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to update step");
  }

  return response.data.data;
}

export async function deleteStep(id: number): Promise<void> {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/questionnaires/steps/${id}`
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to delete step");
  }
}

// ============================================================================
// QUESTION OPERATIONS
// ============================================================================

export async function createQuestion(
  data: CreateQuestionnaireQuestionBodyData
): Promise<CreateQuestionnaireQuestionResponseData> {
  const response = await apiClient.post<
    ApiResponse<CreateQuestionnaireQuestionResponseData>
  >("/questionnaires/questions", data);

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to create question");
  }

  return response.data.data;
}

export async function updateQuestion(
  id: number,
  updates: UpdateQuestionnaireQuestionBodyData
): Promise<UpdateQuestionnaireQuestionResponseData> {
  const response = await apiClient.put<
    ApiResponse<UpdateQuestionnaireQuestionResponseData>
  >(`/questionnaires/questions/${id}`, updates);

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to update question");
  }

  return response.data.data;
}

export async function deleteQuestion(id: number): Promise<void> {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/questionnaires/questions/${id}`
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to delete question");
  }
}

export async function duplicateQuestion(
  id: number
): Promise<DuplicateQuestionnaireQuestionResponseData> {
  const response = await apiClient.post<
    ApiResponse<DuplicateQuestionnaireQuestionResponseData>
  >(`/questionnaires/questions/${id}/duplicate`);

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to duplicate question");
  }

  return response.data.data;
}

// ============================================================================
// RATING SCALE OPERATIONS
// ============================================================================

export async function getRatingScales(
  questionnaireId: number
): Promise<GetQuestionnaireRatingScalesResponseData> {
  const response = await apiClient.get<
    ApiResponse<GetQuestionnaireRatingScalesResponseData>
  >(`/questionnaires/${questionnaireId}/rating-scales`);

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch rating scales");
  }

  return response.data.data;
}

export async function createRatingScale(
  questionnaireId: number,
  data: CreateQuestionnaireRatingScaleBodyData
): Promise<CreateQuestionnaireRatingScaleResponseData> {
  const response = await apiClient.post<
    ApiResponse<CreateQuestionnaireRatingScaleResponseData>
  >(`/questionnaires/${questionnaireId}/rating-scale`, data);

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to create rating scale");
  }

  return response.data.data;
}

export async function createRatingScalesBatch(
  questionnaireId: number,
  data: BatchCreateQuestionnaireRatingScalesBodyData
): Promise<BatchCreateQuestionnaireRatingScalesResponseData> {
  const response = await apiClient.post<
    ApiResponse<BatchCreateQuestionnaireRatingScalesResponseData>
  >(`/questionnaires/${questionnaireId}/rating-scales/batch`, data);

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to create rating scales");
  }

  return response.data.data;
}

export async function updateRatingScale(
  id: number,
  updates: UpdateRatingScaleBodyData
): Promise<UpdateRatingScaleResponseData> {
  const response = await apiClient.put<
    ApiResponse<UpdateRatingScaleResponseData>
  >(`/questionnaires/rating-scales/${id}`, updates);

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to update rating scale");
  }

  return response.data.data;
}

export async function deleteRatingScale(id: number): Promise<void> {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/questionnaires/rating-scales/${id}`
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to delete rating scale");
  }
}

// ============================================================================
// QUESTION RATING SCALE AND ROLE ASSOCIATIONS
// ============================================================================

// Note: These operations might need to be handled differently based on the server implementation
// For now, we'll implement them as direct calls, but they might need to be integrated into
// the question update operations on the server side

export async function addQuestionRatingScale(data: {
  questionId: number;
  questionnaire_rating_scale_id: number;
  description: string;
}): Promise<any> {
  const response = await apiClient.post<ApiResponse<any>>(
    `/questionnaires/questions/${data.questionId}/rating-scales`,
    {
      questionnaire_rating_scale_id: data.questionnaire_rating_scale_id,
      description: data.description,
    }
  );

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to add question rating scale"
    );
  }

  return response.data.data;
}

export async function updateQuestionRatingScale(
  questionId: number,
  questionRatingScaleId: number,
  data: UpdateQuestionRatingScaleBodyData
): Promise<UpdateQuestionnaireRatingScaleResponseData> {
  const response = await apiClient.put<
    ApiResponse<UpdateQuestionnaireRatingScaleResponseData>
  >(
    `/questionnaires/questions/${questionId}/rating-scales/${questionRatingScaleId}`,
    data
  );

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to update question rating scale"
    );
  }
  return response.data.data;
}

export async function addAllQuestionnaireRatingScales(data: {
  questionnaireId: number;
  questionId: number;
}): Promise<any[]> {
  const response = await apiClient.post<ApiResponse<any[]>>(
    `/questionnaires/questions/${data.questionId}/add-questionnaire-rating-scales`,
    {
      questionnaireId: data.questionnaireId,
      questionId: data.questionId,
    }
  );

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to add all questionnaire rating scales"
    );
  }
  return response.data.data;
}

export async function deleteQuestionRatingScale(data: {
  questionId: number;
  questionRatingScaleId: number;
}): Promise<void> {
  const response = await apiClient.delete<ApiResponse<null>>(
    `/questionnaires/questions/${data.questionId}/rating-scales/${data.questionRatingScaleId}`
  );

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to delete question rating scale"
    );
  }
}

export async function updateQuestionRoles(
  questionId: number,
  data: UpdateQuestionApplicableRolesBodyData
): Promise<UpdateQuestionApplicableRolesResponseData> {
  const response = await apiClient.put<
    ApiResponse<UpdateQuestionApplicableRolesResponseData>
  >(`/questionnaires/questions/${questionId}/applicable-roles`, data);

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to update question applicable roles"
    );
  }
  return response.data.data;
}

// ===== Import =====
export async function importQuestionnaire(data: {
  file: File;
  name: string;
  companyId: string;
  description?: string;
  guidelines?: string;
}): Promise<any> {
  const formData = new FormData();
  formData.append("file", data.file);
  formData.append("name", data.name);
  formData.append("company_id", data.companyId);
  if (data.description) {
    formData.append("description", data.description);
  }
  if (data.guidelines) {
    formData.append("guidelines", data.guidelines);
  }

  const response = await apiClient.post<ApiResponse<any>>(
    `/questionnaires/import`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to import questionnaire");
  }

  return response.data.data;
}

// ===== Question Parts =====

export async function getQuestionParts(
  questionId: number
): Promise<GetQuestionPartsResponseData> {
  const response = await apiClient.get<
    ApiResponse<GetQuestionPartsResponseData>
  >(`/questionnaires/questions/${questionId}/parts`);

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to fetch question parts");
  }

  return response.data.data;
}

export async function createQuestionPart(
  questionId: number,
  data: CreateQuestionPartBodyData
): Promise<CreateQuestionPartResponseData> {
  const response = await apiClient.post<
    ApiResponse<CreateQuestionPartResponseData>
  >(`/questionnaires/questions/${questionId}/parts`, data);

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to create question part");
  }
  return response.data.data;
}

export async function updateQuestionPart(
  questionId: number,
  partId: number,
  data: UpdateQuestionPartBodyData
): Promise<UpdateQuestionPartResponseData> {
  const response = await apiClient.put<
    ApiResponse<UpdateQuestionPartResponseData>
  >(`/questionnaires/questions/${questionId}/parts/${partId}`, data);

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to update question part");
  }
  return response.data.data;
}

export async function deleteQuestionPart(
  questionId: number,
  partId: number
): Promise<void> {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/questionnaires/questions/${questionId}/parts/${partId}`
  );

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to delete question part");
  }
}

export async function duplicateQuestionPart(
  questionId: number,
  partId: number
): Promise<DuplicateQuestionPartResponseData> {
  const response = await apiClient.post<
    ApiResponse<DuplicateQuestionPartResponseData>
  >(`/questionnaires/questions/${questionId}/parts/${partId}/duplicate`);

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to duplicate question part");
  }
  return response.data.data;
}

export async function reorderQuestionParts(
  questionId: number,
  partIdsInOrder: number[]
): Promise<void> {
  const response = await apiClient.post<ReorderQuestionPartsResponse>(
    `/questionnaires/questions/${questionId}/parts/reorder`,
    { part_ids_in_order: partIdsInOrder }
  );

  if (!response.data.success) {
    throw new Error("Failed to reorder question parts");
  }
}

export async function getQuestionRatingScaleMapping(
  questionId: number
): Promise<GetQuestionRatingScaleMappingResponseData> {
  const response = await apiClient.get<
    ApiResponse<GetQuestionRatingScaleMappingResponseData>
  >(`/questionnaires/questions/${questionId}/rating-scale-mapping`);

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to fetch question rating scale mapping"
    );
  }

  return response.data.data;
}

export async function updateQuestionRatingScaleMapping(
  questionId: number,
  data: UpdateQuestionRatingScaleMappingBodyData
): Promise<unknown> {
  const response = await apiClient.put<
    ApiResponse<UpdateQuestionRatingScaleMappingResponseData>
  >(`/questionnaires/questions/${questionId}/rating-scale-mapping`, data);

  if (!response.data.success) {
    throw new Error(
      response.data.error || "Failed to update question rating scale mapping"
    );
  }
  return response.data.data;
}
