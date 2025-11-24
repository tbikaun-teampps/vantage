import { SupabaseClient } from "@supabase/supabase-js";
import { Database, Tables } from "../types/database";

import { b } from "./../../baml_client";
import { NotFoundError } from "../plugins/errorHandler";
// import type { Recommendation } from "./../../baml_client/types";

export type Recommendation = Tables<"recommendations">;

// Types for questionnaire structure
export interface QuestionnaireStructure {
  questionnaire: Tables<"questionnaires">;
  sections: Tables<"questionnaire_sections">[];
  steps: Tables<"questionnaire_steps">[];
  questions: Tables<"questionnaire_questions">[];
  question_parts: Tables<"questionnaire_question_parts">[];
  rating_scales: Tables<"questionnaire_rating_scales">[];
  question_rating_scales: Tables<"questionnaire_question_rating_scales">[];
  interview_responses: Array<
    Tables<"interview_responses"> & {
      question_part_responses: Tables<"interview_question_part_responses">[];
      interview_response_roles: Array<{
        id: number;
        role: {
          id: number;
          level: string | null;
          shared_role: {
            id: number;
            name: string;
          } | null;
          work_group: {
            name: string;
            asset_group: {
              name: string;
              site: {
                name: string;
                region: {
                  name: string;
                  business_unit: {
                    name: string;
                  } | null;
                } | null;
              } | null;
            } | null;
          } | null;
        } | null;
      }>;
    }
  >;
}

// LLM-friendly structure for questionnaire data
export interface LLMQuestionnaireQuestion {
  section_title: string;
  step_title: string;
  question_title: string;
  question_text: string;
  context: string;
  question_rating_scale: {
    scale_values: Array<{
      value: number;
      name: string;
      description: string | null;
    }>;
    selected_values: Array<{
      value: number;
      roles: Array<{
        id: number;
        name: string;
        level: string | null;
        work_group: string | null;
        asset_group: string | null;
        site: string | null;
        region: string | null;
        business_unit: string | null;
      }>;
    }>;
  } | null;
  question_parts: Array<{
    id: number;
    text: string;
    answer_type: string;
    options: unknown;
    answers: Array<{
      value: string;
      roles: Array<{
        id: number;
        name: string;
        level: string | null;
        work_group: string | null;
        asset_group: string | null;
        site: string | null;
        region: string | null;
        business_unit: string | null;
      }>;
    }>;
  }>;
  direct_responses: Array<{
    interview_id: number;
    rating_score: number | null;
    comments: string | null;
    is_applicable: boolean;
    is_unknown: boolean;
    roles: Array<{
      id: number;
      name: string;
      level: string | null;
      work_group: string | null;
      asset_group: string | null;
      site: string | null;
      region: string | null;
      business_unit: string | null;
    }>;
  }>;
}

/**
 * Fetches the complete questionnaire structure with all related data.
 * Returns a flat structure with references preserved for easy traversal.
 *
 * @param supabase - Supabase client instance
 * @param questionnaireId - ID of the questionnaire to fetch
 * @param interviewIds - Optional array of interview IDs to filter responses
 * @returns QuestionnaireStructure with flat arrays of all entities
 */
export async function fetchQuestionnaireStructure(
  supabase: SupabaseClient<Database>,
  questionnaireId: number,
  interviewIds?: number[]
): Promise<QuestionnaireStructure> {
  // Build the nested select query
  let query = supabase
    .from("questionnaires")
    .select(
      `
      *,
      questionnaire_sections!inner(
        *,
        questionnaire_steps!inner(
          *,
          questionnaire_questions!inner(
            *,
            questionnaire_question_parts(*),
            questionnaire_question_rating_scales(
              *,
              rating_scale:questionnaire_rating_scales(*)
            ),
            interview_responses!questionnaire_question_id(
              *,
              interview_question_part_responses(*),
              interview_response_roles(
                id,
                role:roles(
                  id,
                  level,
                  shared_role:shared_roles(id, name),
                  work_group:work_groups(
                    name,
                    asset_group:asset_groups(
                      name,
                      site:sites(
                        name,
                        region:regions(
                          name,
                          business_unit:business_units(name)
                        )
                      )
                    )
                  )
                )
              )
            )
          )
        )
      ),
      questionnaire_rating_scales(*)
    `
    )
    .eq("id", questionnaireId)
    .eq("questionnaire_sections.is_deleted", false)
    .eq("questionnaire_sections.questionnaire_steps.is_deleted", false)
    .eq(
      "questionnaire_sections.questionnaire_steps.questionnaire_questions.is_deleted",
      false
    )
    .eq(
      "questionnaire_sections.questionnaire_steps.questionnaire_questions.questionnaire_question_parts.is_deleted",
      false
    )
    .eq(
      "questionnaire_sections.questionnaire_steps.questionnaire_questions.interview_responses.is_deleted",
      false
    )
    .eq("questionnaire_rating_scales.is_deleted", false)
    .order("order_index", {
      referencedTable: "questionnaire_sections",
      ascending: true,
    })
    .order("order_index", {
      referencedTable: "questionnaire_sections.questionnaire_steps",
      ascending: true,
    })
    .order("order_index", {
      referencedTable:
        "questionnaire_sections.questionnaire_steps.questionnaire_questions",
      ascending: true,
    })
    .order("order_index", {
      referencedTable:
        "questionnaire_sections.questionnaire_steps.questionnaire_questions.questionnaire_question_parts",
      ascending: true,
    });

  // Filter by interview IDs if provided
  if (interviewIds && interviewIds.length > 0) {
    query = query.in(
      "questionnaire_sections.questionnaire_steps.questionnaire_questions.interview_responses.interview_id",
      interviewIds
    );
  }

  const { data, error } = await query.single();

  if (error) {
    console.error("Error fetching questionnaire structure:", error);
    throw new Error(
      `Failed to fetch questionnaire structure: ${error.message}`
    );
  }

  if (!data) {
    throw new Error(`Questionnaire with ID ${questionnaireId} not found`);
  }

  // Flatten the nested structure into arrays with preserved references
  const sections: Tables<"questionnaire_sections">[] = [];
  const steps: Tables<"questionnaire_steps">[] = [];
  const questions: Tables<"questionnaire_questions">[] = [];
  const question_parts: Tables<"questionnaire_question_parts">[] = [];
  const question_rating_scales: Tables<"questionnaire_question_rating_scales">[] =
    [];
  const interview_responses: QuestionnaireStructure["interview_responses"] = [];
  const rating_scales: Tables<"questionnaire_rating_scales">[] =
    data.questionnaire_rating_scales || [];

  // Build the questionnaire object (without nested relations)
  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    questionnaire_sections: _sections,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    questionnaire_rating_scales: _scales,
    ...questionnaire
  } = data;

  // Traverse the nested structure and flatten
  if (data.questionnaire_sections) {
    for (const section of data.questionnaire_sections) {
      const { questionnaire_steps: sectionSteps, ...sectionData } = section;
      sections.push(sectionData as Tables<"questionnaire_sections">);

      if (sectionSteps) {
        for (const step of sectionSteps) {
          const { questionnaire_questions: stepQuestions, ...stepData } = step;
          steps.push(stepData as Tables<"questionnaire_steps">);

          if (stepQuestions) {
            for (const question of stepQuestions) {
              const {
                questionnaire_question_parts: qParts,
                questionnaire_question_rating_scales: qRatingScales,
                interview_responses: qResponses,
                ...questionData
              } = question;
              questions.push(questionData as Tables<"questionnaire_questions">);

              if (qParts) {
                for (const part of qParts) {
                  question_parts.push(
                    part as Tables<"questionnaire_question_parts">
                  );
                }
              }

              if (qRatingScales) {
                for (const qrs of qRatingScales) {
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  const { rating_scale: _ratingScale, ...qrsData } = qrs;
                  question_rating_scales.push(
                    qrsData as Tables<"questionnaire_question_rating_scales">
                  );
                }
              }

              if (qResponses) {
                for (const response of qResponses) {
                  const {
                    interview_question_part_responses: partResponses,
                    interview_response_roles: responseRoles,
                    ...responseData
                  } = response;
                  interview_responses.push({
                    ...(responseData as Tables<"interview_responses">),
                    question_part_responses:
                      (partResponses as Tables<"interview_question_part_responses">[]) ||
                      [],
                    interview_response_roles: responseRoles || [],
                  } as QuestionnaireStructure["interview_responses"][number]);
                }
              }
            }
          }
        }
      }
    }
  }

  return {
    questionnaire: questionnaire as Tables<"questionnaires">,
    sections,
    steps,
    questions,
    question_parts,
    rating_scales,
    question_rating_scales,
    interview_responses,
  };
}

/**
 * Transforms questionnaire structure into an LLM-friendly format.
 * Each question includes its full context (section, step), available options (rating scales, question parts),
 * and actual responses from interviews.
 *
 * @param structure - The flat questionnaire structure from fetchQuestionnaireStructure
 * @returns Array of questions with complete context and responses
 */
export function transformQuestionnaireForLLM(
  structure: QuestionnaireStructure
): LLMQuestionnaireQuestion[] {
  const result: LLMQuestionnaireQuestion[] = [];

  // Iterate through all questions
  for (const question of structure.questions) {
    // Find parent step and section using foreign keys
    const step = structure.steps.find(
      (s) => s.id === question.questionnaire_step_id
    );
    const section = structure.sections.find(
      (s) => s.id === step?.questionnaire_section_id
    );

    if (!step || !section) {
      console.warn(`Skipping question ${question.id}: missing step or section`);
      continue;
    }

    // Build rating scale data with selected values
    let questionRatingScale: LLMQuestionnaireQuestion["question_rating_scale"] =
      null;

    const questionRatingScaleLinks = structure.question_rating_scales.filter(
      (qrs) => qrs.questionnaire_question_id === question.id
    );

    // Get all rating scale records for this question
    const scaleIds = questionRatingScaleLinks.map(
      (qrs) => qrs.questionnaire_rating_scale_id
    );
    const relevantScales = structure.rating_scales.filter((rs) =>
      scaleIds.includes(rs.id)
    );

    // If question has rating scales, build the single scale object
    if (relevantScales.length > 0) {
      // All scale records for a question form ONE logical scale with labeled values
      const scaleValues = relevantScales
        .map((scale) => ({
          value: scale.value,
          name: scale.name,
          description: scale.description,
        }))
        .sort((a, b) => a.value - b.value);

      // Find actual selected values from interview responses with role context
      const responsesByValue = new Map<
        number,
        Array<{
          id: number;
          name: string;
          level: string | null;
          work_group: string | null;
          asset_group: string | null;
          site: string | null;
          region: string | null;
          business_unit: string | null;
        }>
      >();

      const relevantResponses = structure.interview_responses.filter(
        (ir) =>
          ir.questionnaire_question_id === question.id &&
          ir.rating_score !== null
      );

      for (const response of relevantResponses) {
        const value = response.rating_score as number;

        if (!responsesByValue.has(value)) {
          responsesByValue.set(value, []);
        }

        // Extract role data with organizational hierarchy
        const roles = (response.interview_response_roles || []).map((irr) => ({
          id: irr.role?.id || 0,
          name: irr.role?.shared_role?.name || "Unknown",
          level: irr.role?.level || null,
          work_group: irr.role?.work_group?.name || null,
          asset_group: irr.role?.work_group?.asset_group?.name || null,
          site: irr.role?.work_group?.asset_group?.site?.name || null,
          region: irr.role?.work_group?.asset_group?.site?.region?.name || null,
          business_unit:
            irr.role?.work_group?.asset_group?.site?.region?.business_unit
              ?.name || null,
        }));

        responsesByValue.get(value)!.push(...roles);
      }

      // Build selected_values array
      const selectedValues = Array.from(responsesByValue.entries())
        .map(([value, roles]) => ({
          value,
          roles,
        }))
        .sort((a, b) => a.value - b.value);

      questionRatingScale = {
        scale_values: scaleValues,
        selected_values: selectedValues,
      };
    }

    // Build question parts data with answers
    const questionParts: LLMQuestionnaireQuestion["question_parts"] = [];
    const parts = structure.question_parts.filter(
      (qp) => qp.questionnaire_question_id === question.id
    );

    for (const part of parts) {
      // Find answers for this question part from interview responses, grouped by value
      const answersByValue = new Map<
        string,
        Array<{
          id: number;
          name: string;
          level: string | null;
          work_group: string | null;
          asset_group: string | null;
          site: string | null;
          region: string | null;
          business_unit: string | null;
        }>
      >();

      for (const response of structure.interview_responses) {
        if (response.questionnaire_question_id === question.id) {
          // Find the specific part response
          const partResponse = response.question_part_responses.find(
            (pr) => pr.question_part_id === part.id
          );
          if (partResponse) {
            const value = partResponse.answer_value;

            if (!answersByValue.has(value)) {
              answersByValue.set(value, []);
            }

            // Extract role data with organizational hierarchy from the parent response
            const roles = (response.interview_response_roles || []).map(
              (irr) => ({
                id: irr.role?.id || 0,
                name: irr.role?.shared_role?.name || "Unknown",
                level: irr.role?.level || null,
                work_group: irr.role?.work_group?.name || null,
                asset_group: irr.role?.work_group?.asset_group?.name || null,
                site: irr.role?.work_group?.asset_group?.site?.name || null,
                region:
                  irr.role?.work_group?.asset_group?.site?.region?.name || null,
                business_unit:
                  irr.role?.work_group?.asset_group?.site?.region?.business_unit
                    ?.name || null,
              })
            );

            answersByValue.get(value)!.push(...roles);
          }
        }
      }

      // Build answers array from grouped data
      const answers = Array.from(answersByValue.entries()).map(
        ([value, roles]) => ({
          value,
          roles,
        })
      );

      questionParts.push({
        id: part.id,
        text: part.text,
        answer_type: part.answer_type,
        options: part.options,
        answers,
      });
    }

    // Build direct responses (for questions without parts - rating-only questions)
    const directResponses: LLMQuestionnaireQuestion["direct_responses"] = [];
    const questionResponses = structure.interview_responses.filter(
      (ir) => ir.questionnaire_question_id === question.id
    );

    for (const response of questionResponses) {
      // Extract role data with organizational hierarchy
      const roles = (response.interview_response_roles || []).map((irr) => ({
        id: irr.role?.id || 0,
        name: irr.role?.shared_role?.name || "Unknown",
        level: irr.role?.level || null,
        work_group: irr.role?.work_group?.name || null,
        asset_group: irr.role?.work_group?.asset_group?.name || null,
        site: irr.role?.work_group?.asset_group?.site?.name || null,
        region: irr.role?.work_group?.asset_group?.site?.region?.name || null,
        business_unit:
          irr.role?.work_group?.asset_group?.site?.region?.business_unit
            ?.name || null,
      }));

      directResponses.push({
        interview_id: response.interview_id,
        rating_score: response.rating_score,
        comments: response.comments,
        is_applicable: response.is_applicable,
        is_unknown: response.is_unknown,
        roles,
      });
    }

    result.push({
      section_title: section.title,
      step_title: step.title,
      question_title: question.title,
      question_text: question.question_text || "",
      context: question.context || "",
      question_rating_scale: questionRatingScale,
      question_parts: questionParts,
      direct_responses: directResponses,
    });
  }

  return result;
}

function generateQuestionPromptForLLM(
  sampleQuestion: LLMQuestionnaireQuestion
): string {
  const questionParts =
    sampleQuestion.question_parts.length > 0
      ? sampleQuestion.question_parts.map((part) => `- ${part.text}`).join("\n")
      : "N/A";

  const questionRatingScales = sampleQuestion.question_rating_scale
    ? sampleQuestion.question_rating_scale.scale_values
        .map(
          (rs) =>
            `${rs.value}. ${rs.name}: ${rs.description || "No description"}`
        )
        .join("\n")
    : "N/A";

  const overallRatingScaleResponses = sampleQuestion.question_rating_scale
    ?.selected_values
    ? sampleQuestion.question_rating_scale.selected_values
        .map((sv) => {
          const roles = sv.roles
            .map(
              (r) =>
                `${r.name} (${r.business_unit} > ${r.region} > ${r.site} > ${r.asset_group} > ${r.work_group})`
            )
            .join(", ");
          return `- Score ${sv.value} selected by role(s): ${roles}`;
        })
        .join("\n")
    : "N/A";

  const questionPartsAnswers =
    sampleQuestion.question_parts.length > 0
      ? sampleQuestion.question_parts
          .map((part) => {
            if (part.answers.length === 0) {
              return `- ${part.text}\n  No answers provided.`;
            }
            const answersText = part.answers
              .map((ans) => {
                const roles = ans.roles
                  .map(
                    (r) =>
                      `${r.name} (${r.business_unit} > ${r.region} > ${r.site} > ${r.asset_group} > ${r.work_group})`
                  )
                  .join(", ");
                return `    - Answer: "${ans.value}" by role(s): ${roles}`;
              })
              .join("\n");
            return `- ${part.text}\n${answersText}`;
          })
          .join("\n")
      : "N/A";

  return `
You are an expert asset management and maintenance consultant. Based on the following question data from an assessment questionnaire, provide insights. Output a JSON array format of recommendation objects with the keys: "title", "content", "context", and "priority" (low, medium, high), like so:
[
  {
    "title": string, // A brief title summarizing the recommendation
    "content": string, // A detailed description of the recommendation
    "context": string, // The context or rationale for the recommendation
    "priority": "low" | "medium" | "high"
  },
  ...
]

You may return 1-5 recommendations depending on the complexity and importance of the findings.

# Question
## Overview
- Section Title: ${sampleQuestion.section_title}
- Step Title: ${sampleQuestion.step_title}
- Question Title: ${sampleQuestion.question_title}
- Question Text: ${sampleQuestion.question_text || "Not provided"}
- Question Context/Support: ${sampleQuestion.context.replaceAll(/\n/g, " ")}

## Question Parts
${questionParts}

## Question Rating Scales:
${questionRatingScales}

# Answers
## Overall Rating Scale
${overallRatingScaleResponses}

## Question Parts
${questionPartsAnswers}

Based on this data, what recommendations would you provide?

Please provide:
1. Current State Analysis (strengths and gaps)
2. Key Insights (including any data inconsistencies)
3. Prioritized Recommendations (with implementation difficulty)
4. Risk Assessment if no action is taken

Note: Multiple responses from the same role indicate different individuals 
with that title. Analyze consensus levels and note where perspectives diverge.

When analyzing conflicting responses within the same role:
- Identify if this indicates inconsistent practices or varying perspectives
- Consider if this suggests a need for standardization or training
- Note if certain locations/departments show more alignment than others

Recommendations should be actionable and tailored to the organization's structure as indicated by the roles provided.
`;
}

export class RecommendationsService {
  private supabase: SupabaseClient<Database>;

  constructor(supabaseClient: SupabaseClient<Database>) {
    this.supabase = supabaseClient;
  }

  async getAllRecommendations(companyId: string) {
    const { data, error } = await this.supabase
      .from("recommendations")
      .select(
        `id,
        created_at,
        updated_at,
        title,
        content,
        context,
        priority,
        status,
        program:program_id(id,name),
        assessment:assessment_id(id,name,type)
        `
      )
      .eq("company_id", companyId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching recommendations:", error);
      throw new Error(`Failed to fetch recommendations: ${error.message}`);
    }

    return data;
  }

  async getRecommendationById(
    recommendationId: number
  ): Promise<Recommendation> {
    const { data, error } = await this.supabase
      .from("recommendations")
      .select("*")
      .eq("id", recommendationId)
      .eq("is_deleted", false)
      .single();

    if (error) {
      console.error("Error fetching recommendation:", error);
      throw new Error(`Failed to fetch recommendation: ${error.message}`);
    }
    if (!data) {
      throw new NotFoundError(`Recommendation not found`);
    }

    return data;
  }

  async updateRecommendation(
    id: number,
    updates: Partial<
      Pick<
        Recommendation,
        "content" | "context" | "priority" | "status" | "program_id"
      >
    >
  ): Promise<Recommendation> {

    // Check existence
    await this.getRecommendationById(id);

    const { data, error } = await this.supabase
      .from("recommendations")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("is_deleted", false)
      .select()
      .single();

    if (error) {
      console.error("Error updating recommendation:", error);
      throw new Error(`Failed to update recommendation: ${error.message}`);
    }

    return data;
  }

  async deleteRecommendation(id: number): Promise<void> {
    const { error } = await this.supabase
      .from("recommendations")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Error deleting recommendation:", error);
      throw new Error(`Failed to delete recommendation: ${error.message}`);
    }
  }

  /**
   * Generate recommendations for a given assessment.
   * TODO: extend to work with programs.
   * @param assessmentId
   */
  async generateRecommendations(assessmentId: number): Promise<void> {
    console.log("Generating recommendations...");
    // Fetch assessment data
    const { data: assessment, error: assessmentError } = await this.supabase
      .from("assessments")
      .select(
        "id,name,description,type,company_id, assessment_objectives(title, description)"
      )
      .eq("id", assessmentId)
      .maybeSingle();

    if (assessmentError || !assessment) {
      console.error(
        "Error fetching assessment for recommendations:",
        assessmentError
      );
      throw new Error(
        `Failed to fetch assessment: ${assessmentError?.message}`
      );
    }

    // Fetch interviews associated with the assessment
    const { data: interviews, error: interviewsError } = await this.supabase
      .from("interviews")
      .select("*")
      .eq("assessment_id", assessmentId);

    if (interviewsError) {
      console.error(
        "Error fetching interviews for recommendations:",
        interviewsError
      );
      throw new Error(`Failed to fetch interviews: ${interviewsError.message}`);
    }

    console.log("Fetched assessment:", assessment);
    console.log(`Fetched ${interviews.length} interviews.`);

    // Fetch questionnaire associated with interview(s)
    // NOTE: this assumes that all interviews use the same questionnaire.
    let questionnaireId: number | null = null;
    if (interviews.length > 0) {
      questionnaireId = interviews[0].questionnaire_id;
    }

    if (!questionnaireId) {
      console.warn(
        "No questionnaire associated with interviews; skipping recommendation generation."
      );
      return;
    }

    // Extract interview IDs to filter responses
    const interviewIds = interviews.map((interview) => interview.id);

    // Fetch complete questionnaire structure with responses
    const structure = await fetchQuestionnaireStructure(
      this.supabase,
      questionnaireId,
      interviewIds
    );

    console.log("Fetched questionnaire:", structure.questionnaire);
    console.log(`Questionnaire structure:
      - Sections: ${structure.sections.length}
      - Steps: ${structure.steps.length}
      - Questions: ${structure.questions.length}
      - Question Parts: ${structure.question_parts.length}
      - Rating Scales: ${structure.rating_scales.length}
      - Interview Responses: ${structure.interview_responses.length}
    `);

    // Transform to LLM-friendly format
    const llmData = transformQuestionnaireForLLM(structure);
    console.log(`Transformed ${llmData.length} questions for LLM consumption`);

    // Generate recommendations for each question
    let successCount = 0;
    let failureCount = 0;
    const errors: Array<{ question: string; error: string }> = [];

    console.log(
      `Processing ${llmData.length} questions for recommendation generation...`
    );

    for (const question of llmData) {
      try {
        // Generate prompt for this question
        const prompt = generateQuestionPromptForLLM(question);

        // Use BAML to generate recommendations
        const response = await b.ExtractRecommendations(prompt);

        console.log(
          `Generated ${response.length} recommendation(s) for this question`
        );

        // Store each recommendation in database
        for (const recommendationResponse of response) {
          const { error: insertError } = await this.supabase
            .from("recommendations")
            .insert({
              company_id: assessment.company_id,
              assessment_id: assessmentId,
              program_id: null, // TODO: extend to work with programs
              title: recommendationResponse.title,
              content: recommendationResponse.content,
              context: recommendationResponse.context,
              priority: recommendationResponse.priority,
              status: "not_started",
            });

          if (insertError) {
            console.error(
              `Failed to insert recommendation "${recommendationResponse.title}":`,
              insertError
            );
            failureCount++;
            errors.push({
              question: `${question.section_title} > ${question.step_title} > ${question.question_title}`,
              error: `Failed to insert "${recommendationResponse.title}": ${insertError.message}`,
            });
          } else {
            successCount++;
            console.log(
              `✓ Successfully created recommendation: "${recommendationResponse.title}"`
            );
          }
        }
      } catch (error) {
        // Log error but continue processing other questions
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(
          `Error generating recommendations for question "${question.question_title}":`,
          errorMessage
        );
        failureCount++;
        errors.push({
          question: `${question.section_title} > ${question.step_title} > ${question.question_title}`,
          error: errorMessage,
        });
      }
    }

    // Log final summary
    console.log(`\n=== Recommendation Generation Complete ===`);
    console.log(`Total questions processed: ${llmData.length}`);
    console.log(`Successful recommendations: ${successCount}`);
    console.log(`Failed recommendations: ${failureCount}`);

    if (errors.length > 0) {
      console.log(`\nErrors encountered:`);
      errors.forEach((err, idx) => {
        console.log(`${idx + 1}. ${err.question}`);
        console.log(`   Error: ${err.error}`);
      });
    }
  }
}
