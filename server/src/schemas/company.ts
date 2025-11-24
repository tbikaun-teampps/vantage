import { z } from "zod";
import { RoleLevel, UserCompanyRole } from "../types/entities/companies";

export type LocationType =
  | "business_unit"
  | "region"
  | "site"
  | "asset_group"
  | "work_group"
  | "role";

export const LocationTypeEnum: LocationType[] = [
  "business_unit",
  "region",
  "site",
  "asset_group",
  "work_group",
  "role",
];

export const UserCompanyRoleEnum: UserCompanyRole[] = [
  "owner",
  "admin",
  "viewer",
  "interviewee",
];

export const RoleLevelEnum: RoleLevel[] = [
  "executive",
  "management",
  "supervisor",
  "professional",
  "technician",
  "operator",
  "specialist",
  "other",
];

export const query2tableMap: Record<string, string> = {
  "business-units": "business_units",
  regions: "regions",
  sites: "sites",
  "asset-groups": "asset_groups",
  "work-groups": "work_groups",
  roles: "roles",
};

// Schema for nested roles (direct reports) - NO reporting_roles
const roleTreeNodeNested = z.object({
  id: z.number(),
  work_group_id: z.number(),
  code: z.string().nullable(),
  level: z.enum(RoleLevelEnum).nullable(),
  reports_to_role_id: z.number().nullable(),
  name: z.string(),
  description: z.string().nullable(),
  shared_role_id: z.number(),
});

const roleTreeNode = roleTreeNodeNested.extend({
  reporting_roles: z.array(roleTreeNodeNested),
});

const companyItem = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string().nullable(),
  description: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  is_demo: z.boolean(),
  icon_url: z.string().nullable(),
  branding: z.any().nullable(),
});

const companyWithRoleItem = companyItem.extend({
  role: z.enum(UserCompanyRoleEnum),
});

export const companySchemas = {
  params: {
    companyId: z.object({
      companyId: z.string(),
    }),

    entityParams: z.object({
      companyId: z.string(),
      entityId: z.string(),
    }),

    contactParams: z.object({
      companyId: z.string(),
      entityType: z.enum([
        "company",
        "business-unit",
        "region",
        "site",
        "asset-group",
        "work-group",
        "role",
      ]),
      entityId: z.string(),
    }),

    contactDeleteParams: z.object({
      companyId: z.string(),
      entityType: z.enum([
        "company",
        "business-unit",
        "region",
        "site",
        "asset-group",
        "work-group",
        "role",
      ]),
      entityId: z.string(),
      contactId: z.string(),
    }),

    contactUpdateParams: z.object({
      companyId: z.string(),
      contactId: z.string(),
    }),

    contactRoleParams: z.object({
      companyId: z.string(),
      roleId: z.coerce.number(),
    }),

    teamMemberParams: z.object({
      companyId: z.string(),
      userId: z.string(),
    }),
  },

  querystring: {
    entityType: z.object({
      type: z.enum([
        "business-units",
        "regions",
        "sites",
        "asset-groups",
        "work-groups",
        "roles",
      ]),
    }),
  },

  body: {
    createCompany: z.object({
      name: z.string(),
      code: z.string().optional(),
      description: z.string().optional(),
    }),

    updateCompany: z.object({
      name: z.string().optional(),
      code: z.string().optional(),
      description: z.string().optional(),
    }),

    createContact: z.object({
      full_name: z.string(),
      email: z.email(),
      phone: z.string().optional(),
      title: z.string().optional(),
    }),

    updateContact: z.object({
      full_name: z.string().optional(),
      email: z.email().optional(),
      phone: z.string().optional(),
      title: z.string().optional(),
    }),

    addTeamMember: z.object({
      email: z.email(),
      role: z.enum(UserCompanyRoleEnum),
    }),

    updateTeamMember: z.object({
      role: z.enum(UserCompanyRoleEnum),
    }),

    addEntity: z.union([
      // business-units
      z
        .object({
          company_id: z.string(),
          name: z.string().min(1),
          code: z.string().nullable().optional(),
          description: z.string().nullable().optional(),
        })
        .strict(),

      // regions
      z
        .object({
          business_unit_id: z.coerce.number().int().positive(),
          name: z.string().min(1),
          code: z.string().nullable().optional(),
          description: z.string().nullable().optional(),
        })
        .strict(),

      // sites
      z
        .object({
          region_id: z.coerce.number().int().positive(),
          name: z.string().min(1),
          code: z.string().nullable().optional(),
          description: z.string().nullable().optional(),
          lat: z.coerce.number().nullable().optional(),
          lng: z.coerce.number().nullable().optional(),
        })
        .strict(),

      // asset-groups
      z
        .object({
          site_id: z.coerce.number().int().positive(),
          name: z.string().min(1),
          code: z.string().nullable().optional(),
          description: z.string().nullable().optional(),
          asset_type: z.string().nullable().optional(),
        })
        .strict(),

      // work-groups
      z
        .object({
          asset_group_id: z.coerce.number().int().positive(),
          name: z.string().min(1),
          code: z.string().nullable().optional(),
          description: z.string().nullable().optional(),
        })
        .strict(),

      // roles (NO name/description!)
      z
        .object({
          work_group_id: z.number().int().positive(),
          code: z.string().nullable().optional(),
          level: z.enum(RoleLevelEnum),
          reports_to_role_id: z.coerce.number().int().positive().optional(), // Might be string from frontend
          shared_role_id: z.coerce.number().int().positive(), // Might be string from frontend
        })
        .strict(),
    ]),

    updateEntity: z.union([
      // business-units, regions, asset-groups, work-groups (common structure)
      z
        .object({
          id: z.coerce.number().int().positive(),
          name: z.string().min(1).optional(),
          code: z.string().nullable().optional(),
          description: z.string().nullable().optional(),
        })
        .strict(),

      // sites (adds lat/lng)
      z
        .object({
          id: z.coerce.number().int().positive(),
          name: z.string().min(1).optional(),
          code: z.string().nullable().optional(),
          description: z.string().nullable().optional(),
          lat: z.coerce.number().nullable().optional(),
          lng: z.coerce.number().nullable().optional(),
        })
        .strict(),

      // asset-groups (adds asset_type)
      z
        .object({
          id: z.coerce.number().int().positive(),
          name: z.string().min(1).optional(),
          code: z.string().nullable().optional(),
          description: z.string().nullable().optional(),
          asset_type: z.string().nullable().optional(),
        })
        .strict(),

      // roles (NO name/description!)
      z
        .object({
          id: z.coerce.number().int().positive(),
          code: z.string().nullable().optional(),
          level: z.enum(RoleLevelEnum).nullable().optional(),
          reports_to_role_id: z.coerce.number().int().positive().optional(),
          shared_role_id: z.coerce.number().int().positive().optional(),
        })
        .strict(),
    ]),
  },

  responses: {
    company: companyWithRoleItem,

    companyList: z.object({
      success: z.boolean(),
      data: z.array(companyWithRoleItem),
    }),

    companyWithRoleDetail: z.object({
      success: z.boolean(),
      data: companyWithRoleItem,
    }),

    companyDetail: z.object({
      success: z.boolean(),
      data: companyItem,
    }),

    entityList: z.object({
      success: z.boolean(),
      data: z.array(
        z.discriminatedUnion("entity_type", [
          // For business-units
          z.object({
            entity_type: z.literal("business_unit"),
            id: z.number(),
            name: z.string(),
            code: z.string().nullable(),
            description: z.string().nullable(),
            created_at: z.string(),
            updated_at: z.string(),
          }),
          // For regions (includes business_unit_id)
          z.object({
            entity_type: z.literal("region"),
            id: z.number(),
            name: z.string(),
            code: z.string().nullable(),
            description: z.string().nullable(),
            created_at: z.string(),
            updated_at: z.string(),
            business_unit_id: z.number(),
          }),
          // For sites (includes lat/lng and region_id)
          z.object({
            entity_type: z.literal("site"),
            id: z.number(),
            name: z.string(),
            code: z.string().nullable(),
            description: z.string().nullable(),
            created_at: z.string(),
            updated_at: z.string(),
            lat: z.number().nullable(),
            lng: z.number().nullable(),
            region_id: z.number(),
          }),
          // For asset-groups (includes site_id)
          z.object({
            entity_type: z.literal("asset_group"),
            id: z.number(),
            name: z.string(),
            code: z.string().nullable(),
            description: z.string().nullable(),
            created_at: z.string(),
            updated_at: z.string(),
            site_id: z.number(),
          }),
          // For work-groups (includes asset_group_id)
          z.object({
            entity_type: z.literal("work_group"),
            id: z.number(),
            name: z.string(),
            code: z.string().nullable(),
            description: z.string().nullable(),
            created_at: z.string(),
            updated_at: z.string(),
            asset_group_id: z.number(),
          }),
          // For roles (NO name/description!)
          z.object({
            entity_type: z.literal("role"),
            id: z.number(),
            code: z.string().nullable(),
            level: z.enum(RoleLevelEnum).nullable(),
            reports_to_role_id: z.number().nullable(),
            shared_role_id: z.number().nullable(),
            created_at: z.string(),
            updated_at: z.string(),
            work_group_id: z.number(),
          }),
        ])
      ),
    }),

    companyTree: z.object({
      success: z.boolean(),
      data: z.object({
        id: z.string(),
        name: z.string(),
        code: z.string().nullable(),
        description: z.string().nullable(),
        business_units: z.array(
          z.object({
            id: z.number(),
            name: z.string(),
            code: z.string().nullable(),
            description: z.string().nullable(),
            regions: z.array(
              z.object({
                id: z.number(),
                name: z.string(),
                code: z.string().nullable(),
                description: z.string().nullable(),
                sites: z.array(
                  z.object({
                    id: z.number(),
                    name: z.string(),
                    code: z.string().nullable(),
                    description: z.string().nullable(),
                    lat: z.number().nullable(),
                    lng: z.number().nullable(),
                    asset_groups: z.array(
                      z.object({
                        id: z.number(),
                        name: z.string(),
                        code: z.string().nullable(),
                        description: z.string().nullable(),
                        work_groups: z.array(
                          z.object({
                            id: z.number(),
                            name: z.string(),
                            code: z.string().nullable(),
                            description: z.string().nullable(),
                            roles: z.array(roleTreeNode),
                          })
                        ),
                      })
                    ),
                  })
                ),
              })
            ),
          })
        ),
      }),
    }),

    contactList: z.object({
      success: z.boolean(),
      data: z
        .array(
          z.object({
            id: z.number(),
            full_name: z.string(),
            email: z.string(),
            phone: z.string().nullable(),
            title: z.string().nullable(),
          })
        )
        .nullable(),
    }),

    contactDetail: z.object({
      success: z.boolean(),
      data: z.object({
        id: z.number(),
        full_name: z.string(),
        email: z.string(),
        phone: z.string().nullable(),
        title: z.string().nullable(),
        company_id: z.string(),
      }),
    }),

    teamMemberList: z.object({
      success: z.boolean(),
      data: z.array(
        z.object({
          id: z.number(),
          user_id: z.string(),
          company_id: z.string(),
          role: z.enum(UserCompanyRoleEnum),
          created_at: z.string(),
          updated_at: z.string(),
          user: z.object({
            id: z.string(),
            email: z.email(),
            full_name: z.union([z.string(), z.null()]),
          }),
          is_creator: z.boolean(),
          is_owner: z.boolean(),
        })
      ),
    }),

    teamMemberDetail: z.object({
      success: z.boolean(),
      data: z.object({
        id: z.number(),
        user_id: z.string(),
        company_id: z.string(),
        role: z.enum(UserCompanyRoleEnum),
        created_at: z.string(),
        updated_at: z.string(),
        user: z.object({
          id: z.string(),
          email: z.email(),
          full_name: z.union([z.string(), z.null()]),
        }),
        is_creator: z.boolean(),
        is_owner: z.boolean(),
      }),
    }),

    iconUpload: z.object({
      success: z.boolean(),
      data: z.object({
        icon_url: z.string(),
      }),
    }),
  },
};
