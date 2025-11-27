import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/database.js";
import type { SubscriptionTier } from "../types/entities/profiles.js";
import type {
  Company,
  CompanyWithRole,
  ContactEntityType,
  CreateCompanyData,
  EntityType,
  UpdateCompanyData,
  Contact,
  CreateContactData,
  UpdateContactData,
  AddTeamMemberData,
  UpdateTeamMemberData,
  RoleLevel,
  JunctionTableContactRow,
  UpdateBrandingData,
  CompanyBranding,
} from "../types/entities/companies.js";
import { InternalServerError, NotFoundError } from "../plugins/errorHandler.js";
import { LocationType } from "../schemas/company.js";
import { TableNames } from "../types/utils.js";

type JunctionTableName =
  | "company_contacts"
  | "business_unit_contacts"
  | "region_contacts"
  | "site_contacts"
  | "asset_group_contacts"
  | "work_group_contacts"
  | "role_contacts";

const junctionTableMap: Record<ContactEntityType, JunctionTableName> = {
  company: "company_contacts",
  "business-unit": "business_unit_contacts",
  region: "region_contacts",
  site: "site_contacts",
  "asset-group": "asset_group_contacts",
  "work-group": "work_group_contacts",
  role: "role_contacts",
};

// Entity metadata configuration for generic CRUD operations
const entityMetadata: Record<
  EntityType,
  {
    tableName: string;
    discriminator: string;
    selectFields: string;
  }
> = {
  "business-units": {
    tableName: "business_units",
    discriminator: "business_unit",
    selectFields: "id,name,code,description,created_at,updated_at",
  },
  regions: {
    tableName: "regions",
    discriminator: "region",
    selectFields:
      "id,name,code,description,created_at,updated_at,business_unit_id",
  },
  sites: {
    tableName: "sites",
    discriminator: "site",
    selectFields:
      "id,name,code,description,created_at,updated_at,lat,lng,region_id",
  },
  "asset-groups": {
    tableName: "asset_groups",
    discriminator: "asset_group",
    selectFields: "id,name,code,description,created_at,updated_at,site_id",
  },
  "work-groups": {
    tableName: "work_groups",
    discriminator: "work_group",
    selectFields:
      "id,name,code,description,created_at,updated_at,asset_group_id",
  },
  roles: {
    tableName: "roles",
    discriminator: "role",
    selectFields:
      "id,code,level,reports_to_role_id,shared_role_id,created_at,updated_at,work_group_id",
  },
};

const foreignKeyTableMap: Record<ContactEntityType, string> = {
  company: "company_id",
  "business-unit": "business_unit_id",
  region: "region_id",
  site: "site_id",
  "asset-group": "asset_group_id",
  "work-group": "work_group_id",
  role: "role_id",
};

export class CompaniesService {
  private supabase: SupabaseClient<Database>;
  private supabaseAdmin?: SupabaseClient<Database>;
  private userId: string;
  private userSubscriptionTier: SubscriptionTier;

  constructor(
    supabaseClient: SupabaseClient<Database>,
    userId: string,
    userSubscriptionTier: SubscriptionTier,
    supabaseAdmin?: SupabaseClient<Database>
  ) {
    this.supabase = supabaseClient;
    this.supabaseAdmin = supabaseAdmin;
    this.userId = userId;
    this.userSubscriptionTier = userSubscriptionTier;
  }

  /**
   * Generic helper to query entities by type
   * Eliminates switch statement duplication across entity types
   */
  private async queryEntitiesByType(
    companyId: string,
    type: EntityType
  ): Promise<Record<string, unknown>[]> {
    const metadata = entityMetadata[type];
    if (!metadata) throw new Error("Invalid entity type");

    // Using type-unsafe .from() for dynamic table names
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (
      this.supabase.from as unknown as (tableName: string) => any
    )(metadata.tableName)
      .select(metadata.selectFields)
      .eq("is_deleted", false)
      .eq("company_id", companyId);

    if (result.error) throw result.error;

    // Add entity_type discriminator to each item
    const typedData = result.data as Record<string, unknown>[] | null;
    return (typedData || []).map((item) => ({
      ...item,
      entity_type: metadata.discriminator,
    }));
  }

  /**
   * Generic helper to create entity by type
   * Eliminates switch statement duplication across entity types
   */
  private async createEntityByType(
    companyId: string,
    type: EntityType,
    entityData: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const metadata = entityMetadata[type];
    if (!metadata) throw new Error("Invalid entity type");

    // Using type-unsafe .from() for dynamic table names
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (
      this.supabase.from as unknown as (tableName: string) => any
    )(metadata.tableName)
      .insert([
        {
          ...entityData,
          company_id: companyId,
          created_by: this.userId,
        },
      ])
      .select()
      .single();

    if (result.error) throw result.error;
    if (!result.data) throw new Error("Failed to create entity");

    // Add entity_type discriminator
    const typedData = result.data as Record<string, unknown>;
    return { ...typedData, entity_type: metadata.discriminator };
  }

  /**
   * Generic helper to update entity by type
   * Eliminates switch statement duplication across entity types
   */
  private async updateEntityByType(
    companyId: string,
    entityId: string,
    type: EntityType,
    entityData: Record<string, unknown>
  ): Promise<Record<string, unknown> | null> {
    const metadata = entityMetadata[type];
    if (!metadata) throw new Error("Invalid entity type");

    // Using type-unsafe .from() for dynamic table names
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (
      this.supabase.from as unknown as (tableName: string) => any
    )(metadata.tableName)
      .update(entityData)
      .eq("id", parseInt(entityId))
      .eq("company_id", companyId)
      .eq("is_deleted", false)
      .select()
      .single();

    if (result.error) throw result.error;

    // Add entity_type discriminator
    const typedData = result.data as Record<string, unknown> | null;
    return typedData
      ? { ...typedData, entity_type: metadata.discriminator }
      : null;
  }

  /**
   * Generic helper to soft-delete entity by type
   * Eliminates switch statement duplication across entity types
   */
  private async deleteEntityByType(
    companyId: string,
    entityId: string,
    type: EntityType
  ): Promise<void> {
    const metadata = entityMetadata[type];
    if (!metadata) throw new Error("Invalid entity type");

    // Using type-unsafe .from() for dynamic table names
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (
      this.supabase.from as unknown as (tableName: string) => any
    )(metadata.tableName)
      .update({ is_deleted: true, deleted_at: new Date().toISOString() })
      .eq("id", parseInt(entityId))
      .eq("company_id", companyId);

    if (result.error) throw result.error;
  }

  async getCompanies() {
    // : Promise<CompanyWithRole[]>
    // Query from user_companies side to get role directly without array
    const { data, error } = await this.supabase
      .from("user_companies")
      .select(
        "role, companies!inner(id, name, code, description, is_demo, created_at, updated_at, branding, icon_url)"
      )
      .eq("companies.is_deleted", false)
      .eq("companies.is_demo", this.userSubscriptionTier === "demo") // Ensure demo users only see demo companies
      .eq("user_id", this.userId)
      .order("companies(name)", { ascending: true });

    if (error) throw error;
    const companies =
      data?.map((item) => {
        const { role, companies: companyData } = item;
        return {
          ...companyData,
          role,
        };
      }) || [];

    return companies;
  }

  async getCompanyById(companyId: string): Promise<CompanyWithRole> {
    // Query from user_companies side to get role directly without array
    const { data, error } = await this.supabase
      .from("user_companies")
      .select("role, companies!inner(*)")
      .eq("companies.id", companyId)
      .eq("companies.is_deleted", false)
      .eq("companies.is_demo", this.userSubscriptionTier === "demo") // Ensure demo users only see demo companies
      .eq("user_id", this.userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new NotFoundError("Company not found");

    // Extract company data and role
    const { role, companies: companyData } = data;
    return {
      ...companyData,
      role,
    };
  }

  async createCompany(
    companyData: CreateCompanyData
  ): Promise<CompanyWithRole> {
    const { data, error } = await this.supabase
      .from("companies")
      .insert({ ...companyData, created_by: this.userId })
      .select()
      .single();

    if (error) throw error;

    // Add user_companies association
    const { error: userCompanyError } = await this.supabase
      .from("user_companies")
      .insert([
        {
          user_id: this.userId,
          company_id: data.id,
          role: "owner",
          created_by: this.userId,
        },
      ]);

    if (userCompanyError) {
      console.log("rolling back company creation due to userCompanyError");
      // Rollback company creation if association fails
      await this.supabase.from("companies").delete().eq("id", data.id);
      throw userCompanyError;
    }

    return { ...data, role: "owner" };
  }

  async updateCompany(
    companyId: string,
    companyData: UpdateCompanyData
  ): Promise<Company | null> {
    const { data, error } = await this.supabase
      .from("companies")
      .update(companyData)
      .eq("id", companyId)
      .eq("is_deleted", false)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async deleteCompany(companyId: string): Promise<boolean> {
    // Check if the user is an owner of the company
    const { data: userCompanyData, error: userCompanyError } =
      await this.supabase
        .from("user_companies")
        .select("*")
        .eq("company_id", companyId)
        .eq("user_id", this.userId)
        .eq("role", "owner")
        .maybeSingle();

    if (userCompanyError) throw userCompanyError;

    if (!userCompanyData) {
      console.log("User is not an owner of the company");
      throw new Error("Only owners can delete the company");
    }

    const { error } = await this.supabase
      .from("companies")
      .update({ is_deleted: true, deleted_at: new Date().toISOString() })
      .eq("id", companyId);

    if (error) throw error;
    return true;
  }

  async getCompanyEntities(companyId: string, type: EntityType) {
    // Return type is defined by Zod schema and validated by Fastify
    // Client gets types via OpenAPI generation
    return this.queryEntitiesByType(companyId, type);
  }

  async createCompanyEntity(
    companyId: string,
    type: EntityType,
    entityData: Record<string, unknown>
  ) {
    // Return type is defined by Zod schema and validated by Fastify
    // Client gets types via OpenAPI generation
    return this.createEntityByType(companyId, type, entityData);
  }

  async updateCompanyEntity(
    companyId: string,
    entityId: string,
    type: EntityType,
    entityData: Record<string, unknown>
  ) {
    // Return type is defined by Zod schema and validated by Fastify
    // Client gets types via OpenAPI generation
    return this.updateEntityByType(companyId, entityId, type, entityData);
  }

  async deleteCompanyEntity(
    companyId: string,
    entityId: string,
    type: EntityType
  ): Promise<boolean> {
    await this.deleteEntityByType(companyId, entityId, type);
    return true;
  }

  async getCompanyTree(companyId: string) {
    const { data, error } = await this.supabase
      .from("companies")
      .select(
        `
        id,
        name,
        code,
        description,
        business_units(
          id,name,code,description,order_index,
          regions(
            id,name,code,description,order_index,
            sites(
              id,name,code,description,lat,lng,order_index,
              asset_groups(
                id,name,code,description,order_index,
                work_groups(
                  id,name,code,description,order_index,
                  roles(
                    id,code,level,reports_to_role_id,order_index,
                    shared_roles(
                      id,name,description
                    )
                  )
                )
              )
            )
          )
        )
      `
      )
      .eq("id", companyId)
      .eq("is_deleted", false)
      .eq("business_units.is_deleted", false)
      .eq("business_units.regions.is_deleted", false)
      .eq("business_units.regions.sites.is_deleted", false)
      .eq("business_units.regions.sites.asset_groups.is_deleted", false)
      .eq(
        "business_units.regions.sites.asset_groups.work_groups.is_deleted",
        false
      )
      .eq(
        "business_units.regions.sites.asset_groups.work_groups.roles.is_deleted",
        false
      )
      .eq(
        "business_units.regions.sites.asset_groups.work_groups.roles.shared_roles.is_deleted",
        false
      )
      .order("order_index", { referencedTable: "business_units", ascending: true })
      .order("order_index", { referencedTable: "business_units.regions", ascending: true })
      .order("order_index", { referencedTable: "business_units.regions.sites", ascending: true })
      .order("order_index", { referencedTable: "business_units.regions.sites.asset_groups", ascending: true })
      .order("order_index", { referencedTable: "business_units.regions.sites.asset_groups.work_groups", ascending: true })
      .order("order_index", { referencedTable: "business_units.regions.sites.asset_groups.work_groups.roles", ascending: true })
      .single();

    if (error) throw error;

    if (!data) return null;

    this.transformRoleHierarchy(data);
    this.addTreeNodeTypes(data);
    return data;
  }

  async getCompanyContacts(companyId: string): Promise<Contact[]> {
    const { data, error } = await this.supabase
      .from("contacts")
      .select("*")
      .eq("company_id", companyId)
      .eq("is_deleted", false)
      .order("full_name", { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getEntityContacts(
    companyId: string,
    entityType: ContactEntityType,
    entityId: string
  ): Promise<Contact[] | null> {
    const tableName = junctionTableMap[entityType];
    const foreignKeyField = foreignKeyTableMap[entityType];

    if (!tableName || !foreignKeyField) {
      throw new Error("Invalid entity type");
    }

    // Type the query result explicitly because TypeScript can't infer the type
    // when using dynamic table names with Supabase
    const queryResult = (await this.supabase
      .from(tableName)
      .select(
        `
        contact_id,
        contacts(
          id,
          full_name,
          email,
          phone,
          title,
          is_deleted
        )
      `
      )
      .eq(
        foreignKeyField,
        entityType === "company" ? entityId : parseInt(entityId)
      )
      .eq("contacts.company_id", companyId)
      .eq("contacts.is_deleted", false)) as unknown as {
      data: JunctionTableContactRow[] | null;
      error: Error | null;
    };

    const { data, error } = queryResult;

    if (error) throw error;
    if (!data) return null;

    return data.map((item) => item.contacts);
  }

  async createEntityContact(
    companyId: string,
    entityType: ContactEntityType,
    entityId: string,
    contactData: CreateContactData
  ): Promise<Contact> {
    const tableName = junctionTableMap[entityType];
    const foreignKeyField = foreignKeyTableMap[entityType];

    if (!tableName || !foreignKeyField) {
      throw new Error("Invalid entity type");
    }

    const { data: insertedContact, error: contactError } = await this.supabase
      .from("contacts")
      .insert({
        ...contactData,
        company_id: companyId,
        created_by: this.userId,
      })
      .select("*")
      .single();

    if (contactError) throw contactError;

    const linkData = {
      contact_id: insertedContact.id,
      [foreignKeyField]:
        entityType === "company" ? entityId : parseInt(entityId),
      created_by: this.userId,
      company_id: companyId,
    };

    const { error: linkError } = await this.supabase
      .from(tableName)
      .insert(linkData);

    if (linkError) {
      await this.supabase
        .from("contacts")
        .delete()
        .eq("id", insertedContact.id);
      throw linkError;
    }

    return insertedContact;
  }

  async updateContact(
    companyId: string,
    contactId: string,
    contactData: UpdateContactData
  ): Promise<Contact | null> {
    if (Object.keys(contactData).length === 0) {
      throw new Error("No update data provided");
    }

    const { data, error } = await this.supabase
      .from("contacts")
      .update(contactData)
      .eq("id", parseInt(contactId))
      .eq("company_id", companyId)
      .eq("is_deleted", false)
      .select("*")
      .single();

    if (error) throw error;
    return data;
  }

  async deleteEntityContact(
    companyId: string,
    entityType: ContactEntityType,
    entityId: string,
    contactId: string
  ): Promise<{ success: boolean; message: string }> {
    const tableName = junctionTableMap[entityType];
    const foreignKeyField = foreignKeyTableMap[entityType];

    if (!tableName || !foreignKeyField) {
      throw new Error("Invalid entity type");
    }

    const { error: unlinkError } = await this.supabase
      .from(tableName)
      .delete()
      .eq("contact_id", parseInt(contactId))
      .eq(
        foreignKeyField,
        entityType === "company" ? entityId : parseInt(entityId)
      );

    if (unlinkError) throw unlinkError;

    const junctionTables = Object.values(junctionTableMap);
    let hasOtherLinks = false;

    for (const jTable of junctionTables) {
      const { data, error } = await this.supabase
        .from(jTable)
        .select("contact_id")
        .eq("contact_id", parseInt(contactId))
        .limit(1);

      if (error) continue;

      if (data && data.length > 0) {
        hasOtherLinks = true;
        break;
      }
    }

    if (!hasOtherLinks) {
      const { error: deleteError } = await this.supabase
        .from("contacts")
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq("id", parseInt(contactId))
        .eq("company_id", companyId);

      if (deleteError) throw deleteError;

      return {
        success: true,
        message: "Contact unlinked and deleted (no other links found)",
      };
    }

    return {
      success: true,
      message: "Contact unlinked from entity",
    };
  }

  private transformRoleHierarchy(data: any): void {
    const transformWorkGroup = (workGroup: any) => {
      if (!workGroup.roles || workGroup.roles.length === 0) {
        return workGroup;
      }

      const roles = workGroup.roles;
      const roleMap = new Map();
      const topLevelRoles: any[] = [];

      roles.forEach((role: any) => {
        role.reporting_roles = [];
        role.work_group_id = workGroup.id;
        if (role.shared_roles) {
          role.name = role.shared_roles.name;
          role.description = role.shared_roles.description;
          role.shared_role_id = role.shared_roles.id;
          delete role.shared_roles;
        }
        roleMap.set(role.id.toString(), role);
      });

      roles.forEach((role: any) => {
        if (role.reports_to_role_id) {
          const manager = roleMap.get(role.reports_to_role_id.toString());
          if (manager) {
            manager.reporting_roles.push(role);
          } else {
            topLevelRoles.push(role);
          }
        } else {
          topLevelRoles.push(role);
        }
      });

      return {
        ...workGroup,
        roles: topLevelRoles,
      };
    };

    if (data.business_units) {
      data.business_units.forEach((bu: any) => {
        if (bu.regions) {
          bu.regions.forEach((region: any) => {
            if (region.sites) {
              region.sites.forEach((site: any) => {
                if (site.asset_groups) {
                  site.asset_groups.forEach((ag: any) => {
                    if (ag.work_groups) {
                      ag.work_groups = ag.work_groups.map(transformWorkGroup);
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  }

  private addTreeNodeTypes(data: any): void {
    // Add type to root company node
    data.type = "company";

    // Process business units
    if (data.business_units && Array.isArray(data.business_units)) {
      data.business_units.forEach((bu: any) => {
        bu.type = "business_unit";

        // Process regions
        if (bu.regions && Array.isArray(bu.regions)) {
          bu.regions.forEach((region: any) => {
            region.type = "region";

            // Process sites
            if (region.sites && Array.isArray(region.sites)) {
              region.sites.forEach((site: any) => {
                site.type = "site";

                // Process asset groups
                if (site.asset_groups && Array.isArray(site.asset_groups)) {
                  site.asset_groups.forEach((ag: any) => {
                    ag.type = "asset_group";

                    // Process work groups
                    if (ag.work_groups && Array.isArray(ag.work_groups)) {
                      ag.work_groups.forEach((wg: any) => {
                        wg.type = "work_group";

                        // Process roles (including nested reporting_roles)
                        if (wg.roles && Array.isArray(wg.roles)) {
                          this.addRoleTypes(wg.roles);
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  }

  private addRoleTypes(roles: any[]): void {
    roles.forEach((role: any) => {
      role.type = "role";
      // Recursively add type to reporting roles
      if (role.reporting_roles && Array.isArray(role.reporting_roles)) {
        this.addRoleTypes(role.reporting_roles);
      }
    });
  }

  /**
   * Reorder company tree nodes
   * @param companyId ID of the company
   * @param updates Array of updates containing id, type, order_index, and optional parent_id/parent_type
   * @return void
   */
  async reorderCompanyTree(
    companyId: string,
    updates: Array<{
      id: number;
      type: LocationType;
      order_index: number;
      parent_id?: number;
      parent_type?: LocationType;
    }>
  ): Promise<void> {
    // Implementation for reordering the company tree nodes
    try {
      for (const update of updates) {
        let tableName: TableNames;

        switch (update.type) {
          case "business_unit":
            tableName = "business_units";
            break;
          case "region":
            tableName = "regions";
            break;
          case "site":
            tableName = "sites";
            break;
          case "asset_group":
            tableName = "asset_groups";
            break;
          case "work_group":
            tableName = "work_groups";
            break;
          case "role":
            tableName = "roles";
            break;
          default:
            throw new Error(`Invalid type: ${update.type}`);
        }

        const updateData: Record<string, unknown> = {
          order_index: update.order_index,
        };

        // Handle parent_id updates based on parent_type
        if ("parent_id" in update && update.parent_id !== undefined) {
          // For roles, we need to know if the parent is a work_group or another role
          if (update.type === "role") {
            if (update.parent_type === "work_group") {
              updateData["work_group_id"] = update.parent_id;
              updateData["reports_to_role_id"] = null; // Clear the role parent
            } else if (update.parent_type === "role") {
              updateData["reports_to_role_id"] = update.parent_id;
              // work_group_id stays the same (inherited from the parent role's work_group)
            } else {
              throw new Error(
                `Invalid parent_type for role: ${update.parent_type}`
              );
            }
          } else {
            // For non-role entities, determine parent column from type
            const parentColMap: Record<string, string> = {
              region: "business_unit_id",
              site: "region_id",
              asset_group: "site_id",
              work_group: "asset_group_id",
            };
            const parentColName = parentColMap[update.type];
            if (parentColName) {
              updateData[parentColName] = update.parent_id;
            }
          }
        }

        const { error } = await this.supabase
          .from(tableName)
          .update(updateData)
          .eq("id", update.id)
          .eq("is_deleted", false)
          .eq("company_id", companyId);

        if (error) {
          throw new Error(
            `Failed to update ${update.type} with id ${update.id}: ${error.message}`
          );
        }
      }
    } catch {
      throw new InternalServerError("Failed to reorder company tree");
    }
  }

  // Export and import logic

  async exportCompanyStructure(companyId: string): Promise<any> {
    // Get the full company tree
    const tree = await this.getCompanyTree(companyId);

    if (!tree) {
      throw new Error("Company not found");
    }

    // Transform tree to simple export format
    return this.transformToSimpleFormat(tree, "company");
  }

  private transformToSimpleFormat(item: any, type: string): any {
    const result: any = {
      id: item.id,
      name: item.name || "",
      type: type,
      description: item.description || "",
      code: item.code || "",
      children: [],
    };

    // Add children based on type
    if (type === "company" && item.business_units) {
      result.children = item.business_units.map((bu: any) =>
        this.transformToSimpleFormat(bu, "business_unit")
      );
    } else if (type === "business_unit" && item.regions) {
      result.children = item.regions.map((region: any) => {
        const regionNode = this.transformToSimpleFormat(region, "region");
        if (region.sites) {
          regionNode.children = region.sites.map((site: any) => {
            const siteNode = this.transformToSimpleFormat(site, "site");
            // Add asset groups directly to site
            if (site.asset_groups) {
              siteNode.children = site.asset_groups.map((ag: any) => {
                const agNode = this.transformToSimpleFormat(ag, "asset_group");
                // Add work groups to asset groups
                if (ag.work_groups) {
                  agNode.children = ag.work_groups.map((wg: any) => {
                    const wgNode = this.transformToSimpleFormat(
                      wg,
                      "work_group"
                    );
                    // Add roles to work groups
                    if (wg.roles) {
                      wgNode.children = wg.roles.map((role: any) =>
                        this.transformToSimpleFormat(role, "role")
                      );
                    }
                    return wgNode;
                  });
                }
                return agNode;
              });
            }
            return siteNode;
          });
        }
        return regionNode;
      });
    } else if (type === "region" && item.sites) {
      result.children = item.sites.map((site: any) =>
        this.transformToSimpleFormat(site, "site")
      );
    } else if (type === "site" && item.asset_groups) {
      result.children = item.asset_groups.map((ag: any) => {
        const agNode = this.transformToSimpleFormat(ag, "asset_group");
        if (ag.work_groups) {
          agNode.children = ag.work_groups.map((wg: any) => {
            const wgNode = this.transformToSimpleFormat(wg, "work_group");
            if (wg.roles) {
              wgNode.children = wg.roles.map((role: any) =>
                this.transformToSimpleFormat(role, "role")
              );
            }
            return wgNode;
          });
        }
        return agNode;
      });
    } else if (type === "asset_group" && item.work_groups) {
      result.children = item.work_groups.map((wg: any) => {
        const wgNode = this.transformToSimpleFormat(wg, "work_group");
        if (wg.roles) {
          wgNode.children = wg.roles.map((role: any) =>
            this.transformToSimpleFormat(role, "role")
          );
        }
        return wgNode;
      });
    } else if (type === "work_group" && item.roles) {
      result.children = item.roles.map((role: any) =>
        this.transformToSimpleFormat(role, "role")
      );
    } else if (type === "role" && item.reporting_roles) {
      result.children = item.reporting_roles.map((role: any) =>
        this.transformToSimpleFormat(role, "role")
      );
    }

    return result;
  }

  async importCompanyStructure(
    companyId: string,
    importData: {
      business_units: Array<{
        name: string;
        code: string;
        description: string | null;
      }>;
      regions: Array<{
        business_unit_key: string;
        name: string;
        code: string;
        description: string | null;
      }>;
      sites: Array<{
        region_key: string;
        name: string;
        code: string;
        description: string | null;
        lat: number | null;
        lng: number | null;
      }>;
      asset_groups: Array<{
        site_key: string;
        name: string;
        code: string;
        description: string | null;
      }>;
      work_groups: Array<{
        asset_group_key: string;
        name: string;
        code: string;
        description: string | null;
      }>;
      roles: Array<{
        work_group_key: string;
        shared_role_id: number | undefined;
        level: string | null;
      }>;
      contacts: Array<{
        entity_type: string;
        entity_key: string;
        full_name: string;
        email: string;
      }>;
    }
  ): Promise<void> {
    // Maps to track created entity IDs for parent-child relationships
    const businessUnitMap = new Map<string, number>();
    const regionMap = new Map<string, number>();
    const siteMap = new Map<string, number>();
    const assetGroupMap = new Map<string, number>();
    const workGroupMap = new Map<string, number>();
    const roleMap = new Map<string, number>();

    // Arrays to track created IDs for rollback
    const createdBusinessUnitIds: number[] = [];
    const createdRegionIds: number[] = [];
    const createdSiteIds: number[] = [];
    const createdAssetGroupIds: number[] = [];
    const createdWorkGroupIds: number[] = [];
    const createdRoleIds: number[] = [];
    const createdContactIds: number[] = [];
    const createdJunctionTableEntries: Array<{
      table: JunctionTableName;
      contactId: number;
      entityId: number;
    }> = [];

    // Cleanup function for rollback
    const cleanup = async () => {
      console.log("Rolling back import due to error...");

      // Delete in reverse order to respect foreign key constraints
      // 1. Delete junction table entries (role_contacts, work_group_contacts, etc.)
      for (const entry of createdJunctionTableEntries) {
        try {
          await this.supabase
            .from(entry.table)
            .delete()
            .eq("contact_id", entry.contactId);
        } catch (err) {
          console.error(`Failed to delete junction entry:`, err);
        }
      }

      // 2. Delete contacts
      if (createdContactIds.length > 0) {
        try {
          await this.supabase
            .from("contacts")
            .delete()
            .in("id", createdContactIds);
        } catch (err) {
          console.error("Failed to delete contacts:", err);
        }
      }

      // 3. Delete roles
      if (createdRoleIds.length > 0) {
        try {
          await this.supabase.from("roles").delete().in("id", createdRoleIds);
        } catch (err) {
          console.error("Failed to delete roles:", err);
        }
      }

      // 4. Delete work groups
      if (createdWorkGroupIds.length > 0) {
        try {
          await this.supabase
            .from("work_groups")
            .delete()
            .in("id", createdWorkGroupIds);
        } catch (err) {
          console.error("Failed to delete work groups:", err);
        }
      }

      // 5. Delete asset groups
      if (createdAssetGroupIds.length > 0) {
        try {
          await this.supabase
            .from("asset_groups")
            .delete()
            .in("id", createdAssetGroupIds);
        } catch (err) {
          console.error("Failed to delete asset groups:", err);
        }
      }

      // 6. Delete sites
      if (createdSiteIds.length > 0) {
        try {
          await this.supabase.from("sites").delete().in("id", createdSiteIds);
        } catch (err) {
          console.error("Failed to delete sites:", err);
        }
      }

      // 7. Delete regions
      if (createdRegionIds.length > 0) {
        try {
          await this.supabase
            .from("regions")
            .delete()
            .in("id", createdRegionIds);
        } catch (err) {
          console.error("Failed to delete regions:", err);
        }
      }

      // 8. Delete business units
      if (createdBusinessUnitIds.length > 0) {
        try {
          await this.supabase
            .from("business_units")
            .delete()
            .in("id", createdBusinessUnitIds);
        } catch (err) {
          console.error("Failed to delete business units:", err);
        }
      }

      console.log("Rollback completed");
    };

    try {
      // 1. Create Business Units
      if (importData.business_units.length > 0) {
        const { data: createdBUs, error: buError } = await this.supabase
          .from("business_units")
          .insert(
            importData.business_units.map((bu) => ({
              company_id: companyId,
              name: bu.name,
              code: bu.code,
              description: bu.description,
              created_by: this.userId,
            }))
          )
          .select("id, name");

        if (buError) throw buError;

        createdBUs?.forEach((bu) => {
          businessUnitMap.set(bu.name, bu.id);
          createdBusinessUnitIds.push(bu.id);
        });
      }

      // 2. Create Regions
      if (importData.regions.length > 0) {
        const regions2Insert = importData.regions
          .map((region) => {
            const buId = businessUnitMap.get(region.business_unit_key);
            if (!buId) {
              console.warn(
                `Business Unit with key "${region.business_unit_key}" not found for Region "${region.name}"`
              );
              return null;
            }
            return {
              company_id: companyId,
              business_unit_id: buId,
              name: region.name,
              code: region.code,
              description: region.description,
              created_by: this.userId,
            };
          })
          .filter((r) => r !== null);

        const { data: createdRegions, error: regionError } = await this.supabase
          .from("regions")
          .insert(regions2Insert)
          .select("id, business_unit_id, name");

        if (regionError) throw regionError;

        createdRegions?.forEach((region) => {
          const buName = Array.from(businessUnitMap.entries()).find(
            ([_, id]) => id === region.business_unit_id
          )?.[0];
          const key = `${buName}|${region.name}`;
          regionMap.set(key, region.id);
          createdRegionIds.push(region.id);
        });
      }

      // 3. Create Sites
      if (importData.sites.length > 0) {
        const sites2Insert = importData.sites
          .map((site) => {
            const regionId = regionMap.get(site.region_key);
            if (!regionId) {
              console.warn(
                `Region with key "${site.region_key}" not found for Site "${site.name}"`
              );
              return null;
            }
            return {
              company_id: companyId,
              region_id: regionId,
              name: site.name,
              code: site.code,
              description: site.description,
              lat: site.lat,
              lng: site.lng,
              created_by: this.userId,
            };
          })
          .filter((s) => s !== null);
        const { data: createdSites, error: siteError } = await this.supabase
          .from("sites")
          .insert(sites2Insert)
          .select("id, region_id, name");

        if (siteError) throw siteError;

        createdSites?.forEach((site) => {
          const regionName = Array.from(regionMap.entries()).find(
            ([_, id]) => id === site.region_id
          )?.[0];
          const key = `${regionName}|${site.name}`;
          siteMap.set(key, site.id);
          createdSiteIds.push(site.id);
        });
      }

      // 4. Create Asset Groups
      if (importData.asset_groups.length > 0) {
        const assetGroups2Insert = importData.asset_groups
          .map((ag) => {
            const siteId = siteMap.get(ag.site_key);
            if (!siteId) {
              console.warn(
                `Site with key "${ag.site_key}" not found for Asset Group "${ag.name}"`
              );
              return null;
            }
            return {
              company_id: companyId,
              site_id: siteId,
              name: ag.name,
              code: ag.code,
              description: ag.description,
              created_by: this.userId,
            };
          })
          .filter((ag) => ag !== null);

        const { data: createdAGs, error: agError } = await this.supabase
          .from("asset_groups")
          .insert(assetGroups2Insert)
          .select("id, site_id, name");

        if (agError) throw agError;

        createdAGs?.forEach((ag) => {
          const siteName = Array.from(siteMap.entries()).find(
            ([_, id]) => id === ag.site_id
          )?.[0];
          const key = `${siteName}|${ag.name}`;
          assetGroupMap.set(key, ag.id);
          createdAssetGroupIds.push(ag.id);
        });
      }

      // 5. Create Work Groups
      if (importData.work_groups.length > 0) {
        const workGroups2Insert = importData.work_groups
          .map((wg) => {
            const agId = assetGroupMap.get(wg.asset_group_key);
            if (!agId) {
              console.warn(
                `Asset Group with key "${wg.asset_group_key}" not found for Work Group "${wg.name}"`
              );
              return null;
            }
            return {
              company_id: companyId,
              asset_group_id: agId,
              name: wg.name,
              code: wg.code,
              description: wg.description,
              created_by: this.userId,
            };
          })
          .filter((wg) => wg !== null);
        const { data: createdWGs, error: wgError } = await this.supabase
          .from("work_groups")
          .insert(workGroups2Insert)
          .select("id, asset_group_id, name");

        if (wgError) throw wgError;

        createdWGs?.forEach((wg) => {
          const agName = Array.from(assetGroupMap.entries()).find(
            ([_, id]) => id === wg.asset_group_id
          )?.[0];
          const key = `${agName}|${wg.name}`;
          workGroupMap.set(key, wg.id);
          createdWorkGroupIds.push(wg.id);
        });
      }

      // 6. Create Roles
      if (importData.roles.length > 0) {
        const roles2Insert = importData.roles
          .map((role) => {
            const wgId = workGroupMap.get(role.work_group_key);
            if (!wgId) {
              console.warn(
                `Work Group with key "${role.work_group_key}" not found for Role with shared_role_id "${role.shared_role_id}"`
              );
              return null;
            }
            return {
              company_id: companyId,
              work_group_id: wgId,
              shared_role_id: role.shared_role_id,
              level: role.level as RoleLevel | null,
              created_by: this.userId,
            };
          })
          .filter((r) => r !== null);
        const { data: createdRoles, error: roleError } = await this.supabase
          .from("roles")
          .insert(roles2Insert)
          .select("id, work_group_id, shared_role_id");

        if (roleError) throw roleError;

        createdRoles?.forEach((role, index) => {
          const originalRole = importData.roles[index];
          roleMap.set(originalRole.work_group_key, role.id);
          createdRoleIds.push(role.id);
        });
      }

      // 7. Create Contacts
      if (importData.contacts.length > 0) {
        // First, create all contacts
        const { data: createdContacts, error: contactError } =
          await this.supabase
            .from("contacts")
            .insert(
              importData.contacts.map((contact) => ({
                company_id: companyId,
                full_name: contact.full_name,
                email: contact.email,
                created_by: this.userId,
              }))
            )
            .select("id");

        if (contactError) throw contactError;

        // Track created contact IDs
        createdContacts?.forEach((contact) => {
          createdContactIds.push(contact.id);
        });

        // Then, link contacts to entities
        const contactLinks: any[] = [];

        importData.contacts.forEach((contact, index) => {
          const contactId = createdContacts?.[index]?.id;
          if (!contactId) return;

          let entityId: number | string | undefined;
          let tableName: string;
          let foreignKeyField: string;

          switch (contact.entity_type) {
            case "business_unit":
              entityId = businessUnitMap.get(contact.entity_key);
              tableName = "business_unit_contacts";
              foreignKeyField = "business_unit_id";
              break;
            case "region":
              entityId = regionMap.get(contact.entity_key);
              tableName = "region_contacts";
              foreignKeyField = "region_id";
              break;
            case "site":
              entityId = siteMap.get(contact.entity_key);
              tableName = "site_contacts";
              foreignKeyField = "site_id";
              break;
            case "asset_group":
              entityId = assetGroupMap.get(contact.entity_key);
              tableName = "asset_group_contacts";
              foreignKeyField = "asset_group_id";
              break;
            case "work_group":
              entityId = workGroupMap.get(contact.entity_key);
              tableName = "work_group_contacts";
              foreignKeyField = "work_group_id";
              break;
            case "role":
              entityId = roleMap.get(contact.entity_key);
              tableName = "role_contacts";
              foreignKeyField = "role_id";
              break;
            default:
              return;
          }

          if (entityId) {
            contactLinks.push({
              table: tableName,
              data: {
                contact_id: contactId,
                [foreignKeyField]: entityId,
                company_id: companyId,
                created_by: this.userId,
              },
            });
          }
        });

        // Insert contact links
        for (const link of contactLinks) {
          const { error: linkError } = await this.supabase
            .from(link.table)
            .insert(link.data);

          if (linkError) throw linkError;

          // Track junction table entry for rollback
          createdJunctionTableEntries.push({
            table: link.table,
            contactId: link.data.contact_id,
            entityId:
              link.data.business_unit_id ||
              link.data.region_id ||
              link.data.site_id ||
              link.data.asset_group_id ||
              link.data.work_group_id ||
              link.data.role_id,
          });
        }
      }
    } catch (error) {
      console.error("Error during company structure import:", error);
      await cleanup();
      throw new Error(
        `Import failed and rolled back: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Team Management Methods

  async getTeamMembers(companyId: string) {
    // : Promise<TeamMember[]>
    // First verify the user has access to this company
    const company = await this.getCompanyById(companyId);
    if (!company) {
      throw new Error("Company not found or access denied");
    }

    const { data, error } = await this.supabase
      .from("user_companies")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) return [];

    // Fetch user profiles separately using admin client to bypass RLS
    if (!this.supabaseAdmin) {
      throw new Error("Admin client required for team management operations");
    }

    const userIds = data.map((item) => item.user_id);
    const { data: profiles, error: profilesError } = await this.supabaseAdmin
      .from("profiles")
      .select("id, email, full_name")
      .in("id", userIds);

    if (profilesError) throw profilesError;

    // Map profiles to team members
    const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

    return data.map((item) => {
      const profile = profileMap.get(item.user_id);
      return {
        id: item.id,
        user_id: item.user_id,
        company_id: item.company_id,
        role: item.role,
        created_at: item.created_at,
        updated_at: item.updated_at,
        user: {
          id: profile?.id || item.user_id,
          email: profile?.email || "",
          full_name: profile?.full_name || null,
        },
        is_owner: item.role === "owner",
        is_creator: company.created_by === item.user_id,
      };
    });
  }

  async addTeamMember(companyId: string, memberData: AddTeamMemberData) {
    // : Promise<TeamMember>
    // Verify the current user is an owner or admin
    const company = await this.getCompanyById(companyId);
    if (!company) {
      throw new Error("Company not found or access denied");
    }

    if (company.role !== "owner" && company.role !== "admin") {
      throw new Error("Only owners and admins can add team members");
    }

    // Find user by email using admin client to bypass RLS
    if (!this.supabaseAdmin) {
      throw new Error("Admin client required for team management operations");
    }

    const { data: userData, error: userError } = await this.supabaseAdmin
      .from("profiles")
      .select("id, email, full_name")
      .eq("email", memberData.email)
      .maybeSingle();

    if (userError) throw userError;

    if (!userData) {
      throw new Error("User with this email not found");
    }

    // Check if user is already a member
    const { data: existingMember } = await this.supabase
      .from("user_companies")
      .select("id")
      .eq("company_id", companyId)
      .eq("user_id", userData.id)
      .maybeSingle();

    if (existingMember) {
      throw new Error("User is already a member of this company");
    }

    // Add user to company
    const { data, error } = await this.supabase
      .from("user_companies")
      .insert({
        user_id: userData.id,
        company_id: companyId,
        role: memberData.role,
        created_by: this.userId,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      user_id: data.user_id,
      company_id: data.company_id,
      role: data.role,
      created_at: data.created_at,
      updated_at: data.updated_at,
      user: {
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
      },
      is_owner: data.role === "owner",
      is_creator: company.created_by === userData.id,
    };
  }

  async updateTeamMember(
    companyId: string,
    userId: string,
    updateData: UpdateTeamMemberData
  ) {
    // : Promise<TeamMember>
    // Verify the current user is an owner or admin
    const company = await this.getCompanyById(companyId);
    if (!company) {
      throw new Error("Company not found or access denied");
    }

    if (company.role !== "owner" && company.role !== "admin") {
      throw new Error("Only owners and admins can update team members");
    }

    // Prevent users from changing their own role
    if (userId === this.userId) {
      throw new Error("You cannot change your own role");
    }

    // Get the team member being updated
    const { data: memberData, error: memberError } = await this.supabase
      .from("user_companies")
      .select("*")
      .eq("company_id", companyId)
      .eq("user_id", userId)
      .maybeSingle();

    if (memberError) throw memberError;

    if (!memberData) {
      throw new Error("Team member not found");
    }

    // Fetch user profile using admin client to bypass RLS
    if (!this.supabaseAdmin) {
      throw new Error("Admin client required for team management operations");
    }

    const { data: userData, error: userError } = await this.supabaseAdmin
      .from("profiles")
      .select("id, email, full_name")
      .eq("id", userId)
      .maybeSingle();

    if (userError) throw userError;

    if (!userData) {
      throw new Error("User profile not found");
    }

    // Prevent changing the role of the last owner
    if (memberData.role === "owner" && updateData.role !== "owner") {
      // Count owners
      const { data: owners, error: ownersError } = await this.supabase
        .from("user_companies")
        .select("id")
        .eq("company_id", companyId)
        .eq("role", "owner");

      if (ownersError) throw ownersError;

      if (owners && owners.length <= 1) {
        throw new Error("Cannot change the role of the last owner");
      }
    }

    // Update the role
    const { data, error } = await this.supabase
      .from("user_companies")
      .update({ role: updateData.role })
      .eq("company_id", companyId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      user_id: data.user_id,
      company_id: data.company_id,
      role: data.role,
      created_at: data.created_at,
      updated_at: data.updated_at,
      user: {
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
      },
      is_creator: company.created_by === userId,
      is_owner: data.role === "owner",
    };
  }

  async removeTeamMember(companyId: string, userId: string): Promise<boolean> {
    // Verify the current user is an owner or admin
    const company = await this.getCompanyById(companyId);
    if (!company) {
      throw new Error("Company not found or access denied");
    }

    if (company.role !== "owner" && company.role !== "admin") {
      throw new Error("Only owners and admins can remove team members");
    }

    // Prevent users from removing themselves
    if (userId === this.userId) {
      throw new Error("You cannot remove yourself from the company");
    }

    // Get the team member being removed
    const { data: memberData, error: memberError } = await this.supabase
      .from("user_companies")
      .select("role")
      .eq("company_id", companyId)
      .eq("user_id", userId)
      .maybeSingle();

    if (memberError) throw memberError;

    if (!memberData) {
      throw new Error("Team member not found");
    }

    // Prevent removing an owner
    if (memberData.role === "owner") {
      throw new Error("Cannot remove an owner from the company");
    }

    // Get company details to check if user is the creator
    const { data: companyData, error: companyError } = await this.supabase
      .from("companies")
      .select("created_by")
      .eq("id", companyId)
      .single();

    if (companyError) throw companyError;

    // Prevent creator from removing themselves
    if (companyData.created_by === userId) {
      throw new Error("The company creator cannot remove themselves");
    }

    // Remove the team member
    const { error } = await this.supabase
      .from("user_companies")
      .delete()
      .eq("company_id", companyId)
      .eq("user_id", userId);

    if (error) throw error;

    return true;
  }

  async getActionsByCompanyId(companyId: string) {
    const { data, error } = await this.supabase
      .from("interview_response_actions")
      .select(
        `
          id,created_at,updated_at,title,description,
          interview_response:interview_responses(
            id,
            questionnaire_question:questionnaire_questions(
              id,
              title,
              questionnaire_step:questionnaire_steps(
                id,
                title,
                questionnaire_section:questionnaire_sections(
                  id,
                  title
                )
              )
            ),
            interview:interviews(
              id,
              interview_contact:contacts(
                id,
                full_name,
                email
              ),
              assessment:assessments(
                id,
                name,
                site:sites(
                  id,
                  name,
                  region:regions(
                    id,
                    name,
                    business_unit:business_units(
                      id,
                      name
                    )
                  )
                )
              )
            )
          )
        `
      )
      .eq("is_deleted", false)
      .eq("interview_response.interview.assessment.company_id", companyId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data || [];
  }

  async getContactsByRole(companyId: string, roleId: number) {
    const { data: contacts, error } = await this.supabase
      .from("role_contacts")
      .select(
        `
          contact:contacts(
            id,
            full_name,
            email,
            title,
            phone
          )
        `
      )
      .eq("role_id", roleId)
      .eq("contacts.is_deleted", false)
      .eq("company_id", companyId);

    if (error) throw error;

    // Unpack contacts
    const unpackedContacts = contacts?.map((item) => item.contact) || [];
    return unpackedContacts;
  }

  /**
   * Upload or replace a company icon
   * @param companyId - The company ID
   * @param fileBuffer - The image file buffer
   * @param fileName - The original file name
   * @param mimeType - The file MIME type
   * @returns The public URL of the uploaded icon
   */
  async updateCompanyIcon(
    companyId: string,
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<string> {
    const bucketName = "company-icons";

    // Validate file type
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/svg+xml"];
    if (!allowedMimeTypes.includes(mimeType)) {
      throw new Error(
        "Invalid file type. Only JPG, PNG, and SVG images are allowed."
      );
    }

    // Validate file size (2MB max)
    const maxSize = 2 * 1024 * 1024;
    if (fileBuffer.length > maxSize) {
      throw new Error(
        `File size must be less than 2MB. Current size: ${(fileBuffer.length / 1024 / 1024).toFixed(2)}MB`
      );
    }

    // Get file extension
    const extension = fileName.split(".").pop()?.toLowerCase() || "png";
    const filePath = `${companyId}/icon.${extension}`;

    // Get existing company data to check for old icon
    const company = await this.getCompanyById(companyId);
    if (!company) {
      throw new Error("Company not found");
    }

    // Delete old icon from storage if it exists
    if (company.icon_url) {
      try {
        // Extract file path from URL
        const urlParts = company.icon_url.split(`${bucketName}/`);
        if (urlParts.length > 1) {
          const oldFilePath = urlParts[1];
          await this.supabase.storage.from(bucketName).remove([oldFilePath]);
        }
      } catch (error) {
        console.warn("Failed to delete old icon:", error);
        // Continue with upload even if deletion fails
      }
    }

    // Upload new icon to storage
    const { error: uploadError } = await this.supabase.storage
      .from(bucketName)
      .upload(filePath, fileBuffer, {
        contentType: mimeType,
        upsert: true, // Overwrite if exists
      });

    if (uploadError) {
      throw new Error(`Failed to upload icon: ${uploadError.message}`);
    }

    // Get public URL from the bucket
    const {
      data: { publicUrl },
    } = this.supabase.storage.from(bucketName).getPublicUrl(filePath);

    // Update company record with public URL
    const { error: updateError } = await this.supabase
      .from("companies")
      .update({ icon_url: publicUrl })
      .eq("id", companyId)
      .eq("is_deleted", false);

    if (updateError) {
      // Clean up uploaded file if database update fails
      await this.supabase.storage.from(bucketName).remove([filePath]);
      throw new Error(`Failed to update company icon: ${updateError.message}`);
    }

    return publicUrl;
  }

  /**
   * Remove a company icon
   * @param companyId - The company ID
   * @returns True if successful
   */
  async removeCompanyIcon(companyId: string): Promise<boolean> {
    const bucketName = "company-icons";

    // Get existing company data
    const company = await this.getCompanyById(companyId);
    if (!company) {
      throw new Error("Company not found");
    }

    if (!company.icon_url) {
      throw new Error("Company has no icon to remove");
    }

    // Extract file path from URL
    const urlParts = company.icon_url.split(`${bucketName}/`);
    if (urlParts.length > 1) {
      const filePath = urlParts[1];

      // Delete from storage
      const { error: storageError } = await this.supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (storageError) {
        console.warn("Failed to delete icon from storage:", storageError);
        // Continue with database update even if storage deletion fails
      }
    }

    // Update company record to remove icon URL
    const { error: updateError } = await this.supabase
      .from("companies")
      .update({ icon_url: null })
      .eq("id", companyId)
      .eq("is_deleted", false);

    if (updateError) {
      throw new Error(`Failed to remove company icon: ${updateError.message}`);
    }

    return true;
  }

  /**
   * Update company branding colors
   * @param companyId - The company ID
   * @param brandingData - The branding colors to update
   * @returns The updated company
   */
  async updateCompanyBranding(
    companyId: string,
    brandingData: UpdateBrandingData
  ) {
    // : Promise<Company | null>
    // Get existing company data
    const company = await this.getCompanyById(companyId);
    if (!company) {
      throw new Error("Company not found");
    }

    // Get existing branding or initialize as empty object
    const existingBranding: CompanyBranding =
      company.branding &&
      typeof company.branding === "object" &&
      !Array.isArray(company.branding)
        ? (company.branding as unknown as CompanyBranding)
        : { primary: null, secondary: null, accent: null };

    // Merge existing branding with new data
    const updatedBranding = {
      primary:
        brandingData.primary !== undefined
          ? brandingData.primary
          : existingBranding.primary,
      secondary:
        brandingData.secondary !== undefined
          ? brandingData.secondary
          : existingBranding.secondary,
      accent:
        brandingData.accent !== undefined
          ? brandingData.accent
          : existingBranding.accent,
    };

    // Update company record with new branding
    const { data, error } = await this.supabase
      .from("companies")
      .update({
        branding:
          updatedBranding as unknown as Database["public"]["Tables"]["companies"]["Update"]["branding"],
      })
      .eq("id", companyId)
      .eq("is_deleted", false)
      .select()
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to update company branding: ${error.message}`);
    }

    return data;
  }
}
