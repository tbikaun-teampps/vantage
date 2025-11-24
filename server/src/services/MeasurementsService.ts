import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../types/database";

export class MeasurementsService {
  private supabase: SupabaseClient<Database>;

  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase;
  }

  async getMeasurementDefinitions({
    includeInstanceCounts = false,
    filters = { assessmentId: null, programPhaseId: null },
  }: {
    includeInstanceCounts?: boolean;
    filters?: { assessmentId: number | null; programPhaseId: number | null };
  } = {}) {
    const { data, error } = await this.supabase
      .from("measurement_definitions")
      .select();

    if (error) {
      throw new Error(
        `Error fetching measurement definitions: ${error.message}`
      );
    }

    if (includeInstanceCounts && filters.assessmentId) {
      // Fetch measurement definitions with instance counts for the given assessment
      const { data, error } = await this.supabase
        .from("measurements_calculated")
        .select("id")
        .eq("assessment_id", filters.assessmentId);
    }
    if (includeInstanceCounts && filters.programPhaseId) {
      // Fetch measurement definitions with instance counts for the given program phase

      const { data: assessments, error: assessmentsError } = await this.supabase
        .from("assessments")
        .select("id")
        .eq("program_phase_id", filters.programPhaseId);

      if (assessmentsError) {
        throw new Error(
          `Error fetching assessments for program phase: ${assessmentsError.message}`
        );
      }

      const assessmentIds = assessments?.map((a) => a.id) || [];

      const { data, error } = await this.supabase
        .from("measurements_calculated")
        .select("id")
        .in("assessment_id", assessmentIds);
    }

    return data;
  }
}
