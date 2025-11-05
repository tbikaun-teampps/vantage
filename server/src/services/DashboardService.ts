import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../types/database";

type DashboardRow = Database["public"]["Tables"]["dashboards"]["Row"];
type DashboardInsert = Database["public"]["Tables"]["dashboards"]["Insert"];
type DashboardUpdate = Database["public"]["Tables"]["dashboards"]["Update"];

export interface CreateDashboardInput {
  name: string;
  widgets: any[]; // JSON structure for widget configurations
  layout: any[]; // JSON structure for react-grid-layout
}

export interface UpdateDashboardInput {
  name?: string;
  widgets?: any[];
  layout?: any[];
}

export class DashboardService {
  private supabase: SupabaseClient<Database>;
  private userId: string;

  constructor(supabaseClient: SupabaseClient<Database>, userId: string) {
    this.supabase = supabaseClient;
    this.userId = userId;
  }

  async getDashboards(companyId: string): Promise<DashboardRow[]> {
    const { data, error } = await this.supabase
      .from("dashboards")
      .select("*")
      .eq("company_id", companyId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return data || [];
  }

  async getDashboardById(dashboardId: number): Promise<DashboardRow | null> {
    const { data, error } = await this.supabase
      .from("dashboards")
      .select("*")
      .eq("id", dashboardId)
      .eq("is_deleted", false)
      .maybeSingle();

    if (error) throw error;

    return data;
  }

  async createDashboard(
    companyId: string,
    input: CreateDashboardInput
  ): Promise<DashboardRow> {
    const dashboardData: DashboardInsert = {
      name: input.name,
      company_id: companyId,
      layout: input.layout as any,
      widgets: input.widgets as any,
      created_by: this.userId,
    };

    const { data, error } = await this.supabase
      .from("dashboards")
      .insert(dashboardData)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async updateDashboard(
    dashboardId: number,
    updates: UpdateDashboardInput
  ): Promise<DashboardRow> {
    const updateData: DashboardUpdate = {
      updated_at: new Date().toISOString(),
    };

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.layout !== undefined) updateData.layout = updates.layout as any;
    if (updates.widgets !== undefined)
      updateData.widgets = updates.widgets as any;

    const { data, error } = await this.supabase
      .from("dashboards")
      .update(updateData)
      .eq("id", dashboardId)
      .select()
      .single();

    if (error) throw error;

    return data;
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
