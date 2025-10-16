import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/database.js";
import { ProgramWithRelations } from "../types/entities/programs.js";

export class ProgramService {
  private supabase: SupabaseClient<Database>;

  constructor(supabaseClient: SupabaseClient<Database>) {
    this.supabase = supabaseClient;
  }

  async getPrograms(companyId?: string): Promise<ProgramWithRelations[]> {
    let query = this.supabase
      .from("programs")
      .select(
        `
        *,
        company:companies!inner(id, name),
        program_objectives(id)
      `
      )
      .eq("is_deleted", false);

    if (companyId) {
      query = query.eq("company_id", companyId);
    }

    const { data: programs, error } = await query.order("updated_at", {
      ascending: false,
    });

    if (error) throw error;

    return programs.map((program) => ({
      ...program,
      objective_count: program.program_objectives?.length || 0,
    }));
  }

  /**
   * Creates interviews for a program phase - Server-side implementation
   * This is the most complex operation with 6+ DB transactions
   */
  async createInterviews(
    programId: number,
    phaseId: number,
    isPublic: boolean = false,
    roleIds: number[] = [],
    contactIds: number[],
    interviewType: "onsite" | "presite",
    createdBy: string
  ): Promise<{ success: boolean; message: string; interviewsCreated: number }> {
    // Validate data
    if (roleIds.length === 0) {
      throw new Error("At least one role must be selected");
    }

    if (isPublic && contactIds.length === 0) {
      throw new Error(
        "At least one contact must be selected for public interviews"
      );
    }

    // Step 1: Fetch program data
    const { data: program, error: programError } = await this.supabase
      .from("programs")
      .select("company_id, onsite_questionnaire_id, presite_questionnaire_id")
      .eq("id", programId)
      .single();

    if (programError) throw programError;

    // Step 2: Validate phase exists
    const { error: phaseError } = await this.supabase
      .from("program_phases")
      .select("id")
      .eq("id", phaseId)
      .single();

    if (phaseError) throw phaseError;

    // Step 3: Determine questionnaire based on interview type
    const questionnaireId =
      interviewType === "onsite"
        ? program.onsite_questionnaire_id
        : program.presite_questionnaire_id;

    if (!questionnaireId) {
      throw new Error(
        `No ${interviewType} questionnaire configured for this program`
      );
    }

    // Step 4: Get questionnaire structure to extract question IDs
    const { data: questionnaire, error: questionnaireError } =
      await this.supabase
        .from("questionnaires")
        .select(
          `
        id,
        questionnaire_sections(
          id,
          questionnaire_steps(
            id,
            questionnaire_questions(id)
          )
        )
      `
        )
        .eq("id", questionnaireId)
        .eq("questionnaire_sections.is_deleted", false)
        .eq("questionnaire_sections.questionnaire_steps.is_deleted", false)
        .eq(
          "questionnaire_sections.questionnaire_steps.questionnaire_questions.is_deleted",
          false
        )
        .single();

    if (questionnaireError) throw questionnaireError;

    // Step 5: Extract all question IDs
    const questionIds: number[] = [];
    if (questionnaire?.questionnaire_sections) {
      for (const section of questionnaire.questionnaire_sections) {
        for (const step of section.questionnaire_steps) {
          for (const question of step.questionnaire_questions) {
            questionIds.push(question.id);
          }
        }
      }
    }

    if (questionIds.length === 0) {
      throw new Error("No questions found in questionnaire");
    }

    // Step 6: Create interview(s) based on type
    let interviewsCreated = 0;

    if (isPublic) {
      // Create individual interview for each contact
      for (const contactId of contactIds) {
        await this.createSingleProgramInterview({
          programId,
          phaseId,
          questionnaireId,
          contactId,
          roleIds,
          questionIds,
          companyId: program.company_id,
          isPublic: true,
          createdBy,
          interviewType,
        });
        interviewsCreated++;
      }
    } else {
      // Create single group interview
      await this.createSingleProgramInterview({
        programId,
        phaseId,
        questionnaireId,
        contactId: null,
        roleIds,
        questionIds,
        companyId: program.company_id,
        isPublic: false,
        createdBy,
        interviewType,
      });
      interviewsCreated = 1;
    }

    return {
      success: true,
      message: `Successfully created ${interviewsCreated} ${interviewType} interview(s)`,
      interviewsCreated,
    };
  }

  /**
   * Helper method to create a single program interview with full transaction logic
   */
  private async createSingleProgramInterview(params: {
    programId: number;
    phaseId: number;
    questionnaireId: number;
    contactId: number | null;
    roleIds: number[];
    questionIds: number[];
    companyId: string;
    isPublic: boolean;
    createdBy: string;
    interviewType: "onsite" | "presite";
  }): Promise<void> {
    const {
      programId,
      phaseId,
      questionnaireId,
      contactId,
      questionIds,
      companyId,
      isPublic,
      createdBy,
      interviewType,
    } = params;

    // roleIds might be modified, so keep as let
    let { roleIds } = params;

    // Validation: Public individual interviews should only have one role
    if (isPublic && contactId && roleIds.length > 1) {
      console.warn(
        `Public individual interview created with ${roleIds.length} roles for contact ${contactId}. Using only the first role to ensure single role assignment.`
      );
      roleIds = [roleIds[0]];
    }

    // Generate interview name
    const interviewName =
      isPublic && contactId
        ? `${interviewType} Interview - Contact ${contactId}`
        : `${interviewType} Interview - Group`;

    // Generate access code for public interviews
    const accessCode = isPublic
      ? Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15)
      : null;

    // Step 1: Create the interview
    const { data: interview, error: interviewError } = await this.supabase
      .from("interviews")
      .insert([
        {
          name: interviewName,
          program_id: programId,
          program_phase_id: phaseId,
          questionnaire_id: questionnaireId,
          interview_contact_id: contactId,
          company_id: companyId,
          is_public: isPublic,
          enabled: true,
          access_code: accessCode,
          status: "pending",
          created_by: createdBy,
        },
      ])
      .select()
      .single();

    if (interviewError) throw interviewError;

    try {
      // Step 2: Create interview-level role associations
      if (roleIds.length > 0) {
        const interviewRoleAssociations = roleIds.map((roleId) => ({
          interview_id: interview.id,
          role_id: roleId,
          company_id: companyId,
          created_by: createdBy,
        }));

        const { error: interviewRoleError } = await this.supabase
          .from("interview_roles")
          .insert(interviewRoleAssociations);

        if (interviewRoleError) {
          // Clean up the interview if role association fails
          await this.supabase
            .from("interviews")
            .delete()
            .eq("id", interview.id);
          throw interviewRoleError;
        }
      }

      // Step 3: Create interview responses for all questions
      if (questionIds.length > 0) {
        const responseData = questionIds.map((questionId) => ({
          interview_id: interview.id,
          questionnaire_question_id: questionId,
          rating_score: null,
          comments: null,
          answered_at: null,
          is_applicable: true, // Assume all questions are applicable for program interviews
          company_id: companyId,
          created_by: createdBy,
        }));

        const { data: createdResponses, error: responsesError } =
          await this.supabase
            .from("interview_responses")
            .insert(responseData)
            .select("id");

        if (responsesError) {
          // Clean up the interview if response creation fails
          await this.supabase
            .from("interviews")
            .delete()
            .eq("id", interview.id);
          throw responsesError;
        }

        // Step 4: For public interviews with single role, pre-populate response role associations
        if (isPublic && roleIds.length === 1 && createdResponses) {
          const responseRoleAssociations = createdResponses.map((response) => ({
            interview_response_id: response.id,
            role_id: roleIds[0],
            company_id: companyId,
            interview_id: interview.id,
            created_by: createdBy,
          }));

          const { error: responseRoleError } = await this.supabase
            .from("interview_response_roles")
            .insert(responseRoleAssociations);

          if (responseRoleError) {
            // Clean up everything if response role association fails
            await this.supabase
              .from("interviews")
              .delete()
              .eq("id", interview.id);
            throw responseRoleError;
          }
        }
      }
    } catch (error) {
      // Ensure interview is cleaned up on any error
      try {
        await this.supabase.from("interviews").delete().eq("id", interview.id);
      } catch (cleanupError) {
        console.error("Failed to cleanup interview after error:", cleanupError);
      }
      throw error;
    }
  }

  // ======= Program Objectives Methods =======

  async getObjectivesByProgramId(programId: number) {
    const { data: objectives, error } = await this.supabase
      .from("program_objectives")
      .select("*")
      .eq("program_id", programId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return objectives || [];
  }

  async createObjective(data: {
    name: string;
    description?: string;
    program_id: number;
  }) {
    // Get company_id from the program
    const { data: program, error: programError } = await this.supabase
      .from("programs")
      .select("company_id")
      .eq("id", data.program_id)
      .single();

    if (programError) throw programError;
    if (!program) throw new Error("Program not found");

    const { data: objective, error } = await this.supabase
      .from("program_objectives")
      .insert({
        name: data.name,
        description: data.description,
        program_id: data.program_id,
        company_id: program.company_id,
      })
      .select()
      .single();

    if (error) throw error;
    return objective;
  }

  async updateObjective(
    id: number,
    data: {
      name?: string;
      description?: string;
    }
  ) {
    const { data: objective, error } = await this.supabase
      .from("program_objectives")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("is_deleted", false)
      .select()
      .single();

    if (error) throw error;
    return objective;
  }

  async deleteObjective(id: number): Promise<void> {
    const { error } = await this.supabase
      .from("program_objectives")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;
  }

  async getObjectiveCount(programId: number): Promise<number> {
    const { count, error} = await this.supabase
      .from("program_objectives")
      .select("*", { count: "exact", head: true })
      .eq("program_id", programId)
      .eq("is_deleted", false);

    if (error) throw error;
    return count || 0;
  }
}
