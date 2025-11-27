import { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { Database } from "../types/database";
import {
  DashboardSchema,
  CreateDashboardBodySchema,
  UpdateDashboardBodySchema,
} from "../schemas/dashboard";

type DashboardRow = Database["public"]["Tables"]["dashboards"]["Row"];
type DashboardInsert = Database["public"]["Tables"]["dashboards"]["Insert"];
type DashboardUpdate = Database["public"]["Tables"]["dashboards"]["Update"];

// Infer types from Zod schemas instead of using 'any'
export type CreateDashboardInput = z.infer<typeof CreateDashboardBodySchema>;
export type UpdateDashboardInput = z.infer<typeof UpdateDashboardBodySchema>;
export type Dashboard = z.infer<typeof DashboardSchema>;

export class DashboardService {
  private supabase: SupabaseClient<Database>;
  private userId: string;

  constructor(supabaseClient: SupabaseClient<Database>, userId: string) {
    this.supabase = supabaseClient;
    this.userId = userId;
  }

  /**
   * Parse and validate a DashboardRow from the database into a typed Dashboard object
   * This ensures the Json fields (widgets, layout) are properly typed arrays
   */
  private parseDashboard(row: Partial<DashboardRow>): Dashboard {
    return DashboardSchema.parse(row);
  }

  async getDashboards(companyId: string): Promise<Dashboard[]> {
    const { data, error } = await this.supabase
      .from("dashboards")
      .select("id,name,created_at,updated_at,widgets,layout")
      .eq("company_id", companyId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return (data || []).map((row) => this.parseDashboard(row));
  }

  async getDashboardById(dashboardId: number): Promise<Dashboard | null> {
    const { data, error } = await this.supabase
      .from("dashboards")
      .select("*")
      .eq("id", dashboardId)
      .eq("is_deleted", false)
      .maybeSingle();

    if (error) throw error;

    return data ? this.parseDashboard(data) : null;
  }

  async createDashboard(
    companyId: string,
    input: CreateDashboardInput
  ): Promise<Dashboard> {
    const dashboardData: DashboardInsert = {
      name: input.name,
      company_id: companyId,
      layout: input.layout,
      widgets: input.widgets,
      created_by: this.userId,
    };

    const { data, error } = await this.supabase
      .from("dashboards")
      .insert(dashboardData)
      .select()
      .single();

    if (error) throw error;

    return this.parseDashboard(data);
  }

  async updateDashboard(
    dashboardId: number,
    updates: UpdateDashboardInput
  ): Promise<Dashboard> {
    const updateData: DashboardUpdate = {
      updated_at: new Date().toISOString(),
    };

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.layout !== undefined) updateData.layout = updates.layout;
    if (updates.widgets !== undefined) updateData.widgets = updates.widgets;

    const { data, error } = await this.supabase
      .from("dashboards")
      .update(updateData)
      .eq("id", dashboardId)
      .select()
      .single();

    if (error) throw error;

    return this.parseDashboard(data);
  }

  async deleteDashboard(dashboardId: number): Promise<void> {
    const { error } = await this.supabase
      .from("dashboards")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", dashboardId);

    if (error) throw error;
  }
}
