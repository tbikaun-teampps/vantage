import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";
import { EvidenceService } from "./EvidenceService";
import { InterviewsService } from "./InterviewsService";
import {
  Assessment,
  AssessmentAction,
  AssessmentComment,
  AssessmentFilters,
  AssessmentWithCounts,
  AssessmentWithQuestionnaire,
  CalculatedMeasurementWithLocation,
  CreateAssessmentData,
  TransformedQuestionnaire,
  AssessmentInterview,
  UpdateAssessmentData,
} from "../types/entities/assessments";
import { InterviewEvidence } from "../types/entities/interviews";
import { RecommendationsService } from "./RecommendationsService";
import {
  resolveLocationFromNode,
  type LocationNodeType,
} from "../lib/location-resolver";

export class AssessmentsService {
  private supabase: SupabaseClient<Database>;
  private userId: string;

  constructor(supabaseClient: SupabaseClient<Database>, userId: string) {
    this.supabase = supabaseClient;
    this.userId = userId;
  }

  // Assessment CRUD operations
  async getAssessments(
    companyId: string,
    filters?: AssessmentFilters
  ): Promise<AssessmentWithCounts[]> {
    let query = this.supabase
      .from("assessments")
      .select(
        `
        *,
        questionnaire:questionnaires(name),
        interviews(
          id,
          status,
          interview_responses(id, rating_score)
        )
      `
      )
      .eq("is_deleted", false)
      .not("interviews.interview_responses.rating_score", "is", null)
      .eq("interviews.is_deleted", false)
      .eq("company_id", companyId);

    // Apply filters
    if (filters) {
      if (filters.status && filters.status.length > 0) {
        query = query.in("status", filters.status);
      }
      if (filters.type) {
        query = query.eq("type", filters.type);
      }
      if (filters.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }
    }

    const { data: assessments, error } = await query.order("updated_at", {
      ascending: false,
    });

    if (error) throw error;

    // Calculate counts and format data
    return (assessments || []).map((assessment) => {
      // Filter out interviews from deleted companies
      const activeInterviews = assessment.interviews || [];

      return {
        ...assessment,
        interview_count: activeInterviews.length,
        completed_interview_count: activeInterviews.filter(
          (i) => i.status === "completed"
        ).length,
        total_responses: activeInterviews.reduce(
          (total: number, interview) =>
            total + (interview.interview_responses?.length || 0),
          0
        ),
        questionnaire_name:
          assessment.questionnaire?.name || "Unknown Questionnaire",
      } as AssessmentWithCounts;
    });
  }

  async getAssessmentById(
    id: number
  ): Promise<AssessmentWithQuestionnaire | null> {
    // Get assessment basic info with location lookups
    const { data: assessmentData, error: assessmentError } = await this.supabase
      .from("assessments")
      .select(
        `*,
        business_unit:business_unit_id(name),
        region:region_id(name),
        site:site_id(name),
        asset_group:asset_group_id(name)
        `
      )
      .eq("id", id)
      .eq("is_deleted", false)
      .single();

    if (assessmentError) throw assessmentError;
    if (!assessmentData) return null;

    // Build location object from the joined data
    const location = {
      business_unit:
        assessmentData.business_unit_id && assessmentData.business_unit?.name
          ? {
              id: assessmentData.business_unit_id,
              name: assessmentData.business_unit.name,
            }
          : null,
      region:
        assessmentData.region_id && assessmentData.region?.name
          ? { id: assessmentData.region_id, name: assessmentData.region.name }
          : null,
      site:
        assessmentData.site_id && assessmentData.site?.name
          ? { id: assessmentData.site_id, name: assessmentData.site.name }
          : null,
      asset_group:
        assessmentData.asset_group_id && assessmentData.asset_group?.name
          ? {
              id: assessmentData.asset_group_id,
              name: assessmentData.asset_group.name,
            }
          : null,
    };

    // Get objectives for this assessment
    const { data: objectives, error: objectivesError } = await this.supabase
      .from("assessment_objectives")
      .select("title, description")
      .eq("assessment_id", Number(id))
      .eq("company_id", assessmentData.company_id)
      .eq("is_deleted", false);

    if (objectivesError) throw objectivesError;

    // Build base assessment object (cast to Assessment type)
    const assessment = {
      id: assessmentData.id,
      name: assessmentData.name,
      description: assessmentData.description,
      status: assessmentData.status,
      type: assessmentData.type,
      questionnaire_id: assessmentData.questionnaire_id,
      program_phase_id: assessmentData.program_phase_id,
      company_id: assessmentData.company_id,
      created_by: assessmentData.created_by,
      created_at: assessmentData.created_at,
      updated_at: assessmentData.updated_at,
      is_deleted: assessmentData.is_deleted,
      deleted_at: assessmentData.deleted_at,
      location,
      interview_overview: assessmentData.interview_overview,
    };

    // Get questionnaire structure only for onsite assessments
    if (assessment.type === "onsite" && assessment.questionnaire_id) {
      const { data: questionnaire, error: questionnaireError } =
        await this.supabase
          .from("questionnaires")
          .select(
            `*,
      questionnaire_sections(
        *,
        questionnaire_steps(
        *,
        questionnaire_questions(
          id,
          title,
          question_text,
          context,
          order_index
        )
        )
      )
      `
          )
          .eq("id", assessment.questionnaire_id)
          .single();

      if (questionnaireError) throw questionnaireError;

      // Transform questionnaire data with counts at each level
      const sections =
        questionnaire.questionnaire_sections
          ?.map((section) => {
            const steps =
              section.questionnaire_steps
                ?.map((step) => {
                  const questions =
                    step.questionnaire_questions?.sort(
                      (a, b) => a.order_index - b.order_index
                    ) || [];

                  return {
                    ...step,
                    questions,
                    question_count: questions.length,
                  };
                })
                ?.sort((a, b) => a.order_index - b.order_index) || [];

            const totalQuestions = steps.reduce(
              (sum, step) => sum + step.question_count,
              0
            );

            return {
              ...section,
              steps,
              step_count: steps.length,
              question_count: totalQuestions,
            };
          })
          ?.sort((a, b) => a.order_index - b.order_index) || [];

      const totalSteps = sections.reduce(
        (sum, section) => sum + section.step_count,
        0
      );
      const totalQuestions = sections.reduce(
        (sum, section) => sum + section.question_count,
        0
      );

      // Remove the original questionnaire_sections to avoid redundancy
      const {
        questionnaire_sections: _questionnaire_sections,
        ...restQuestionnaire
      } = questionnaire;

      const transformedQuestionnaire: TransformedQuestionnaire = {
        ...restQuestionnaire,
        sections,
        section_count: sections.length,
        step_count: totalSteps,
        question_count: totalQuestions,
      };

      return {
        ...assessment,
        questionnaire: transformedQuestionnaire,
        objectives: objectives || [],
        location,
      };
    }

    // For desktop assessments, return without questionnaire
    return {
      ...assessment,
      objectives: objectives || [],
      location,
    };
  }

  async createAssessment(
    assessmentData: CreateAssessmentData
  ): Promise<Assessment> {
    // Extract objectives from assessment data
    const { objectives, ...assessmentFields } = assessmentData;

    // Create the assessment
    const { data: assessment, error: assessmentError } = await this.supabase
      .from("assessments")
      .insert([
        {
          ...assessmentFields,
          status: "draft",
          company_id: assessmentData.company_id,
          created_by: this.userId,
        },
      ])
      .select()
      .single();

    if (assessmentError) throw assessmentError;

    // Create objectives if provided
    if (objectives && objectives.length > 0) {
      const objectiveInserts = objectives.map((objective) => ({
        assessment_id: assessment.id,
        company_id: assessment.company_id,
        title: objective.title,
        description: objective.description || null,
        created_by: this.userId,
      }));

      const { error: objectivesError } = await this.supabase
        .from("assessment_objectives")
        .insert(objectiveInserts);

      if (objectivesError) {
        // If objectives creation fails, we should clean up the assessment
        await this.supabase
          .from("assessments")
          .delete()
          .eq("id", assessment.id);
        throw new Error(
          `Failed to create objectives: ${objectivesError.message}`
        );
      }
    }

    return assessment;
  }

  async updateAssessment(
    id: number,
    updates: UpdateAssessmentData
  ): Promise<Assessment> {
    const { data, error } = await this.supabase
      .from("assessments")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("is_deleted", false)
      .select()
      .single();

    if (error) throw error;

    // Detect whether the status has changed to 'completed'. This will trigger a recommendation generation service.
    if (updates.status && updates.status === "completed") {
      const recommendationsService = new RecommendationsService(this.supabase);
      recommendationsService.generateRecommendations(id);
    }

    return data;
  }

  async deleteAssessment(id: number): Promise<void> {
    const { error } = await this.supabase
      .from("assessments")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("is_deleted", false);

    if (error) throw error;
  }

  async duplicateAssessment(originalId: number): Promise<Assessment> {
    // Get the original assessment
    const { data: originalAssessment, error: assessmentError } =
      await this.supabase
        .from("assessments")
        .select("*")
        .eq("id", originalId)
        .eq("is_deleted", false)
        .single();

    if (assessmentError) throw assessmentError;
    if (!originalAssessment) throw new Error("Assessment not found");

    // Create new assessment
    const { data: newAssessment, error: createError } = await this.supabase
      .from("assessments")
      .insert([
        {
          questionnaire_id: originalAssessment.questionnaire_id,
          name: `${originalAssessment.name} (Copy)`,
          description: originalAssessment.description,
          status: "draft",
          company_id: originalAssessment.company_id,
          business_unit_id: originalAssessment.business_unit_id,
          region_id: originalAssessment.region_id,
          site_id: originalAssessment.site_id,
          asset_group_id: originalAssessment.asset_group_id,
          type: originalAssessment.type,
          created_by: this.userId,
        },
      ])
      .select()
      .single();

    if (createError) throw createError;

    return newAssessment;
  }

  // Get all interviews for an assessment with calculated fields
  // Delegates to InterviewsService.getInterviews for consistency and code reuse
  async getInterviewsByAssessmentId(
    assessmentId: number
  ): Promise<AssessmentInterview[]> {
    try {
      // First, fetch the assessment to get company_id
      const { data: assessment, error: assessmentError } = await this.supabase
        .from("assessments")
        .select("company_id")
        .eq("id", assessmentId)
        .eq("is_deleted", false)
        .single();

      if (assessmentError) throw assessmentError;
      if (!assessment) return [];

      // Create InterviewsService instance and delegate to getInterviews
      // Using detailed=false to fetch minimal data (no nested response details)
      const interviewsService = new InterviewsService(
        this.supabase,
        this.userId
      );

      const interviews = await interviewsService.getInterviews(
        assessment.company_id,
        assessmentId,
        undefined, // status filter
        undefined, // programPhaseId filter
        undefined, // questionnaireId filter
        false // detailed - do not fetch detailed response data
      );

      return interviews;
    } catch (error) {
      console.error("Error in getInterviewsByAssessmentId:", error);
      return [];
    }
  }

  // Get all comments for an assessment (across all interviews)
  async getCommentsByAssessmentId(
    assessmentId: number
  ): Promise<AssessmentComment[]> {
    try {
      const { data, error } = await this.supabase
        .from("interview_responses")
        .select(
          `
          id,
          comments,
          answered_at,
          created_at,
          updated_at,
          created_by(full_name, email),
          questionnaire_question_id,
          interview:interviews!inner(
            id,
            name,
            assessment_id
          ),
          questionnaire_question:questionnaire_questions(
            id,
            title,
            questionnaire_step:questionnaire_steps(
              title,
              questionnaire_section:questionnaire_sections(
                title
              )
            )
          )
        `
        )
        .not("comments", "is", null)
        .neq("comments", "")
        .eq("interview.assessment_id", assessmentId)
        .eq("interview.is_deleted", false)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Error fetching assessment comments:", error);
        throw error;
      }
      if (!data || data.length === 0) {
        return [];
      }

      // Transform the data to a flatter structure for easier consumption
      const transformedData = data.map((item) => ({
        id: item.id,
        comments: item.comments,
        answered_at: item.answered_at,
        created_at: item.created_at,
        updated_at: item.updated_at,
        created_by: item.created_by,
        interview_id: item.interview?.id,
        interview_name: item.interview?.name,
        question_id: item.questionnaire_question?.id,
        question_title: item.questionnaire_question?.title,
        domain_name:
          item.questionnaire_question?.questionnaire_step?.questionnaire_section
            ?.title || "Unknown Section",
        subdomain_name: item.questionnaire_question?.questionnaire_step?.title,
      }));

      return transformedData;
    } catch (error) {
      console.error("Error in getCommentsByAssessmentId:", error);
      throw error;
    }
  }

  // Get all evidence files for an assessment (across all interviews)
  async getEvidenceByAssessmentId(assessmentId: number): Promise<
    (InterviewEvidence & {
      interview_id: number;
      interview_name: string;
      question_title: string;
      question_id: number;
      publicUrl: string;
    })[]
  > {
    try {
      const { data: evidence, error } = await this.supabase
        .from("interview_evidence")
        .select(
          `
          *,
          interview_responses!inner(
            questionnaire_question_id,
            questionnaire_questions(title),
            interviews!inner(id, name)
          )
        `
        )
        .eq("interview_responses.interviews.assessment_id", assessmentId)
        .eq("interview_responses.interviews.is_deleted", false)
        .order("uploaded_at", { ascending: false });

      if (error) {
        throw new Error(
          `Failed to fetch assessment evidence: ${error.message}`
        );
      }

      // Create evidence service instance to generate public URLs
      const evidenceService = new EvidenceService(this.supabase, this.userId);

      // Transform the data to flatten the relationships and add public URLs
      return (evidence || []).map((item) => ({
        ...item,
        interview_id: item.interview_responses.interviews.id,
        interview_name: item.interview_responses.interviews.name,
        question_title:
          item.interview_responses.questionnaire_questions?.title ||
          "Unknown Question",
        question_id: item.interview_responses.questionnaire_question_id,
        publicUrl: evidenceService.getPublicUrl(item.file_path),
      }));
    } catch (error) {
      console.error("Error fetching evidence for assessment:", error);
      throw error;
    }
  }

  // Get all actions made on interviews associated with an assessment
  async getActionsByAssessmentId(
    assessmentId: number
  ): Promise<AssessmentAction[]> {
    try {
      const { data: actions, error } = await this.supabase
        .from("interview_response_actions")
        .select(
          `
          *,
          interview_responses!inner(
            questionnaire_question_id,
            questionnaire_questions(title),
            interviews!inner(id, name),
            rating_score
          ),
          created_by(full_name, email)
        `
        )
        .eq("is_deleted", false)
        .eq("interview_responses.is_deleted", false)
        .eq("interview_responses.interviews.is_deleted", false)
        .eq("interview_responses.interviews.assessment_id", assessmentId)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch assessment actions: ${error.message}`);
      }

      if (!actions || actions.length === 0) {
        return [];
      }

      // Transform the data to flatten the relationships
      return actions.map((item) => ({
        interview_id: item.interview_responses.interviews.id,
        interview_name: item.interview_responses.interviews.name,
        question_title:
          item.interview_responses.questionnaire_questions?.title ||
          "Unknown Question",
        question_id: item.interview_responses.questionnaire_question_id,
        rating_score: item.interview_responses.rating_score,
        created_by: item.created_by,
        created_at: item.created_at,
        updated_at: item.updated_at,
        title: item.title,
        description: item.description,
        id: item.id,
      }));
    } catch (error) {
      console.error("Error fetching actions for assessment:", error);
      throw error;
    }
  }

  async getMeasurementsByAssessmentId(
    assessmentId: number,
  ): Promise<CalculatedMeasurementWithLocation[]> {
    // Fetch measurements associated with the assessment, enriched with definition data
    const { data: measurements, error: measurementsError } = await this.supabase
      .from("measurements_calculated")
      .select(
        `
          *,
          definition:measurement_definition_id(name, description),
          business_unit:business_unit_id(name),
          region:region_id(name),
          site:site_id(name),
          asset_group:asset_group_id(name),
          work_group:work_group_id(name),
          role:role_id(shared_role_id(name))
          `
      )
      .eq("assessment_id", assessmentId);

    if (measurementsError) {
      throw measurementsError;
    }
    if (!measurements) {
      return [];
    }

    // Hoist up shared_role_id.name to role.name for easier access
    return measurements.map((m) => {
      const { role, definition, ...rest } = m;
      return {
        ...rest,
        measurement_name: definition.name,
        measurement_description: definition.description,
        role: role?.shared_role_id ? { name: role.shared_role_id.name } : null,
      };
    });
  }

  async addMeasurementToAssessment(
    assessmentId: number,
    measurement_definition_id: number,
    calculated_value: number,
    location?: {
      id: number;
      type: LocationNodeType;
    }
  ) {
    // Check assessment is 'desktop' type
    const { data: assessment, error: assessmentError } = await this.supabase
      .from("assessments")
      .select(
        "id, type, company_id, business_unit_id, region_id, site_id, asset_group_id"
      )
      .eq("id", assessmentId)
      .single();

    if (assessmentError || !assessment) {
      throw new Error("Assessment not found");
    }

    if (assessment.type !== "desktop") {
      throw new Error("Measurements can only be added to desktop assessments");
    }

    // Check measurement definition exists
    const { data: measurementDef, error: measurementDefError } =
      await this.supabase
        .from("measurement_definitions")
        .select("*")
        .eq("id", measurement_definition_id)
        .single();

    if (measurementDefError || !measurementDef) {
      throw new Error("Measurement definition not found");
    }

    // Resolve the location hierarchy from the selected node
    let resolvedLocation: {
      business_unit_id?: number;
      region_id?: number;
      site_id?: number;
      asset_group_id?: number;
      work_group_id?: number;
      role_id?: number;
    } | null = null;

    if (location) {
      resolvedLocation = await resolveLocationFromNode(
        this.supabase,
        location.id,
        location.type,
        assessment.company_id
      );
    }

    console.log('resolvedLocation: ', resolvedLocation)

    // Check measurement isn't already associated with the assessment at this location
    let existenceCheckQuery = this.supabase
      .from("measurements_calculated")
      .select("*")
      .eq("assessment_id", assessmentId)
      .eq("measurement_definition_id", measurement_definition_id);

    if (resolvedLocation) {
      const loc = resolvedLocation;
      if (loc.business_unit_id) {
        existenceCheckQuery = existenceCheckQuery.eq(
          "business_unit_id",
          loc.business_unit_id
        );
        if (loc.region_id) {
          existenceCheckQuery = existenceCheckQuery.eq(
            "region_id",
            loc.region_id
          );
          if (loc.site_id) {
            existenceCheckQuery = existenceCheckQuery.eq(
              "site_id",
              loc.site_id
            );
            if (loc.asset_group_id) {
              existenceCheckQuery = existenceCheckQuery.eq(
                "asset_group_id",
                loc.asset_group_id
              );
              if (loc.work_group_id) {
                existenceCheckQuery = existenceCheckQuery.eq(
                  "work_group_id",
                  loc.work_group_id
                );
                if (loc.role_id) {
                  existenceCheckQuery = existenceCheckQuery.eq(
                    "role_id",
                    loc.role_id
                  );
                }
              }
            }
          }
        }
      }
    }

    const { data: existingMeasurement, error: existingMeasurementError } =
      await existenceCheckQuery.single();

    if (existingMeasurement && !existingMeasurementError) {
      throw new Error(
        "Measurement already associated with this location on the assessment"
      );
    }

    // Add measurement to assessment
    const { data: newMeasurement, error: newMeasurementError } =
      await this.supabase
        .from("measurements_calculated")
        .insert({
          company_id: assessment.company_id,
          assessment_id: assessmentId,
          measurement_definition_id,
          calculated_value,
          ...resolvedLocation,
        })
        .select()
        .single();

    if (newMeasurementError || !newMeasurement) {
      throw new Error("Failed to add measurement to assessment");
    }
  }

  async deleteMeasurementFromAssessment(measurementId: number) {
    // Delete the measurement
    const { error: deleteError } = await this.supabase
      .from("measurements_calculated")
      .delete()
      .eq("id", measurementId);

    if (deleteError) {
      throw new Error("Failed to delete measurement");
    }
  }

  async getMeasurementBarChartsByAssessmentId(assessmentId: number) {
    // Fetch measurements associated with the assessment
    const { data: measurements, error: measurementsError } = await this.supabase
      .from("measurements_calculated")
      .select(
        `
            *,
            definition:measurement_definition_id(name),
            business_unit:business_unit_id(name),
            region:region_id(name),
            site:site_id(name),
            asset_group:asset_group_id(name),
            work_group:work_group_id(name),
            role:role_id(shared_role_id(name))
            `
      )
      .eq("assessment_id", assessmentId);

    if (measurementsError) {
      throw new Error("Failed to fetch measurements");
    }

    // Transform measurements into bar chart format
    // Group by measurement definition name, then by location
    const groupedByDefinition = new Map<
      string,
      { label: string; value: number }[]
    >();

    measurements?.forEach((m) => {
      const definitionName = m.definition?.name || "Unknown";

      // Build hierarchical location string, stopping at first null
      const locationParts: string[] = [];
      if (m.business_unit?.name) {
        locationParts.push(m.business_unit.name);
        if (m.region?.name) {
          locationParts.push(m.region.name);
          if (m.site?.name) {
            locationParts.push(m.site.name);
            if (m.asset_group?.name) {
              locationParts.push(m.asset_group.name);
              if (m.work_group?.name) {
                locationParts.push(m.work_group.name);
                if (m.role?.shared_role_id?.name) {
                  locationParts.push(m.role.shared_role_id.name);
                }
              }
            }
          }
        }
      }
      const location =
        locationParts.length > 0
          ? locationParts.join(" > ")
          : "Unknown Location";

      if (!groupedByDefinition.has(definitionName)) {
        groupedByDefinition.set(definitionName, []);
      }

      const locationData = groupedByDefinition.get(definitionName)!;
      const existingEntry = locationData.find((d) => d.label === location);

      if (existingEntry) {
        existingEntry.value += m.calculated_value;
      } else {
        locationData.push({
          label: location,
          value: m.calculated_value,
        });
      }
    });

    // Convert Map to array format
    const chartData = Array.from(groupedByDefinition.entries()).map(
      ([name, data]) => ({
        name,
        data,
      })
    );

    return chartData;
  }
}
