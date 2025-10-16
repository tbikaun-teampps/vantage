import { createClient } from "./client";
import type {
  Program,
  CreateProgramFormData,
  ProgramWithRelations,
  ProgramPhase,
} from "@/types/program";
import type { ProgramUpdateFormData } from "@/pages/programs/detail/components/overview-tab/program-update-schema";
// import { getCurrentUserId } from "@/lib/auth/auth-utils";

export class ProgramService {
  private supabase = createClient();

  async getPrograms(companyId?: string): Promise<ProgramWithRelations[]> {
    let query = this.supabase
      .from("programs")
      .select(
        `
        *,
        company:companies!inner(id, name),
        program_objectives(id),
        onsite_questionnaire:questionnaires(id, name, description),
        presite_questionnaire:questionnaires(id, name, description),
        program_metrics(id)
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

    return programs.map((program: any) => ({
      ...program,
      objective_count: program.program_objectives?.length || 0,
      metrics_count: program.program_metrics?.length || 0,
    }));
  }

  async getProgramById(id: number): Promise<ProgramWithRelations | null> {
    const { data: program, error } = await this.supabase
      .from("programs")
      .select(
        `
        *,
        company:companies!inner(id, name),
        onsite_questionnaire:questionnaires(id, name, description),
        presite_questionnaire:questionnaires(id, name, description),
        program_objectives(
          id,
          name,
          description,
          created_at
        ),
        phases:program_phases(
          id,
          name,
          status,
          notes,
          sequence_number,
          planned_start_date,
          actual_start_date,
          planned_end_date,
          actual_end_date,
          locked_for_analysis_at,
          created_at,
          updated_at
        )
      `
      )
      .eq("id", id)
      .eq("is_deleted", false)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw error;
    }

    return {
      ...program,
      objectives: program.program_objectives || [],
      objective_count: program.program_objectives?.length || 0,
      phases: program.phases || [],
    };
  }

  async createProgram(formData: CreateProgramFormData): Promise<Program> {

    // const currentUserId = await getCurrentUserId();

    // Create the program with default values
    const { data: program, error: programError } = await this.supabase
      .from("programs")
      .insert([
        {
          name: formData.name,
          description: formData.description || null,
          company_id: formData.company_id,
          // created_by: currentUserId,
          is_deleted: false,
          is_demo: false,
          onsite_questionnaire_id: null,
          presite_questionnaire_id: null,
          status: "draft", // Default status
        },
      ])
      .select()
      .single();

    if (programError) throw programError;

    // Create the first program_phase
    const { error: phaseError } = await this.supabase
      .from("program_phases")
      .insert([
        {
          program_id: program.id,
          status: "scheduled",
          company_id: formData.company_id,
        },
      ])
      .select()
      .single();

    if (phaseError) throw phaseError;

    return program;
  }

  async updateProgram(
    programId: number,
    updateData: ProgramUpdateFormData
  ): Promise<Program> {

    const { data: program, error } = await this.supabase
      .from("programs")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", programId)
      .select()
      .single();

    if (error) throw error;
    return program;
  }

  async updateProgramOnsiteQuestionnaire(
    programId: number,
    questionnaireId: number | null
  ): Promise<void> {
    const { error } = await this.supabase
      .from("programs")
      .update({
        onsite_questionnaire_id: questionnaireId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", programId);

    if (error) throw error;
  }

  async updateProgramPresiteQuestionnaire(
    programId: number,
    questionnaireId: number | null
  ): Promise<void> {

    const { error } = await this.supabase
      .from("programs")
      .update({
        presite_questionnaire_id: questionnaireId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", programId);

    if (error) throw error;
  }

  async deleteProgram(id: number): Promise<void> {
    const { error } = await this.supabase
      .from("programs")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;
  }

  async getCurrentProgramPhase(
    programId: number
  ): Promise<ProgramPhase | null> {
    // Filter phases to return the one with the lowest sequence_number that is not completed
    // e.g. does not have a locked_for_analysis_at timestamp
    // and has a status of scheduled or in_progress
    const { data: phase, error } = await this.supabase
      .from("program_phases")
      .select("*")
      .eq("program_id", programId)
      .is("locked_for_analysis_at", null)
      .in("status", ["scheduled", "in_progress"])
      .order("sequence_number", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw error;
    }

    return phase;
  }

  async updatePhase(
    phaseId: number,
    updateData: {
      name?: string | null;
      status?: "scheduled" | "in_progress" | "completed" | "archived";
      notes?: string | null;
      planned_start_date?: string | null;
      actual_start_date?: string | null;
    }
  ): Promise<ProgramPhase> {

    const { data: phase, error } = await this.supabase
      .from("program_phases")
      .update(updateData)
      .eq("id", phaseId)
      .select()
      .single();

    if (error) throw error;

    return phase;
  }

  async createPhase(
    programId: number,
    phaseData: {
      name?: string | null;
      sequence_number: number;
      activate?: boolean;
    }
  ): Promise<ProgramPhase> {

    // const currentUserId = await getCurrentUserId();

    // Get program company_id
    const { data: program, error: programError } = await this.supabase
      .from("programs")
      .select("company_id")
      .eq("id", programId)
      .single();

    if (programError) throw programError;

    // Create the new phase
    const { data: phase, error: phaseError } = await this.supabase
      .from("program_phases")
      .insert({
        program_id: programId,
        company_id: program.company_id,
        name: phaseData.name,
        sequence_number: phaseData.sequence_number,
        status: "scheduled",
        // created_by: currentUserId,
      })
      .select()
      .single();

    if (phaseError) throw phaseError;

    // If activate flag is set, update program's current_sequence_number
    if (phaseData.activate) {
      const { error: programUpdateError } = await this.supabase
        .from("programs")
        .update({
          current_sequence_number: phaseData.sequence_number,
          updated_at: new Date().toISOString(),
        })
        .eq("id", programId);

      if (programUpdateError) throw programUpdateError;
    }

    return phase;
  }

  async deletePhase(phaseId: number): Promise<void> {
    // Get phase details before deletion to check if it's the current active phase
    const { data: phase, error: phaseError } = await this.supabase
      .from("program_phases")
      .select("program_id, sequence_number")
      .eq("id", phaseId)
      .single();

    if (phaseError) throw phaseError;

    // Check if there are other phases remaining
    const { data: remainingPhases, error: countError } = await this.supabase
      .from("program_phases")
      .select("id")
      .eq("program_id", phase.program_id)
      .neq("id", phaseId);

    if (countError) throw countError;

    if (remainingPhases.length === 0) {
      throw new Error("Cannot delete the only remaining phase");
    }

    // Get program's current sequence number to check if we're deleting the active phase
    const { data: program, error: programError } = await this.supabase
      .from("programs")
      .select("current_sequence_number")
      .eq("id", phase.program_id)
      .single();

    if (programError) throw programError;

    // Delete the phase (cascade will handle dependent records)
    const { error: deleteError } = await this.supabase
      .from("program_phases")
      .delete()
      .eq("id", phaseId);

    if (deleteError) throw deleteError;

    // If we deleted the current active phase, reset to sequence 1
    if (program.current_sequence_number === phase.sequence_number) {
      const { error: resetError } = await this.supabase
        .from("programs")
        .update({
          current_sequence_number: 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", phase.program_id);

      if (resetError) throw resetError;
    }
  }

  /**
   * Creates interviews for a program phase.
   *
   */
  async createInterviews(
    programId: number,
    phaseId: number,
    isPublic: boolean = false,
    roleIds: number[] = [],
    contactIds: number[],
    interviewType: "onsite" | "presite"
  ): Promise<void> {

    // Validate data
    if (roleIds.length === 0) {
      throw new Error("At least one role must be selected");
    }

    if (isPublic && contactIds.length === 0) {
      throw new Error(
        "At least one contact must be selected for public interviews"
      );
    }

    // Fetch program
    const { data: program, error: programError } = await this.supabase
      .from("programs")
      .select("company_id, onsite_questionnaire_id, presite_questionnaire_id")
      .eq("id", programId)
      .single();

    if (programError) throw programError;

    // Fetch phase
    const { data: phase, error: phaseError } = await this.supabase
      .from("program_phases")
      .select("id")
      .eq("id", phaseId)
      .single();

    if (phaseError) throw phaseError;

    // Determine questionnaire based on interview type
    const questionnaireId = interviewType === "onsite" 
      ? program.onsite_questionnaire_id 
      : program.presite_questionnaire_id;

    if (!questionnaireId) {
      throw new Error(`No ${interviewType} questionnaire configured for this program`);
    }

    // Get questionnaire structure to extract question IDs
    const { data: questionnaire, error: questionnaireError } = await this.supabase
      .from("questionnaires")
      .select(`
        id,
        questionnaire_sections(
          id,
          questionnaire_steps(
            id,
            questionnaire_questions(id)
          )
        )
      `)
      .eq("id", questionnaireId)
      .eq("questionnaire_sections.is_deleted", false)
      .eq("questionnaire_sections.questionnaire_steps.is_deleted", false)
      .eq("questionnaire_sections.questionnaire_steps.questionnaire_questions.is_deleted", false)
      .single();

    if (questionnaireError) throw questionnaireError;

    // Extract all question IDs
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

    // const currentUserId = await getCurrentUserId();

    // Create interview(s)
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
          // createdBy: currentUserId,
          interviewType
        });
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
        // createdBy: currentUserId,
        interviewType
      });
    }
  }

  /**
   * Helper method to create a single program interview
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
    let {
      programId,
      phaseId,
      questionnaireId,
      contactId,
      roleIds,
      questionIds,
      companyId,
      isPublic,
      createdBy,
      interviewType
    } = params;

    // Validation: Public individual interviews should only have one role
    if (isPublic && contactId && roleIds.length > 1) {
      console.warn(
        `Public individual interview created with ${roleIds.length} roles for contact ${contactId}. Using only the first role to ensure single role assignment.`
      );
      // For public individual interviews, only use the first role
      roleIds = [roleIds[0]];
    }

    // Generate interview name
    const interviewName = isPublic && contactId
      ? `${interviewType} Interview - Contact ${contactId}`
      : `${interviewType} Interview - Group`;

    // Generate access code for public interviews
    const accessCode = isPublic 
      ? Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      : null;

    // Create the interview
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

    // Create interview-level role associations
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
        await this.supabase.from("interviews").delete().eq("id", interview.id);
        throw interviewRoleError;
      }
    }

    // Create interview responses for all questions
    if (questionIds.length > 0) {
      const responseData = questionIds.map((questionId) => ({
        interview_id: interview.id,
        questionnaire_question_id: questionId,
        rating_score: null,
        comments: null,
        answered_at: null,
        is_applicable: true, // We'll assume all questions are applicable for program interviews
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
        await this.supabase.from("interviews").delete().eq("id", interview.id);
        throw responsesError;
      }

      // For public interviews with single role, pre-populate response role associations
      if (
        isPublic &&
        roleIds.length === 1 &&
        createdResponses
      ) {
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
  }
}

export const programService = new ProgramService();
