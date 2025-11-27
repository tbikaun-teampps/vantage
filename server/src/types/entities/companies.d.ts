import { Database } from "../database";

export type Company = Database["public"]["Tables"]["companies"]["Row"];
export type Contact = Database["public"]["Tables"]["contacts"]["Row"];
export type BusinessUnit =
  Database["public"]["Tables"]["business_units"]["Row"];
export type Region = Database["public"]["Tables"]["regions"]["Row"];
export type Site = Database["public"]["Tables"]["sites"]["Row"];
export type AssetGroup = Database["public"]["Tables"]["asset_groups"]["Row"];
export type WorkGroup = Database["public"]["Tables"]["work_groups"]["Row"];
export type Role = Database["public"]["Tables"]["roles"]["Row"];

export type UserCompanyRole =
  Database["public"]["Tables"]["user_companies"]["Row"]["role"];

export type RoleLevel = Database["public"]["Enums"]['role_levels']

export type CreateCompanyData = Pick<
  Database["public"]["Tables"]["companies"]["Insert"],
  "name" | "code" | "description"
>;

export type UpdateCompanyData = Pick<
  Database["public"]["Tables"]["companies"]["Update"],
  "name" | "code" | "description" | "icon_url"
>;

export interface CompanyBranding {
  primary: string | null;
  secondary: string | null;
  accent: string | null;
}

export interface UpdateBrandingData {
  primary?: string;
  secondary?: string;
  accent?: string;
}

export type CompanyWithRole = Company & {
  role: Database["public"]["Tables"]["user_companies"]["Row"]["role"];
};

export type TeamMember = {
  id: number;
  user_id: string;
  company_id: string;
  role: Database["public"]["Tables"]["user_companies"]["Row"]["role"];
  created_at: string;
  updated_at: string;
  is_creator: boolean;
  user: {
    id: string;
    email: string;
    full_name: string | null;
  };
  is_owner: boolean;
};

export interface AddTeamMemberData {
  email: string;
  role: Database["public"]["Tables"]["user_companies"]["Row"]["role"];
}

export interface UpdateTeamMemberData {
  role: Database["public"]["Tables"]["user_companies"]["Row"]["role"];
}

export interface CreateContactData {
  full_name: string;
  email: string;
  phone?: string;
  title?: string;
}

export interface UpdateContactData {
  full_name?: string;
  email?: string;
  phone?: string;
  title?: string;
}

export type EntityType =
  | "business-units"
  | "regions"
  | "sites"
  | "asset-groups"
  | "work-groups"
  | "roles";
export type ContactEntityType =
  | "company"
  | "business-unit"
  | "region"
  | "site"
  | "asset-group"
  | "work-group"
  | "role";

export interface CompanyTreeRoleNode {
  id: number;
  code: string | null;
  level: string | null;
  reports_to_role_id: number | null;
  reporting_roles: CompanyTreeRoleNode[];
  name: string;
  description: string | null;
  shared_role_id: number;
  type: "role";
}

export interface CompanyTree {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  business_units: {
    id: number;
    name: string;
    code: string | null;
    description: string | null;
    regions: {
      id: number;
      name: string;
      code: string | null;
      description: string | null;
      sites: {
        id: number;
        name: string;
        code: string | null;
        description: string | null;
        lat: number | null;
        lng: number | null;
        asset_groups: {
          id: number;
          name: string;
          code: string | null;
          description: string | null;
          work_groups: {
            id: number;
            name: string;
            code: string | null;
            description: string | null;
            roles: CompanyTreeRoleNode[] | null;
          }[];
        }[];
      }[];
    }[];
  }[];
}

// Type for junction table query results with nested contacts
export interface JunctionTableContactRow {
  contact_id: number;
  contacts: Contact;
}
