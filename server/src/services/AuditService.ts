import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../types/database";

/**
 * Format action verb for better readability
 * @param action
 * @returns
 */
function formatAction(action: string): string {
  switch (action) {
    case "INSERT":
      return "Created";
    case "UPDATE":
      return "Updated";
    case "DELETE":
      return "Deleted";
    default:
      return action;
  }
}

/**
 * Convert table name from snake_case to space separated
 * Remove pluralization for better readability
 * @param tableName
 * @returns
 */
function formatTableName(tableName: string): string {
  // Convert snake_case to space separated and remove trailing 's' or 'ies'
  return tableName
    .replaceAll("_", " ")
    .replace(/(ies|s)$/, (match) => (match === "ies" ? "y" : ""));
}

export class AuditService {
  private supabase: SupabaseClient<Database>;

  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase;
  }

  async getAuditLogs(companyId: string) {
    const { data, error } = await this.supabase
      .from("audit_logs")
      .select(
        "id, user_name, user_email, action, table_name, created_at, changed_fields"
      )
      .eq("company_id", companyId)
      .not("table_name", "in", "(profiles,dashboards,feedback)")
      .order("created_at", { ascending: false })
      .limit(1000);

    if (error) {
      throw new Error(`Error fetching audit logs: ${error.message}`);
    }

    if (!data) {
      return [];
    }

    // Simplify output
    const response = data.map((log) => ({
      id: log.id,
      user: {
        full_name: log.user_name || "Unknown",
        email: log.user_email || "Unknown",
      },
      created_at: log.created_at,
      changed_fields: log.changed_fields,
      message: `${formatAction(log.action)} ${formatTableName(log.table_name)}`,
    }));

    return response;
  }

  async downloadAuditLogs(userId: string, companyId: string): Promise<string> {
    let query = this.supabase
      .from("audit_logs")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    // Check if user is an admin
    const { data: userProfile, error: profileError } = await this.supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", userId)
      .single();

    if (profileError) {
      throw new Error(`Error fetching user profile: ${profileError.message}`);
    }

    if (!userProfile?.is_admin) {
      // If not admin, hide tables
      query = query.not("table_name", "in", "(profiles,dashboards,feedback)");
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching audit logs: ${error.message}`);
    }

    // Generate CSV
    const headers = [
      "Timestamp",
      "User Name",
      "User Email",
      "Action",
      "Table Name",
      "Record Name",
      "Changed Fields",
    ];

    const rows = data.map((log) => {
      const timestamp = new Date(log.created_at || "").toISOString();
      const userName = log.user_name || "Unknown";
      const userEmail = log.user_email || "";
      const action = log.action;
      const tableName = log.table_name;
      const recordName = log.record_display_name || "";
      const changedFields = log.changed_fields?.join(", ") || "";

      return [
        timestamp,
        userName,
        userEmail,
        action,
        tableName,
        recordName,
        changedFields,
      ]
        .map((field) => {
          // Escape double quotes and wrap in quotes if contains comma or quote
          const stringField = String(field);
          if (stringField.includes(",") || stringField.includes('"')) {
            return `"${stringField.replace(/"/g, '""')}"`;
          }
          return stringField;
        })
        .join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");
    return csv;
  }
}
