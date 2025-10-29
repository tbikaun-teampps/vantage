import { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "../types/database.js";
import {
  CreateQuestionnaireData,
  CreateQuestionnaireQuestionData,
  CreateQuestionnaireSectionData,
  CreateQuestionnaireStepBody,
  CreateQuestionPartData,
  UpdateQuestionPartData,
  QuestionPart,
  QuestionApplicableRole,
  Questionnaire,
  QuestionnaireQuestion,
  QuestionnaireQuestionRatingScale,
  QuestionnaireRatingScale,
  QuestionnaireSection,
  QuestionnaireStep,
  QuestionnaireStructureData,
  QuestionnaireStructureQuestionRatingScaleData,
  QuestionnaireStructureQuestionsData,
  QuestionnaireStructureSectionsData,
  QuestionnaireStructureStepsData,
  QuestionnaireWithCounts,
  QuestionnaireWithStructure,
  QuestionRole,
  UpdateQuestionnaireData,
  UpdateQuestionnaireQuestionData,
  UpdateQuestionnaireSectionData,
  UpdateQuestionnaireStepData,
} from "../types/entities/questionnaires.js";
import type { WeightedScoringConfig } from "../types/entities/weighted-scoring.js";
import {
  validateWeightedScoringConfig,
  formatValidationErrors,
} from "../validation/weighted-scoring-schema.js";
import { ZodError } from "zod";
import { SubscriptionTier } from "../types/entities/profiles.js";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../plugins/errorHandler.js";

export class QuestionnaireService {
  private supabase: SupabaseClient<Database>;
  private userId: string;
  private userSubscriptionTier?: SubscriptionTier;

  constructor(
    supabaseClient: SupabaseClient<Database>,
    userId: string,
    userSubscriptionTier?: SubscriptionTier
  ) {
    this.supabase = supabaseClient;
    this.userId = userId;
    this.userSubscriptionTier = userSubscriptionTier;
  }

  async getQuestionnaires(
    companyId: string
  ): Promise<QuestionnaireWithCounts[]> {
    const { data, error } = await this.supabase
      .from("questionnaires")
      .select("*")
      .eq("is_deleted", false)
      .eq("company_id", companyId)
      .order("updated_at", { ascending: false })
      .eq("is_demo", this.userSubscriptionTier === "demo"); // Ensure demo users only see demo questionnaires

    if (error) throw error;

    if (!data || data.length === 0) {
      return [];
    }

    const questionnaireIds = data.map((q) => q.id);
    const [sectionsData, stepsData, questionsData] =
      await this.fetchCounts(questionnaireIds);

    const sectionCounts: Record<number, number> = {};
    const stepCounts: Record<number, number> = {};
    const questionCounts: Record<number, number> = {};

    sectionsData?.forEach((section) => {
      if (section.questionnaire_id) {
        sectionCounts[section.questionnaire_id] =
          (sectionCounts[section.questionnaire_id] || 0) + 1;
      }
    });

    stepsData?.forEach((step) => {
      if (step.questionnaire_id) {
        stepCounts[step.questionnaire_id] =
          (stepCounts[step.questionnaire_id] || 0) + 1;
      }
    });

    questionsData?.forEach((question) => {
      if (question.questionnaire_id) {
        questionCounts[question.questionnaire_id] =
          (questionCounts[question.questionnaire_id] || 0) + 1;
      }
    });

    return data.map((questionnaire) => ({
      ...questionnaire,
      section_count: sectionCounts[questionnaire.id] || 0,
      step_count: stepCounts[questionnaire.id] || 0,
      question_count: questionCounts[questionnaire.id] || 0,
    }));
  }

  async getQuestionnaireById(
    questionnaireId: number
  ): Promise<QuestionnaireWithStructure | null> {
    const { data, error } = await this.supabase
      .from("questionnaires")
      .select("*")
      .eq("id", questionnaireId)
      .eq("is_deleted", false)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const [sections, steps, questions, questionRatingScales] =
      await this.fetchQuestionnaireStructure(data.id);

    const questionnaireWithCounts = data as QuestionnaireWithCounts;
    questionnaireWithCounts.section_count = sections?.length || 0;
    questionnaireWithCounts.step_count = steps?.length || 0;
    questionnaireWithCounts.question_count = questions?.length || 0;

    const sectionsData = sections || [];
    const stepsData = steps || [];
    const questionsData = questions || [];
    const questionRatingScalesData = questionRatingScales || [];

    const questionRolesData = await this.fetchQuestionRoles(
      questions.map((q) => q.id)
    );

    const transformedSections = this.buildQuestionnaireStructure(
      sectionsData,
      stepsData,
      questionsData,
      questionRatingScalesData,
      questionRolesData
    );

    // Return the questionnaire rating scales to use in the UI
    const {
      data: questionnaireRatingScalesData,
      error: questionnaireRatingScalesError,
    } = await this.supabase
      .from("questionnaire_rating_scales")
      .select("id, name, description, value, order_index, questionnaire_id")
      .eq("questionnaire_id", questionnaireId)
      .eq("is_deleted", false)
      .order("order_index", { ascending: true });

    if (questionnaireRatingScalesError) throw questionnaireRatingScalesError;

    return {
      ...questionnaireWithCounts,
      sections: transformedSections,
      questionnaire_rating_scales: questionnaireRatingScalesData,
    };
  }

  async createQuestionnaire(
    data: CreateQuestionnaireData
  ): Promise<Questionnaire> {
    const { data: questionnaire, error } = await this.supabase
      .from("questionnaires")
      .insert([
        {
          name: data.name,
          description: data.description,
          guidelines: data.guidelines,
          status: data.status || "draft",
          company_id: data.company_id,
          created_by: this.userId,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return questionnaire;
  }

  async updateQuestionnaire(
    questionnaireId: number,
    data: UpdateQuestionnaireData
  ): Promise<Questionnaire | null> {
    const { data: existingData, error: fetchError } = await this.supabase
      .from("questionnaires")
      .select("id")
      .eq("id", questionnaireId)
      .eq("is_deleted", false)
      .single();

    if (fetchError) throw fetchError;
    if (!existingData) return null;

    const { data: questionnaire, error } = await this.supabase
      .from("questionnaires")
      .update({
        name: data.name,
        description: data.description,
        guidelines: data.guidelines,
        status: data.status,
      })
      .eq("id", questionnaireId)
      .select()
      .single();

    if (error) throw error;
    return questionnaire;
  }

  async deleteQuestionnaire(questionnaireId: number): Promise<boolean> {
    const { data: existingData, error: fetchError } = await this.supabase
      .from("questionnaires")
      .select("id")
      .eq("id", questionnaireId)
      .eq("is_deleted", false)
      .single();

    if (fetchError) throw fetchError;
    if (!existingData) return false;

    const { error: deleteError } = await this.supabase
      .from("questionnaires")
      .update({ is_deleted: true })
      .eq("id", questionnaireId);

    if (deleteError) throw deleteError;
    return true;
  }

  async duplicateQuestionnaire(originalId: number): Promise<Questionnaire> {
    // Get the original questionnaire with all its structure
    const originalQuestionnaire = await this.getQuestionnaireById(originalId);
    if (!originalQuestionnaire) throw new Error("Questionnaire not found");

    // Create new questionnaire
    const { data: newQuestionnaire, error: questionnaireError } =
      await this.supabase
        .from("questionnaires")
        .insert([
          {
            name: `${originalQuestionnaire.name} (Copy)`,
            description: originalQuestionnaire.description,
            guidelines: originalQuestionnaire.guidelines,
            status: "draft",
            created_by: this.userId,
            company_id: originalQuestionnaire.company_id,
          },
        ])
        .select()
        .single();

    if (questionnaireError) throw questionnaireError;

    // Duplicate rating scales
    if (originalQuestionnaire.questionnaire_rating_scales.length > 0) {
      const { error: ratingError } = await this.supabase
        .from("questionnaire_rating_scales")
        .insert(
          originalQuestionnaire.questionnaire_rating_scales.map((scale) => ({
            name: scale.name,
            description: scale.description,
            order_index: scale.order_index,
            value: scale.value,
            questionnaire_id: newQuestionnaire.id,
            created_by: this.userId,
            company_id: newQuestionnaire.company_id,
          }))
        );

      if (ratingError) throw ratingError;
    }

    // Duplicate sections, steps, and questions
    for (const section of originalQuestionnaire.sections) {
      const { data: newSection, error: sectionError } = await this.supabase
        .from("questionnaire_sections")
        .insert([
          {
            questionnaire_id: newQuestionnaire.id,
            title: section.title,
            order_index: section.order_index,
            expanded: section.expanded,
            created_by: this.userId,
            company_id: newQuestionnaire.company_id,
          },
        ])
        .select()
        .single();

      if (sectionError) throw sectionError;

      for (const step of section.steps) {
        const { data: newStep, error: stepError } = await this.supabase
          .from("questionnaire_steps")
          .insert([
            {
              questionnaire_section_id: newSection.id,
              title: step.title,
              order_index: step.order_index,
              expanded: step.expanded,
              questionnaire_id: newQuestionnaire.id,
              created_by: this.userId,
              company_id: newQuestionnaire.company_id,
            },
          ])
          .select()
          .single();

        if (stepError) throw stepError;

        for (const question of step.questions) {
          const { data: newQuestion, error: questionError } =
            await this.supabase
              .from("questionnaire_questions")
              .insert([
                {
                  questionnaire_step_id: newStep.id,
                  title: question.title,
                  question_text: question.question_text,
                  context: question.context ?? 'Placeholder context',
                  order_index: question.order_index,
                  questionnaire_id: newQuestionnaire.id,
                  created_by: this.userId,
                  company_id: newQuestionnaire.company_id,
                },
              ])
              .select()
              .single();

          if (questionError) throw questionError;

          // Duplicate question rating scale associations
          if (question.question_rating_scales.length > 0) {
            // Get the new rating scale IDs that correspond to the original ones
            const { data: newRatingScales } = await this.supabase
              .from("questionnaire_rating_scales")
              .select("id, value, name")
              .eq("questionnaire_id", newQuestionnaire.id);

            if (newRatingScales) {
              // Create a mapping from original rating scales to new ones
              const ratingScaleMap = new Map();
              question.question_rating_scales.forEach((qrs) => {
                const matchingNewScale = newRatingScales.find(
                  (nrs) => nrs.id === qrs.questionnaire_rating_scale_id
                );
                if (matchingNewScale) {
                  ratingScaleMap.set(
                    qrs.questionnaire_rating_scale_id,
                    matchingNewScale.id
                  );
                }
              });

              // Insert the question rating scale associations
              const questionRatingScalesToInsert =
                question.question_rating_scales
                  .map((qrs) => {
                    const newRatingScaleId = ratingScaleMap.get(
                      qrs.questionnaire_rating_scale_id
                    );
                    if (newRatingScaleId) {
                      return {
                        questionnaire_question_id: newQuestion.id,
                        questionnaire_rating_scale_id: newRatingScaleId,
                        description: qrs.description,
                        questionnaire_id: newQuestionnaire.id,
                        created_by: this.userId,
                        company_id: newQuestionnaire.company_id,
                      };
                    }
                    return null;
                  })
                  .filter(
                    (item): item is NonNullable<typeof item> => item !== null
                  );

              if (questionRatingScalesToInsert.length > 0) {
                const { error: qrsError } = await this.supabase
                  .from("questionnaire_question_rating_scales")
                  .insert(questionRatingScalesToInsert);

                if (qrsError) throw qrsError;
              }
            }
          }
        }
      }
    }

    return newQuestionnaire;
  }

  // Questionnaire rating scale operations
  async getRatingScalesByQuestionnaireId(
    questionnaireId: number
  ): Promise<QuestionnaireRatingScale[]> {
    const { data, error } = await this.supabase
      .from("questionnaire_rating_scales")
      .select("*")
      .eq("questionnaire_id", questionnaireId)
      .eq("is_deleted", false)
      .order("order_index", { ascending: true });
    if (error) throw error;
    return data || [];
  }

  async createRatingScale(
    questionnaireId: number,
    ratingData: {
      name: string;
      description: string;
      value: number;
    }
  ): Promise<QuestionnaireRatingScale> {
    // Check questionnaire ownership
    const { data: questionnaire, error: qError } = await this.supabase
      .from("questionnaires")
      .select("id, company_id")
      .eq("id", questionnaireId)
      .eq("is_deleted", false)
      .maybeSingle();

    if (qError) throw qError;
    if (!questionnaire)
      throw new Error("Questionnaire not found or access denied");

    // Check if value already exists
    const { data: existingScale, error: existingError } = await this.supabase
      .from("questionnaire_rating_scales")
      .select("value")
      .eq("questionnaire_id", questionnaireId)
      .eq("value", ratingData.value)
      .eq("is_deleted", false)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existingScale) {
      throw new Error(
        `A rating scale with value ${ratingData.value} already exists`
      );
    }

    const { data: lastScale, error: lastError } = await this.supabase
      .from("questionnaire_rating_scales")
      .select("order_index")
      .eq("questionnaire_id", questionnaireId)
      .eq("is_deleted", false)
      .order("order_index", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastError) throw lastError;

    const newOrderIndex = lastScale ? lastScale.order_index + 1 : 1;

    const { data, error } = await this.supabase
      .from("questionnaire_rating_scales")
      .insert([
        {
          ...ratingData,
          order_index: newOrderIndex,
          questionnaire_id: questionnaireId,
          created_by: this.userId,
          company_id: questionnaire.company_id,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async createRatingScalesBatch(
    questionnaireId: number,
    ratingScalesData: Array<{
      name: string;
      description: string;
      value: number;
      order_index: number;
    }>
  ): Promise<QuestionnaireRatingScale[]> {
    // Check questionnaire ownership
    const { data: questionnaire, error: qError } = await this.supabase
      .from("questionnaires")
      .select("id, company_id")
      .eq("id", questionnaireId)
      .eq("is_deleted", false)
      .maybeSingle();

    if (qError) throw qError;
    if (!questionnaire)
      throw new Error("Questionnaire not found or access denied");

    // Check for duplicate values within the incoming batch
    const incomingValues = ratingScalesData.map((s) => s.value);
    const duplicatesInBatch = incomingValues.filter(
      (value, index) => incomingValues.indexOf(value) !== index
    );
    if (duplicatesInBatch.length > 0) {
      throw new Error(
        `Duplicate rating values in batch: ${[...new Set(duplicatesInBatch)].join(", ")}`
      );
    }

    // Check for conflicts with existing rating scale values
    const { data: existingScales, error: existingError } = await this.supabase
      .from("questionnaire_rating_scales")
      .select("value")
      .eq("questionnaire_id", questionnaireId)
      .eq("is_deleted", false)
      .in("value", incomingValues);

    if (existingError) throw existingError;

    if (existingScales && existingScales.length > 0) {
      const conflictingValues = existingScales.map((s) => s.value);
      throw new Error(
        `Rating scale values already exist: ${conflictingValues.join(", ")}`
      );
    }

    // Insert all rating scales in a single transaction
    const { data, error } = await this.supabase
      .from("questionnaire_rating_scales")
      .insert(
        ratingScalesData.map((scale) => ({
          ...scale,
          questionnaire_id: questionnaireId,
          created_by: this.userId,
          company_id: questionnaire.company_id,
        }))
      )
      .select();

    if (error) throw error;
    return data;
  }

  async updateRatingScale(
    ratingScaleId: number,
    updates: {
      name?: string;
      description?: string;
      value?: number;
      order_index?: number;
    }
  ): Promise<QuestionnaireRatingScale> {
    // Get the existing rating scale to find its questionnaire_id
    const { data: existingRatingScale, error: fetchError } = await this.supabase
      .from("questionnaire_rating_scales")
      .select("questionnaire_id, value")
      .eq("id", ratingScaleId)
      .eq("is_deleted", false)
      .single();

    if (fetchError) throw fetchError;
    if (!existingRatingScale) throw new Error("Rating scale not found");

    // If updating the value, check for conflicts with other rating scales
    if (
      updates.value !== undefined &&
      updates.value !== existingRatingScale.value
    ) {
      const { data: conflictingScale, error: conflictError } =
        await this.supabase
          .from("questionnaire_rating_scales")
          .select("id")
          .eq("questionnaire_id", existingRatingScale.questionnaire_id)
          .eq("value", updates.value)
          .eq("is_deleted", false)
          .neq("id", ratingScaleId)
          .maybeSingle();

      if (conflictError) throw conflictError;

      if (conflictingScale) {
        throw new Error(
          `A rating scale with value ${updates.value} already exists`
        );
      }
    }

    const { data, error } = await this.supabase
      .from("questionnaire_rating_scales")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", ratingScaleId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async checkRatingScaleInUse(ratingScaleId: number): Promise<{
    isInUse: boolean;
    questionCount: number;
    message?: string;
  }> {
    // Check if any questions reference this rating scale
    const { data: questionRatingScales, error } = await this.supabase
      .from("questionnaire_question_rating_scales")
      .select("questionnaire_question_id")
      .eq("questionnaire_rating_scale_id", ratingScaleId)
      .eq("is_deleted", false);

    if (error) throw error;

    const questionCount = questionRatingScales?.length || 0;

    if (questionCount === 0) {
      return { isInUse: false, questionCount: 0 };
    }

    throw new ForbiddenError(
      `Cannot change rating scale value while in use by ${questionCount} question${questionCount > 1 ? "s" : ""}. You can still update the name and description.`
    );
  }

  async deleteRatingScale(ratingScaleId: number): Promise<void> {
    const { error } = await this.supabase
      .from("questionnaire_rating_scales")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", ratingScaleId);

    if (error) throw error;

    // Delete all questionnaire question rating scale associations with this rating scale
    const { error: assocError } = await this.supabase
      .from("questionnaire_question_rating_scales")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq("questionnaire_rating_scale_id", ratingScaleId);

    if (assocError) throw assocError;
  }

  // Section operations
  async createSection(
    questionnaireId: number,
    sectionData: CreateQuestionnaireSectionData
  ): Promise<QuestionnaireSection> {
    // Check questionnaire ownership
    const { data: questionnaire, error: qError } = await this.supabase
      .from("questionnaires")
      .select("id, company_id")
      .eq("id", questionnaireId)
      .eq("is_deleted", false)
      .single();

    if (qError) throw qError;
    if (!questionnaire) throw new Error("Questionnaire not found");

    // Get the highest order_index to insert after
    const { data: maxOrderData, error: maxOrderError } = await this.supabase
      .from("questionnaire_sections")
      .select("order_index")
      .eq("questionnaire_id", questionnaireId)
      .eq("is_deleted", false)
      .order("order_index", { ascending: false })
      .limit(1);

    if (maxOrderError) throw maxOrderError;
    const newOrderIndex = (maxOrderData?.[0]?.order_index || 0) + 1;

    const { data, error } = await this.supabase
      .from("questionnaire_sections")
      .insert([
        {
          ...sectionData,
          questionnaire_id: questionnaireId,
          order_index: newOrderIndex,
          expanded: true,
          created_by: this.userId,
          company_id: questionnaire.company_id,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateSection(
    sectionId: number,
    updates: UpdateQuestionnaireSectionData
  ): Promise<QuestionnaireSection | null> {
    const { data: existingData, error: fetchError } = await this.supabase
      .from("questionnaire_sections")
      .select("id")
      .eq("id", sectionId)
      .eq("is_deleted", false)
      .single();

    if (fetchError) throw fetchError;
    if (!existingData) return null;

    const { data, error } = await this.supabase
      .from("questionnaire_sections")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", sectionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteSection(sectionId: number): Promise<boolean> {
    const { data: existingData, error: fetchError } = await this.supabase
      .from("questionnaire_sections")
      .select("id")
      .eq("id", sectionId)
      .eq("is_deleted", false)
      .single();

    if (fetchError) throw fetchError;
    if (!existingData) return false;

    const { error } = await this.supabase
      .from("questionnaire_sections")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", sectionId);

    if (error) throw error;
    return true;
  }

  // Step operations
  async createStep(
    sectionId: number,
    stepData: CreateQuestionnaireStepBody
  ): Promise<QuestionnaireStep> {
    // Fetch section to ensure it exists and belongs to the questionnaire
    const { data: section, error: sectionError } = await this.supabase
      .from("questionnaire_sections")
      .select("id, questionnaire_id, company_id")
      .eq("id", sectionId)
      .eq("is_deleted", false)
      .single();

    if (sectionError) throw sectionError;
    if (!section) throw new Error("Section not found");

    // Get the highest order_index in the same section to insert after
    const { data: maxOrderData, error: maxOrderError } = await this.supabase
      .from("questionnaire_steps")
      .select("order_index")
      .eq("questionnaire_section_id", sectionId)
      .eq("is_deleted", false)
      .order("order_index", { ascending: false })
      .limit(1);

    if (maxOrderError) throw maxOrderError;
    const newOrderIndex = (maxOrderData?.[0]?.order_index || 0) + 1;

    const { data, error } = await this.supabase
      .from("questionnaire_steps")
      .insert([
        {
          ...stepData,
          questionnaire_section_id: sectionId,
          order_index: newOrderIndex,
          expanded: true,
          questionnaire_id: section.questionnaire_id,
          created_by: this.userId,
          company_id: section.company_id,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateStep(
    stepId: number,
    updates: UpdateQuestionnaireStepData
  ): Promise<QuestionnaireStep | null> {
    const { data: existingData, error: fetchError } = await this.supabase
      .from("questionnaire_steps")
      .select("id")
      .eq("id", stepId)
      .eq("is_deleted", false)
      .single();

    if (fetchError) throw fetchError;
    if (!existingData) return null;

    const { data, error } = await this.supabase
      .from("questionnaire_steps")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", stepId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteStep(stepId: number): Promise<boolean> {
    const { data: existingData, error: fetchError } = await this.supabase
      .from("questionnaire_steps")
      .select("id")
      .eq("id", stepId)
      .eq("is_deleted", false)
      .single();

    if (fetchError) throw fetchError;
    if (!existingData) return false;

    const { error } = await this.supabase
      .from("questionnaire_steps")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", stepId);

    if (error) throw error;
    return true;
  }

  // Question operations
  async createQuestion(
    questionnaireStepId: number,
    questionData: Omit<CreateQuestionnaireQuestionData, "questionnaire_step_id">
  ): Promise<QuestionnaireQuestion> {
    // Verify step exists and belongs to the questionnaire
    const { data: step, error: stepError } = await this.supabase
      .from("questionnaire_steps")
      .select("id, questionnaire_id, company_id")
      .eq("id", questionnaireStepId)
      .eq("is_deleted", false)
      .single();

    if (stepError) throw stepError;
    if (!step) throw new Error("Step not found");

    // Get the highest order_index in the same step to insert after
    const { data: maxOrderData, error: maxOrderError } = await this.supabase
      .from("questionnaire_questions")
      .select("order_index")
      .eq("questionnaire_step_id", questionnaireStepId)
      .eq("is_deleted", false)
      .order("order_index", { ascending: false })
      .limit(1);

    if (maxOrderError) throw maxOrderError;
    const newOrderIndex = (maxOrderData?.[0]?.order_index || 0) + 1;

    const { data, error } = await this.supabase
      .from("questionnaire_questions")
      .insert([
        {
          ...questionData,
          questionnaire_step_id: questionnaireStepId,
          order_index: questionData.order_index ?? newOrderIndex,
          title: questionData.title || "New Question",
          questionnaire_id: step.questionnaire_id,
          created_by: this.userId,
          company_id: step.company_id,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Auto-assign all questionnaire rating scales to the new question
    const { data: questionnaireRatingScales, error: ratingScalesError } =
      await this.supabase
        .from("questionnaire_rating_scales")
        .select("id, description")
        .eq("questionnaire_id", step.questionnaire_id)
        .eq("is_deleted", false);

    if (ratingScalesError) throw ratingScalesError;

    // Create associations for all rating scales
    if (questionnaireRatingScales && questionnaireRatingScales.length > 0) {
      const associations = questionnaireRatingScales.map((rs) => ({
        questionnaire_question_id: data.id,
        questionnaire_rating_scale_id: rs.id,
        questionnaire_id: step.questionnaire_id,
        description: rs.description || "",  // Optional: can be customized later
        company_id: step.company_id,
        created_by: this.userId,
      }));

      const { error: associationsError } = await this.supabase
        .from("questionnaire_question_rating_scales")
        .insert(associations);

      if (associationsError) throw associationsError;
    }

    // Fetch the question with rating scales to return to the frontend
    const { data: questionWithRatingScales, error: fetchError } =
      await this.supabase
        .from("questionnaire_questions")
        .select(
          `
          *,
          question_rating_scales:questionnaire_question_rating_scales(
            id,
            description,
            questionnaire_rating_scale_id,
            questionnaire_question_id,
            questionnaire_id,
            questionnaire_rating_scales(
              name,
              value
            )
          )
        `
        )
        .eq("id", data.id)
        .single();

    if (fetchError) throw fetchError;

    // Keep the rating scale data structure nested
    if (questionWithRatingScales && questionWithRatingScales.question_rating_scales) {
      questionWithRatingScales.question_rating_scales =
        questionWithRatingScales.question_rating_scales.map((qrs: any) => ({
          id: qrs.id,
          description: qrs.description,
          questionnaire_rating_scale_id: qrs.questionnaire_rating_scale_id,
          questionnaire_question_id: qrs.questionnaire_question_id,
          questionnaire_id: qrs.questionnaire_id,
          questionnaire_rating_scales: {
            name: qrs.questionnaire_rating_scales?.name,
            value: qrs.questionnaire_rating_scales?.value,
          },
        }));
    }

    return questionWithRatingScales;
  }

  async updateQuestion(
    questionId: number,
    updates: UpdateQuestionnaireQuestionData
  ): Promise<QuestionnaireQuestion | null> {
    const { data: existingData, error: fetchError } = await this.supabase
      .from("questionnaire_questions")
      .select("id")
      .eq("id", questionId)
      .eq("is_deleted", false)
      .single();

    if (fetchError) throw fetchError;
    if (!existingData) return null;

    const { data, error } = await this.supabase
      .from("questionnaire_questions")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", questionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteQuestion(questionId: number): Promise<boolean> {
    const { data: existingData, error: fetchError } = await this.supabase
      .from("questionnaire_questions")
      .select("id")
      .eq("id", questionId)
      .eq("is_deleted", false)
      .single();

    if (fetchError) throw fetchError;
    if (!existingData) return false;

    const { error } = await this.supabase
      .from("questionnaire_questions")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", questionId);

    if (error) throw error;
    return true;
  }

  async duplicateQuestion(
    originalQuestionId: number
  ): Promise<QuestionnaireQuestion> {
    // First, get the original question with all its data
    const { data: originalQuestion, error: questionError } = await this.supabase
      .from("questionnaire_questions")
      .select(
        `
        *,
        questionnaire_question_rating_scales(
          questionnaire_rating_scale_id,
          description
        ),
        questionnaire_question_roles(
          shared_role_id
        )
      `
      )
      .eq("id", originalQuestionId)
      .single();

    if (questionError) throw questionError;
    if (!originalQuestion) throw new Error("Question not found");

    // Get the highest order_index in the same step to insert after
    const { data: maxOrderData, error: maxOrderError } = await this.supabase
      .from("questionnaire_questions")
      .select("order_index")
      .eq("questionnaire_step_id", originalQuestion.questionnaire_step_id)
      .order("order_index", { ascending: false })
      .limit(1);

    if (maxOrderError) throw maxOrderError;
    const newOrderIndex = (maxOrderData?.[0]?.order_index || 0) + 1;

    // Create the duplicate question
    const newQuestionData = {
      questionnaire_step_id: originalQuestion.questionnaire_step_id,
      question_text: `${originalQuestion.question_text} (Copy)`,
      context: originalQuestion.context,
      title: `${originalQuestion.title} (Copy)`,
      order_index: newOrderIndex,
      questionnaire_id: originalQuestion.questionnaire_id,
      created_by: this.userId,
      company_id: originalQuestion.company_id,
    };

    const { data: newQuestion, error: createError } = await this.supabase
      .from("questionnaire_questions")
      .insert([newQuestionData])
      .select()
      .single();

    if (createError) throw createError;

    // Duplicate rating scale associations if any exist
    if (originalQuestion.questionnaire_question_rating_scales?.length > 0) {
      const ratingScaleAssociations =
        originalQuestion.questionnaire_question_rating_scales.map((rs) => ({
          questionnaire_question_id: newQuestion.id,
          questionnaire_rating_scale_id: rs.questionnaire_rating_scale_id,
          description: rs.description,
          questionnaire_id: originalQuestion.questionnaire_id,
          created_by: this.userId,
          company_id: originalQuestion.company_id,
        }));

      const { error: ratingScaleError } = await this.supabase
        .from("questionnaire_question_rating_scales")
        .insert(ratingScaleAssociations);

      if (ratingScaleError) throw ratingScaleError;
    }

    // Duplicate role associations if any exist
    if (originalQuestion.questionnaire_question_roles?.length > 0) {
      const roleAssociations =
        originalQuestion.questionnaire_question_roles.map((qr) => ({
          questionnaire_question_id: newQuestion.id,
          shared_role_id: qr.shared_role_id,
          questionnaire_id: originalQuestion.questionnaire_id,
          created_by: this.userId,
          company_id: originalQuestion.company_id,
        }));

      const { error: roleError } = await this.supabase
        .from("questionnaire_question_roles")
        .insert(roleAssociations);

      if (roleError) throw roleError;
    }

    // Fetch the complete question with all associations to return
    const { data: completeQuestion, error: fetchError } = await this.supabase
      .from("questionnaire_questions")
      .select(
        `
        *,
        questionnaire_question_rating_scales(
          *,
          rating_scale:questionnaire_rating_scales(*)
        ),
        questionnaire_question_roles(
          *,
          role:shared_roles(*)
        )
      `
      )
      .eq("id", newQuestion.id)
      .single();

    if (fetchError) throw fetchError;

    // Transform to match the expected format
    const transformedQuestion = {
      ...completeQuestion,
      question_rating_scales:
        completeQuestion.questionnaire_question_rating_scales?.map((qrs) => ({
          ...qrs,
          rating_scale: qrs.rating_scale,
        })) || [],
      question_roles:
        completeQuestion.questionnaire_question_roles?.map((qar) => ({
          ...qar,
          role: qar.role,
        })) || [],
    };

    return transformedQuestion;
  }

  async addQuestionRatingScale(
    questionId: number,
    questionnaireRatingScaleId: number,
    description: string
  ): Promise<QuestionnaireQuestionRatingScale | null> {
    // Check if the association already exists
    const { data: existingData, error: fetchError } = await this.supabase
      .from("questionnaire_question_rating_scales")
      .select("id")
      .eq("questionnaire_question_id", questionId)
      .eq("questionnaire_rating_scale_id", questionnaireRatingScaleId)
      .eq("is_deleted", false)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (existingData) return null; // Association already exists

    // Fetch questionnaire rating scale to ensure it exists and to get its questionnaire_id
    const { data: ratingScale, error: ratingScaleError } = await this.supabase
      .from("questionnaire_rating_scales")
      .select("questionnaire_id, company_id")
      .eq("id", questionnaireRatingScaleId)
      .eq("is_deleted", false)
      .single();

    if (ratingScaleError) throw ratingScaleError;
    if (!ratingScale) {
      throw new Error("Questionnaire rating scale not found");
    }

    const { data, error } = await this.supabase
      .from("questionnaire_question_rating_scales")
      .insert([
        {
          questionnaire_question_id: questionId,
          questionnaire_rating_scale_id: questionnaireRatingScaleId,
          description,
          questionnaire_id: ratingScale.questionnaire_id,
          created_by: this.userId,
          company_id: ratingScale.company_id,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async deleteQuestionRatingScale(
    questionRatingScaleId: number
  ): Promise<void> {
    const { data, error } = await this.supabase
      .from("questionnaire_question_rating_scales")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", questionRatingScaleId)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("Unable to delete question rating scale");
  }

  async updateQuestionRatingScale(
    questionRatingScaleId: number,
    description: string
  ): Promise<QuestionnaireQuestionRatingScale> {
    const { data, error } = await this.supabase
      .from("questionnaire_question_rating_scales")
      .update({ description, updated_at: new Date().toISOString() })
      .eq("id", questionRatingScaleId)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async addQuestionnaireRatingScaleToQuestion(
    questionnaireId: number,
    questionId: number
  ): Promise<QuestionnaireQuestionRatingScale[]> {
    // Fetch rating scale associated with the questionnaire
    const {
      data: questionnaireRatingScale,
      error: questionnaireRatingScaleError,
    } = await this.supabase
      .from("questionnaire_rating_scales")
      .select("*")
      .eq("questionnaire_id", questionnaireId)
      .eq("is_deleted", false);

    if (questionnaireRatingScaleError) throw questionnaireRatingScaleError;
    if (!questionnaireRatingScale)
      throw new Error("Questionnaire rating scale not found");

    // Fetch existing associations to prevent duplicates
    const { data: existingAssociations, error: existingError } =
      await this.supabase
        .from("questionnaire_question_rating_scales")
        .select("questionnaire_rating_scale_id")
        .eq("questionnaire_question_id", questionId)
        .eq("is_deleted", false);

    if (existingError) throw existingError;

    // Create a Set of existing rating scale IDs for efficient lookup
    const existingRatingScaleIds = new Set(
      existingAssociations?.map(
        (assoc) => assoc.questionnaire_rating_scale_id
      ) || []
    );

    // Filter out rating scales that are already associated
    const newRatingScales = questionnaireRatingScale.filter(
      (qrs) => !existingRatingScaleIds.has(qrs.id)
    );

    // If all scales are already associated, return empty array
    if (newRatingScales.length === 0) {
      throw new BadRequestError(
        "All questionnaire rating scales are already associated with this question"
      );
    }

    const { data, error } = await this.supabase
      .from("questionnaire_question_rating_scales")
      .insert(
        newRatingScales.map((qrs) => ({
          questionnaire_question_id: questionId,
          questionnaire_id: questionnaireId,
          questionnaire_rating_scale_id: qrs.id,
          description: qrs.description ?? "Auto-added scale",
          company_id: qrs.company_id,
        }))
      )
      .select();

    if (error) throw error;
    return data;
  }

  // Question applicable role
  async updateQuestionApplicableRoles(
    questionId: number,
    sharedRoleIds: number[]
  ): Promise<QuestionApplicableRole[]> {
    if (sharedRoleIds.length === 0) {
      // Remove all associations
      const { error: deleteError } = await this.supabase
        .from("questionnaire_question_roles")
        .delete()
        .eq("questionnaire_question_id", questionId);

      if (deleteError) throw deleteError;
      return [];
    }

    // Validate userId exists
    if (!this.userId) {
      throw new Error("User ID is required");
    }

    // Check question exists and get its questionnaire_id
    const { data: question, error: questionError } = await this.supabase
      .from("questionnaire_questions")
      .select("id, questionnaire_id, company_id")
      .eq("id", questionId)
      .eq("is_deleted", false)
      .maybeSingle();

    if (questionError) throw questionError;
    if (!question) throw new Error("Question not found");

    // Validate all role IDs exist
    const { data: validRoles, error: rolesError } = await this.supabase
      .from("shared_roles")
      .select("id, name, description")
      .in("id", sharedRoleIds);

    if (rolesError) throw rolesError;
    if (validRoles.length !== sharedRoleIds.length) {
      throw new Error("One or more invalid shared role IDs provided");
    }

    // Option 1: Delete with error handling
    const { error: deleteError } = await this.supabase
      .from("questionnaire_question_roles")
      .delete()
      .eq("questionnaire_question_id", questionId);

    if (deleteError) throw deleteError;

    // Insert new associations with select to return data
    const { data: newRoleAssociations, error: insertError } =
      await this.supabase
        .from("questionnaire_question_roles")
        .insert(
          validRoles.map((r) => ({
            questionnaire_question_id: questionId,
            shared_role_id: r.id,
            questionnaire_id: question.questionnaire_id,
            created_by: this.userId,
            company_id: question.company_id,
          }))
        )
        .select(); // Add select to return inserted data

    // Add name and description to the returned data
    const data = newRoleAssociations?.map((d) => {
      const role = validRoles.find((r) => r.id === d.shared_role_id);
      return {
        ...d,
        name: role?.name || "",
        description: role?.description || null,
      };
    });

    if (insertError) {
      // Critical: Try to restore something or log this failure
      console.error("Failed to insert roles after deletion:", insertError);
      throw insertError;
    }

    if (!data) {
      throw new Error("Failed to retrieve updated role associations");
    }
    return data;
  }

  private async fetchCounts(questionnaireIds: number[]) {
    return Promise.all([
      this.supabase
        .from("questionnaire_sections")
        .select("id, questionnaire_id")
        .eq("is_deleted", false)
        .in("questionnaire_id", questionnaireIds),
      this.supabase
        .from("questionnaire_steps")
        .select("id, questionnaire_id")
        .eq("is_deleted", false)
        .in("questionnaire_id", questionnaireIds),
      this.supabase
        .from("questionnaire_questions")
        .select("id, questionnaire_id")
        .eq("is_deleted", false)
        .in("questionnaire_id", questionnaireIds),
    ]).then(([sectionsResult, stepsResult, questionsResult]) => {
      if (sectionsResult.error || stepsResult.error || questionsResult.error) {
        throw (
          sectionsResult.error || stepsResult.error || questionsResult.error
        );
      }
      return [sectionsResult.data, stepsResult.data, questionsResult.data];
    });
  }

  private async fetchQuestionnaireStructure(
    questionnaireId: number
  ): Promise<QuestionnaireStructureData> {
    return Promise.all([
      this.supabase
        .from("questionnaire_sections")
        .select("id, title, order_index, expanded, questionnaire_id")
        .eq("questionnaire_id", questionnaireId)
        .eq("is_deleted", false)
        .order("order_index", { ascending: true }),
      this.supabase
        .from("questionnaire_steps")
        .select(
          "id, title, order_index, expanded, questionnaire_section_id, questionnaire_id"
        )
        .eq("questionnaire_id", questionnaireId)
        .eq("is_deleted", false)
        .order("order_index", { ascending: true }),
      this.supabase
        .from("questionnaire_questions")
        .select(
          "id, question_text, context, order_index, title, questionnaire_step_id, questionnaire_id"
        )
        .eq("questionnaire_id", questionnaireId)
        .eq("is_deleted", false)
        .order("order_index", { ascending: true }),
      this.supabase
        .from("questionnaire_question_rating_scales")
        .select(
          "id, questionnaire_rating_scale_id(id,name,description,value), description, questionnaire_question_id, questionnaire_id"
        )
        .eq("questionnaire_id", questionnaireId)
        .eq("is_deleted", false),
    ]).then(
      ([
        sectionsResult,
        stepsResult,
        questionsResult,
        questionRatingScalesResult,
      ]) => {
        if (
          sectionsResult.error ||
          stepsResult.error ||
          questionsResult.error ||
          questionRatingScalesResult.error
        ) {
          throw (
            sectionsResult.error ||
            stepsResult.error ||
            questionsResult.error ||
            questionRatingScalesResult.error
          );
        }
        return [
          sectionsResult.data,
          stepsResult.data,
          questionsResult.data,
          // Unpack nested joined data
          questionRatingScalesResult.data.map((qrs) => ({
            id: qrs.id,
            description: qrs.description,
            name: qrs.questionnaire_rating_scale_id.name,
            questionnaire_rating_scale_id: qrs.questionnaire_rating_scale_id.id,
            value: qrs.questionnaire_rating_scale_id.value,
            questionnaire_question_id: qrs.questionnaire_question_id,
            questionnaire_id: qrs.questionnaire_id,
          })),
        ];
      }
    );
  }

  private async fetchQuestionRoles(
    questionIds: number[]
  ): Promise<QuestionRole[]> {
    const { data, error } = await this.supabase
      .from("questionnaire_question_roles")
      .select("id, questionnaire_question_id, shared_roles(*)")
      .in("questionnaire_question_id", questionIds)
      .eq("is_deleted", false);

    if (error) throw error;

    return data.map((r) => ({
      id: r.id,
      shared_role_id: r.shared_roles.id,
      name: r.shared_roles.name,
      description: r.shared_roles.description,
      questionnaire_question_id: r.questionnaire_question_id, // used for indexing downstream
    }));
  }

  private buildQuestionnaireStructure(
    sectionsData: QuestionnaireStructureSectionsData[],
    stepsData: QuestionnaireStructureStepsData[],
    questionsData: QuestionnaireStructureQuestionsData[],
    questionRatingScalesData: QuestionnaireStructureQuestionRatingScaleData[],
    questionRolesData: QuestionRole[]
  ) {
    const stepsBySection: Map<number, QuestionnaireStructureStepsData[]> =
      new Map();
    const questionsByStep: Map<number, QuestionnaireStructureQuestionsData[]> =
      new Map();
    const ratingScalesByQuestion: Map<
      number,
      QuestionnaireStructureQuestionRatingScaleData[]
    > = new Map();
    const rolesByQuestion: Map<number, QuestionRole[]> = new Map();

    for (const step of stepsData) {
      const stepSectionId = step.questionnaire_section_id;
      if (!stepsBySection.has(stepSectionId)) {
        stepsBySection.set(stepSectionId, []);
      }
      stepsBySection.get(stepSectionId)!.push(step);
    }

    for (const question of questionsData) {
      const stepId = question.questionnaire_step_id;
      if (!questionsByStep.has(stepId)) {
        questionsByStep.set(stepId, []);
      }
      questionsByStep.get(stepId)!.push(question);
    }

    for (const qrs of questionRatingScalesData) {
      const questionId = qrs.questionnaire_question_id;
      if (!ratingScalesByQuestion.has(questionId)) {
        ratingScalesByQuestion.set(questionId, []);
      }
      ratingScalesByQuestion.get(questionId)!.push(qrs);
    }

    for (const qr of questionRolesData) {
      const questionId = qr.questionnaire_question_id;
      if (!rolesByQuestion.has(questionId)) {
        rolesByQuestion.set(questionId, []);
      }
      rolesByQuestion.get(questionId)!.push(qr);
    }

    console.log("questionRatingScalesData:", questionRatingScalesData);

    return sectionsData
      .map((section) => {
        const sectionSteps = stepsBySection.get(section.id) || [];

        return {
          ...section,
          steps: sectionSteps
            .map((step) => {
              const stepQuestions = questionsByStep.get(step.id) || [];

              return {
                ...step,
                questions: stepQuestions.map((question) => {
                  const questionRatingScalesList =
                    ratingScalesByQuestion.get(question.id) || [];
                  const questionRolesList =
                    rolesByQuestion.get(question.id) || [];

                  return {
                    ...question,
                    question_rating_scales: questionRatingScalesList,
                    // TODO: Not sure if we need this transformation
                    // .map(
                    //   (qrs) => ({
                    //     ...qrs,
                    //     rating_scale: qrs.rating_scale,
                    //   })
                    // ),
                    question_roles: questionRolesList,
                  };
                }),
              };
            })
            .sort((a, b) => a.order_index - b.order_index),
        };
      })
      .sort((a, b) => a.order_index - b.order_index);
  }

  async checkQuestionnaireUsage(questionnaireId: number) {
    try {
      // Check assessments using this questionnaire
      const { data: assessments, error: assessmentError } = await this.supabase
        .from("assessments")
        .select("id, name")
        .eq("questionnaire_id", questionnaireId)
        .eq("is_deleted", false);

      if (assessmentError) throw assessmentError;

      // Check programs using this questionnaire (either as onsite or presite questionnaire)
      const { data: programs, error: programError } = await this.supabase
        .from("programs")
        .select("id, name")
        .or(
          `onsite_questionnaire_id.eq.${questionnaireId},presite_questionnaire_id.eq.${questionnaireId}`
        )
        .eq("is_deleted", false);

      if (programError) throw programError;

      // Get interview counts for each assessment
      const assessmentIds = assessments?.map((a) => a.id) || [];
      let totalInterviews = 0;

      if (assessmentIds.length > 0) {
        const { count, error: interviewError } = await this.supabase
          .from("interviews")
          .select("*", { count: "exact", head: true })
          .in("assessment_id", assessmentIds)
          .eq("is_deleted", false);

        if (interviewError) throw interviewError;
        totalInterviews = count || 0;
      }

      const assessmentCount = assessments?.length || 0;
      const programCount = programs?.length || 0;

      return {
        assessmentCount,
        assessments: assessments || [],
        interviewCount: totalInterviews,
        programCount,
        programs: programs || [],
        isInUse: assessmentCount > 0 || programCount > 0,
      };
    } catch (error) {
      console.error("Error checking questionnaire usage:", error);
      throw error;
    }
  }

  async checkQuestionnaireInUse(questionnaireId: number): Promise<{
    isInUse: boolean;
    message?: string;
  }> {
    const usage = await this.checkQuestionnaireUsage(questionnaireId);

    if (!usage.isInUse) {
      return { isInUse: false };
    }

    const parts: string[] = [];
    if (usage.assessmentCount > 0) {
      parts.push(
        `${usage.assessmentCount} assessment${usage.assessmentCount > 1 ? "s" : ""}`
      );
    }
    if (usage.programCount > 0) {
      parts.push(
        `${usage.programCount} program${usage.programCount > 1 ? "s" : ""}`
      );
    }

    throw new ForbiddenError(
      `Cannot modify questionnaire structure while in use by ${parts.join(
        " and "
      )}`
    );
  }

  async importQuestionnaire(
    companyId: string,
    importData: {
      name: string;
      description?: string;
      guidelines?: string;
      sections: Array<{
        title: string;
        order_index: number;
      }>;
      steps: Array<{
        section_title: string;
        title: string;
        order_index: number;
      }>;
      questions: Array<{
        section_title: string;
        step_title: string;
        title: string;
        question_text: string;
        context: string;
        order_index: number;
      }>;
      rating_scales: Array<{
        name: string;
        description: string;
        value: number;
        order_index: number;
      }>;
      question_rating_scales: Array<{
        question_key: string;
        value: number;
        description: string;
      }>;
    }
  ): Promise<Questionnaire> {
    // TODO: Move to PostgreSQL RPC function for atomic transactions
    // when we need production-grade reliability

    try {
      // 1. Create questionnaire
      const { data: questionnaire, error: qError } = await this.supabase
        .from("questionnaires")
        .insert({
          name: importData.name,
          description: importData.description || null,
          guidelines: importData.guidelines || null,
          status: "draft",
          created_by: this.userId,
          company_id: companyId,
        })
        .select()
        .single();

      if (qError) throw qError;

      // 2. Insert sections with questionnaire_id
      const sectionsToInsert = importData.sections.map((s) => ({
        questionnaire_id: questionnaire.id,
        title: s.title,
        order_index: s.order_index,
        expanded: true,
        created_by: this.userId,
        company_id: companyId,
      }));

      const { data: sections, error: sError } = await this.supabase
        .from("questionnaire_sections")
        .insert(sectionsToInsert)
        .select();

      if (sError) throw sError;

      // Create lookup map: section title -> section id
      const sectionIdsByTitle = new Map(sections.map((s) => [s.title, s.id]));

      // 3. Insert steps with questionnaire_id + questionnaire_section_id
      const stepsToInsert = importData.steps.map((st) => ({
        questionnaire_id: questionnaire.id,
        questionnaire_section_id: sectionIdsByTitle.get(st.section_title)!,
        title: st.title,
        order_index: st.order_index,
        expanded: true,
        created_by: this.userId,
        company_id: companyId,
      }));

      const { data: steps, error: stError } = await this.supabase
        .from("questionnaire_steps")
        .insert(stepsToInsert)
        .select();

      if (stError) throw stError;

      // Create lookup map: section_title|step_title -> step id
      const stepIdsByKey = new Map(
        steps.map((st, index) => [
          `${importData.steps[index].section_title}|${st.title}`,
          st.id,
        ])
      );

      // 4. Insert questions with questionnaire_id + questionnaire_step_id
      const questionsToInsert = importData.questions.map((q) => ({
        questionnaire_id: questionnaire.id,
        questionnaire_step_id: stepIdsByKey.get(
          `${q.section_title}|${q.step_title}`
        )!,
        title: q.title,
        question_text: q.question_text,
        context: q.context ?? 'Placeholder context',
        order_index: q.order_index,
        created_by: this.userId,
        company_id: companyId,
      }));

      const { data: questions, error: qsError } = await this.supabase
        .from("questionnaire_questions")
        .insert(questionsToInsert)
        .select();

      if (qsError) throw qsError;

      // Create lookup map: section_title|step_title|question_title -> question id
      const questionIdsByKey = new Map(
        questions.map((q, index) => [
          `${importData.questions[index].section_title}|${importData.questions[index].step_title}|${q.title}`,
          q.id,
        ])
      );

      // 5. Insert rating scales with questionnaire_id
      const ratingScalesToInsert = importData.rating_scales.map((rs) => ({
        questionnaire_id: questionnaire.id,
        name: rs.name,
        description: rs.description || null,
        value: rs.value,
        order_index: rs.order_index,
        created_by: this.userId,
        company_id: companyId,
      }));

      const { data: ratingScales, error: rsError } = await this.supabase
        .from("questionnaire_rating_scales")
        .insert(ratingScalesToInsert)
        .select();

      if (rsError) throw rsError;

      // Create lookup map: value -> rating_scale id
      const ratingScaleIdsByValue = new Map(
        ratingScales.map((rs) => [rs.value, rs.id])
      );

      // 6. Insert question_rating_scales links
      const questionRatingScalesToInsert =
        importData.question_rating_scales.map((qrs) => ({
          questionnaire_id: questionnaire.id,
          questionnaire_question_id: questionIdsByKey.get(qrs.question_key)!,
          questionnaire_rating_scale_id: ratingScaleIdsByValue.get(qrs.value)!,
          description: qrs.description,
          created_by: this.userId,
          company_id: companyId,
        }));

      const { error: qrsError } = await this.supabase
        .from("questionnaire_question_rating_scales")
        .insert(questionRatingScalesToInsert);

      if (qrsError) throw qrsError;

      return questionnaire;
    } catch (error) {
      console.error("Import failed:", error);
      throw error;
    }
  }

  // Question part operations
  async getQuestionParts(questionId: number): Promise<QuestionPart[]> {
    const { data, error } = await this.supabase
      .from("questionnaire_question_parts")
      .select("*")
      .eq("questionnaire_question_id", questionId)
      .eq("is_deleted", false);

    if (error) throw error;
    return data;
  }

  async createQuestionPart(data: CreateQuestionPartData): Promise<QuestionPart> {
    // validate question exists and get the company_id and rating_scale_mapping associated with it
    const { data: question, error: questionError } = await this.supabase
      .from("questionnaire_questions")
      .select("id, questionnaire_id, company_id, rating_scale_mapping")
      .eq("id", data.questionnaire_question_id)
      .eq("is_deleted", false)
      .single();

    if (questionError) throw questionError;
    if (!question) throw new NotFoundError("Question not found");

    // Check if questionnaire is in use
    await this.checkQuestionnaireInUse(question.questionnaire_id);

    // Create new object with all required fields (don't mutate input)
    const partData = {
      ...data,
      company_id: question.company_id,
      created_by: this.userId,
    };

    const { data: insertedData, error } = await this.supabase
      .from("questionnaire_question_parts")
      .insert([partData])
      .select()
      .single();

    if (error) throw error;

    // Auto-create or update rating_scale_mapping with defaults for the new part
    const maxLevel = await this.getMaxLevelForQuestionnaire(
      question.questionnaire_id
    );
    const defaultScoring = this.createDefaultPartScoring(
      data.answer_type,
      data.options,
      maxLevel
    );

    // Only update mapping if scoring was generated (not null for text types)
    if (defaultScoring !== null) {
      const partIdStr = insertedData.id.toString();
      let updatedMapping: WeightedScoringConfig;

      if (question.rating_scale_mapping) {
        // Add to existing mapping
        const currentMapping = question.rating_scale_mapping as unknown as WeightedScoringConfig;
        updatedMapping = {
          ...currentMapping,
          partScoring: {
            ...currentMapping.partScoring,
            [partIdStr]: defaultScoring,
          },
        };
      } else {
        // Create new mapping
        updatedMapping = {
          version: "weighted",
          partScoring: {
            [partIdStr]: defaultScoring,
          },
        };
      }

      // Update the question's rating_scale_mapping
      const { error: updateError } = await this.supabase
        .from("questionnaire_questions")
        .update({
          rating_scale_mapping: updatedMapping as unknown as Json,
          updated_at: new Date().toISOString(),
        })
        .eq("id", question.id);

      if (updateError) throw updateError;
    }

    return insertedData;
  }

  async updateQuestionPart(partId: number, updates: UpdateQuestionPartData): Promise<QuestionPart> {
    // Fetch part to get questionnaire_id for validation
    const { data: existingPart, error: fetchError } = await this.supabase
      .from("questionnaire_question_parts")
      .select("id, questionnaire_question_id")
      .eq("id", partId)
      .eq("is_deleted", false)
      .single();

    if (fetchError) throw fetchError;
    if (!existingPart) throw new NotFoundError("Question part not found");

    // Get question to validate questionnaire isn't in use
    const { data: question, error: questionError } = await this.supabase
      .from("questionnaire_questions")
      .select("questionnaire_id")
      .eq("id", existingPart.questionnaire_question_id)
      .eq("is_deleted", false)
      .single();

    if (questionError) throw questionError;
    if (!question) throw new NotFoundError("Question not found");

    // Check if questionnaire is in use
    await this.checkQuestionnaireInUse(question.questionnaire_id);

    const { data, error } = await this.supabase
      .from("questionnaire_question_parts")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", partId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteQuestionPart(partId: number): Promise<boolean> {
    // Fetch the part to validate it exists and get the question ID
    const { data: existingData, error: fetchError } = await this.supabase
      .from("questionnaire_question_parts")
      .select("id, questionnaire_question_id")
      .eq("id", partId)
      .eq("is_deleted", false)
      .single();

    if (fetchError) throw fetchError;
    if (!existingData) throw new NotFoundError("Question part not found");

    // Fetch the question to get its current rating_scale_mapping
    const { data: question, error: questionError } = await this.supabase
      .from("questionnaire_questions")
      .select("id, rating_scale_mapping")
      .eq("id", existingData.questionnaire_question_id)
      .eq("is_deleted", false)
      .single();

    if (questionError) throw questionError;
    if (!question) throw new NotFoundError("Question not found");

    // Remove the deleted part from the rating_scale_mapping if it exists
    if (question.rating_scale_mapping) {
      const currentMapping = question.rating_scale_mapping as unknown as WeightedScoringConfig;
      const updatedMapping = this.removePartFromMapping(currentMapping, partId);

      // Update the question's rating_scale_mapping
      const { error: updateError } = await this.supabase
        .from("questionnaire_questions")
        .update({
          rating_scale_mapping: updatedMapping as unknown as Json,
          updated_at: new Date().toISOString(),
        })
        .eq("id", question.id);

      if (updateError) throw updateError;
    }

    // Soft delete the part
    const { error } = await this.supabase
      .from("questionnaire_question_parts")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", partId);

    if (error) throw error;
    return true;
  }

  async duplicateQuestionPart(partId: number): Promise<QuestionPart> {
    // First, get the original question part with all its data
    const { data: originalPart, error: partError } = await this.supabase
      .from("questionnaire_question_parts")
      .select("*")
      .eq("id", partId)
      .single();

    if (partError) throw partError;
    if (!originalPart) throw new NotFoundError("Question part not found");

    // Create the duplicate question part
    const newPartData = {
      questionnaire_question_id: originalPart.questionnaire_question_id,
      text: originalPart.text,
      answer_type: originalPart.answer_type,
      options: originalPart.options,
      order_index: originalPart.order_index + 1, // Insert after the original
      company_id: originalPart.company_id,
    };

    const { data: newPart, error: createError } = await this.supabase
      .from("questionnaire_question_parts")
      .insert([newPartData])
      .select()
      .single();

    if (createError) throw createError;

    // Fetch the question to get its current rating_scale_mapping and questionnaire_id
    const { data: question, error: questionError } = await this.supabase
      .from("questionnaire_questions")
      .select("id, questionnaire_id, rating_scale_mapping")
      .eq("id", originalPart.questionnaire_question_id)
      .eq("is_deleted", false)
      .single();

    if (questionError) throw questionError;
    if (!question) throw new NotFoundError("Question not found");

    // Try to copy the original part's scoring config, or generate defaults as fallback
    const partIdStr = partId.toString();
    const newPartIdStr = newPart.id.toString();
    let updatedMapping: WeightedScoringConfig | null = null;

    if (question.rating_scale_mapping) {
      const currentMapping = question.rating_scale_mapping as unknown as WeightedScoringConfig;

      // Check if original part has scoring configured
      if (currentMapping.partScoring[partIdStr]) {
        // Copy from original part
        updatedMapping = this.copyPartInMapping(currentMapping, partId, newPart.id);
      } else {
        // Original part not in mapping, generate defaults for the new part
        const maxLevel = await this.getMaxLevelForQuestionnaire(question.questionnaire_id);
        const defaultScoring = this.createDefaultPartScoring(
          originalPart.answer_type,
          originalPart.options,
          maxLevel
        );

        if (defaultScoring !== null) {
          updatedMapping = {
            ...currentMapping,
            partScoring: {
              ...currentMapping.partScoring,
              [newPartIdStr]: defaultScoring,
            },
          };
        }
      }
    } else {
      // No mapping exists, create new one with defaults for the duplicated part
      const maxLevel = await this.getMaxLevelForQuestionnaire(question.questionnaire_id);
      const defaultScoring = this.createDefaultPartScoring(
        originalPart.answer_type,
        originalPart.options,
        maxLevel
      );

      if (defaultScoring !== null) {
        updatedMapping = {
          version: "weighted",
          partScoring: {
            [newPartIdStr]: defaultScoring,
          },
        };
      }
    }

    // Update the mapping if changes were made
    if (updatedMapping !== null) {
      const { error: updateError } = await this.supabase
        .from("questionnaire_questions")
        .update({
          rating_scale_mapping: updatedMapping as unknown as Json,
          updated_at: new Date().toISOString(),
        })
        .eq("id", question.id);

      if (updateError) throw updateError;
    }

    return newPart;
  }

  async reorderQuestionParts(
    questionId: number,
    orderedPartIds: number[]
  ): Promise<void> {
    if (orderedPartIds.length === 0) {
      throw new BadRequestError("Ordered part IDs array cannot be empty");
    }
    // Validate that all provided part IDs belong to the question
    const { data: existingParts, error: fetchError } = await this.supabase
      .from("questionnaire_question_parts")
      .select("id")
      .eq("questionnaire_question_id", questionId)
      .eq("is_deleted", false);

    if (fetchError) throw fetchError;

    const existingPartIds = existingParts.map((part) => part.id);
    const invalidPartIds = orderedPartIds.filter(
      (id) => !existingPartIds.includes(id)
    );

    if (invalidPartIds.length > 0) {
      throw new BadRequestError(
        `Invalid part IDs for the specified question: ${invalidPartIds.join(", ")}`
      );
    }

    // Update order_index for each part
    for (let index = 0; index < orderedPartIds.length; index++) {
      const partId = orderedPartIds[index];
      const { error } = await this.supabase
        .from("questionnaire_question_parts")
        .update({ order_index: index, updated_at: new Date().toISOString() })
        .eq("id", partId);

      if (error) throw error;
    }
  }

  async getQuestionRatingScaleMapping(
    questionId: number
  ): Promise<WeightedScoringConfig | null> {
    const { data: question, error } = await this.supabase
      .from("questionnaire_questions")
      .select("rating_scale_mapping")
      .eq("id", questionId)
      .eq("is_deleted", false)
      .single();

    if (error) throw error;
    if (!question) throw new NotFoundError("Question not found");

    // Return null if no mapping exists
    if (!question.rating_scale_mapping) {
      return null;
    }

    // Validate and return the mapping as WeightedScoringConfig
    try {
      return validateWeightedScoringConfig(question.rating_scale_mapping);
    } catch (err) {
      if (err instanceof ZodError) {
        // If stored data is invalid, log error but return null to allow fixing
        console.error(
          `Invalid rating_scale_mapping for question ${questionId}:`,
          formatValidationErrors(err)
        );
        return null;
      }
      throw err;
    }
  }

  async updateQuestionRatingScaleMapping(
    questionId: number,
    mapping: WeightedScoringConfig
  ): Promise<unknown> {
    // Validate the mapping structure before saving
    try {
      validateWeightedScoringConfig(mapping);
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = formatValidationErrors(err);
        throw new BadRequestError(
          `Invalid weighted scoring configuration: ${errors.join(", ")}`
        );
      }
      throw err;
    }

    // Fetch the question to validate it exists and get questionnaire_id
    const { data: question, error: questionError } = await this.supabase
      .from("questionnaire_questions")
      .select("id, questionnaire_id")
      .eq("id", questionId)
      .eq("is_deleted", false)
      .single();

    if (questionError) throw questionError;
    if (!question) throw new NotFoundError("Question not found");

    // Check if questionnaire is in use
    await this.checkQuestionnaireInUse(question.questionnaire_id);

    // Update the rating_scale_mapping field
    const { data: updatedQuestion, error: updateError } = await this.supabase
      .from("questionnaire_questions")
      .update({
        rating_scale_mapping: mapping as unknown as Json,
        updated_at: new Date().toISOString(),
      })
      .eq("id", questionId)
      .select()
      .single();

    if (updateError) throw updateError;

    return updatedQuestion;
  }

  /**
   * Helper method to remove a part from the rating scale mapping
   * Returns null if the mapping becomes empty after removal
   */
  private removePartFromMapping(
    mapping: WeightedScoringConfig | null,
    partId: number
  ): WeightedScoringConfig | null {
    if (!mapping) return null;

    const partIdStr = partId.toString();

    // Create new partScoring without the deleted part
    const remainingPartScoring = Object.keys(mapping.partScoring)
      .filter(key => key !== partIdStr)
      .reduce((acc, key) => {
        acc[key] = mapping.partScoring[key];
        return acc;
      }, {} as typeof mapping.partScoring);

    // If no parts remain in the mapping, return null
    if (Object.keys(remainingPartScoring).length === 0) {
      return null;
    }

    return {
      ...mapping,
      partScoring: remainingPartScoring,
    };
  }

  /**
   * Helper method to copy a part's scoring config to a new part in the mapping
   * Returns the updated mapping or the original if source part not found
   */
  private copyPartInMapping(
    mapping: WeightedScoringConfig | null,
    sourcePartId: number,
    targetPartId: number
  ): WeightedScoringConfig | null {
    if (!mapping) return null;

    const sourcePartIdStr = sourcePartId.toString();
    const targetPartIdStr = targetPartId.toString();

    // If source part doesn't exist in mapping, return original
    if (!mapping.partScoring[sourcePartIdStr]) {
      return mapping;
    }

    return {
      ...mapping,
      partScoring: {
        ...mapping.partScoring,
        [targetPartIdStr]: mapping.partScoring[sourcePartIdStr],
      },
    };
  }

  /**
   * Helper method to get maxLevel from questionnaire rating scales
   * Returns the count of rating scales, or 3 as a default if none exist
   */
  private async getMaxLevelForQuestionnaire(
    questionnaireId: number
  ): Promise<number> {
    const { data: ratingScales, error } = await this.supabase
      .from("questionnaire_rating_scales")
      .select("id")
      .eq("questionnaire_id", questionnaireId)
      .eq("is_deleted", false);

    if (error) throw error;

    // Return count of rating scales, or default to 3 if none exist
    return ratingScales && ratingScales.length > 0 ? ratingScales.length : 3;
  }

  /**
   * Helper method to create default scoring for a question part
   * Returns null for unscorable types (like text)
   */
  private createDefaultPartScoring(
    answerType: string,
    options: Json,
    maxLevel: number
  ): WeightedScoringConfig["partScoring"][string] | null {
    const opts = options as { min?: number; max?: number; labels?: string[] };

    switch (answerType) {
      case "boolean":
        // True maps to highest level, false to lowest
        return {
          true: maxLevel,
          false: 1,
        };

      case "labelled_scale": {
        const labels = opts.labels || [];
        if (labels.length === 0) return null; // Can't score without labels

        // Distribute labels evenly across levels
        if (labels.length === 1) {
          return { [labels[0]]: maxLevel };
        }

        const scoring: { [label: string]: number } = {};
        labels.forEach((label, index) => {
          // Linear distribution from 1 to maxLevel
          const level = Math.round(
            1 + (index / (labels.length - 1)) * (maxLevel - 1)
          );
          scoring[label] = level;
        });
        return scoring;
      }

      case "scale":
      case "number":
      case "percentage": {
        const min = opts.min ?? 0;
        const max = opts.max ?? 100;
        const rangeSize = (max - min) / maxLevel;

        const ranges: Array<{ min: number; max: number; level: number }> = [];
        for (let level = 1; level <= maxLevel; level++) {
          const rangeMin = min + (level - 1) * rangeSize;
          const rangeMax =
            level === maxLevel ? max : min + level * rangeSize - 0.01;

          ranges.push({
            min: Math.round(rangeMin * 100) / 100,
            max: Math.round(rangeMax * 100) / 100,
            level,
          });
        }
        return ranges;
      }

      default:
        // Unknown or unscorable type (e.g., text)
        return null;
    }
  }
}
