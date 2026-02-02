// import { createClient } from "./client";
// import type { Tables, TablesInsert, TablesUpdate } from "@/types/database";
// // import { getCurrentUserId } from "@/lib/auth/auth-utils";

// export type MetricDefinition = Tables<"metric_definitions">;
// export type CreateMetricDefinitionData = TablesInsert<"metric_definitions">;
// export type UpdateMetricDefinitionData = TablesUpdate<"metric_definitions">;

// export type ProgramMetric = Tables<"program_metrics">;
// export type CreateProgramMetricData = TablesInsert<"program_metrics">;

// export type CalculatedMetric = Tables<"calculated_metrics">;
// export type CreateCalculatedMetricData = TablesInsert<"calculated_metrics">;

// export type CalculatedMetricWithDefinition = CalculatedMetric & {
//   metric_definition: {
//     id: number;
//     name: string;
//     description: string | null;
//     calculation_type: string | null;
//     required_csv_columns: string[] | null;
//     provider: string | null;
//   };
// };

// export type MetricDefinitionWithProgramCount = MetricDefinition & {
//   program_count: number;
// };

// export class MetricsService {
//   private supabase = createClient();

//   // Metric Definitions CRUD
//   async getMetricDefinitions(): Promise<MetricDefinitionWithProgramCount[]> {
//     const { data: metrics, error } = await this.supabase
//       .from("metric_definitions")
//       .select(
//         `
//         *,
//         program_metrics(id)
//       `
//       )
//       .order("name", { ascending: true });

//     if (error) throw error;

//     return metrics.map(
//       (metric: MetricDefinition & { program_metrics: { id: number }[] }) => ({
//         ...metric,
//         program_count: metric.program_metrics?.length || 0,
//       })
//     );
//   }

//   async getMetricDefinitionById(id: number): Promise<MetricDefinition | null> {
//     const { data: metric, error } = await this.supabase
//       .from("metric_definitions")
//       .select("*")
//       .eq("id", id)
//       .single();

//     if (error) {
//       if (error.code === "PGRST116") return null; // Not found
//       throw error;
//     }

//     return metric;
//   }

//   // Program Metrics CRUD
//   async getProgramMetrics(programId?: number): Promise<ProgramMetric[]> {
//     let query = this.supabase
//       .from("program_metrics")
//       .select("*")
//       .order("created_at", { ascending: false });

//     if (programId) {
//       query = query.eq("program_id", programId);
//     }

//     const { data: metrics, error } = await query;

//     if (error) throw error;
//     return metrics || [];
//   }

//   async getProgramMetricsWithDefinitions(programId: number) {
//     const { data: metrics, error } = await this.supabase
//       .from("program_metrics")
//       .select(
//         `
//         *,
//         metric_definition:metric_definitions!inner(
//           id,
//           name,
//           description,
//           calculation_type,
//           required_csv_columns,
//           provider
//         )
//       `
//       )
//       .eq("program_id", programId)
//       .order("created_at", { ascending: false });

//     if (error) throw error;
//     return metrics || [];
//   }

//   async addMetricToProgram(
//     programId: number,
//     metricId: number
//   ): Promise<ProgramMetric> {

//     // const currentUserId = await getCurrentUserId();

//     // Check if metric is already added to this program
//     const { data: existing, error: checkError } = await this.supabase
//       .from("program_metrics")
//       .select("id")
//       .eq("program_id", programId)
//       .eq("metric_id", metricId)
//       .single();

//     if (checkError && checkError.code !== "PGRST116") {
//       throw checkError;
//     }

//     if (existing) {
//       throw new Error("Metric is already added to this program");
//     }

//     const { data: programMetric, error } = await this.supabase
//       .from("program_metrics")
//       .insert([
//         {
//           program_id: programId,
//           metric_id: metricId,
//           // created_by: currentUserId,
//         },
//       ])
//       .select()
//       .single();

//     if (error) throw error;
//     return programMetric;
//   }

//   async removeMetricFromProgram(
//     programId: number,
//     metricId: number
//   ): Promise<void> {

//     const { error } = await this.supabase
//       .from("program_metrics")
//       .delete()
//       .eq("program_id", programId)
//       .eq("metric_id", metricId);

//     if (error) throw error;
//   }

//   // Calculated Metrics CRUD
//   async getCalculatedMetrics(
//     programPhaseId?: number,
//     companyId?: string
//   ): Promise<CalculatedMetricWithDefinition[]> {
//     let query = this.supabase
//       .from("calculated_metrics")
//       .select(`
//         *,
//         metric_definition:metric_definitions!metric_id(
//           id,
//           name,
//           description,
//           calculation_type,
//           required_csv_columns,
//           provider
//         )
//       `)
//       .order("created_at", { ascending: false });

//     if (programPhaseId) {
//       query = query.eq("program_phase_id", programPhaseId);
//     }

//     if (companyId) {
//       query = query.eq("company_id", companyId);
//     }

//     const { data: metrics, error } = await query;

//     if (error) throw error;
//     return metrics || [];
//   }

//   async createCalculatedMetric(
//     formData: CreateCalculatedMetricData
//   ): Promise<CalculatedMetric> {

//     // const currentUserId = await getCurrentUserId();

//     const { data: metric, error } = await this.supabase
//       .from("calculated_metrics")
//       .insert([
//         {
//           ...formData,
//           // created_by: currentUserId,
//         },
//       ])
//       .select()
//       .single();

//     if (error) throw error;
//     return metric;
//   }

//   async updateCalculatedMetric(
//     id: number,
//     updateData: Partial<CalculatedMetric>
//   ): Promise<CalculatedMetric> {

//     const { data: metric, error } = await this.supabase
//       .from("calculated_metrics")
//       .update({
//         ...updateData,
//         updated_at: new Date().toISOString(),
//       })
//       .eq("id", id)
//       .select()
//       .single();

//     if (error) throw error;
//     return metric;
//   }

//   async deleteCalculatedMetric(id: number): Promise<void> {

//     const { error } = await this.supabase
//       .from("calculated_metrics")
//       .delete()
//       .eq("id", id);

//     if (error) throw error;
//   }

//   // Utility methods
//   async getAvailableMetricsForProgram(
//     programId: number
//   ): Promise<MetricDefinition[]> {
//     // Get metrics that are NOT already added to this program
//     const { data: programMetricIds, error: programError } = await this.supabase
//       .from("program_metrics")
//       .select("metric_id")
//       .eq("program_id", programId);

//     if (programError) throw programError;

//     const usedMetricIds = programMetricIds?.map((pm) => pm.metric_id) || [];

//     let query = this.supabase
//       .from("metric_definitions")
//       .select("*")
//       .order("name", { ascending: true });

//     if (usedMetricIds.length > 0) {
//       query = query.not("id", "in", `(${usedMetricIds.join(",")})`);
//     }

//     const { data: availableMetrics, error } = await query;

//     if (error) throw error;
//     return availableMetrics || [];
//   }
// }

// export const metricsService = new MetricsService();
