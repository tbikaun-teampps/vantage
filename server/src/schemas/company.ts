import { Type } from "@sinclair/typebox";
import { commonResponseSchemas } from "./common.js";

const companyItem = Type.Object({
  id: Type.String(),
  name: Type.String(),
  code: Type.String(),
  description: Type.String(),
  created_at: Type.String(),
  updated_at: Type.String(),
  is_demo: Type.Boolean(),
  icon_url: Type.Optional(Type.String()),
  branding: Type.Object({
    primary: Type.Optional(Type.String()),
    secondary: Type.Optional(Type.String()),
    accent: Type.Optional(Type.String()),
  }),
});

const companyWithRoleItem = Type.Object({
  id: Type.String(),
  name: Type.String(),
  code: Type.String(),
  description: Type.String(),
  created_at: Type.String(),
  updated_at: Type.String(),
  role: Type.String(),
  is_demo: Type.Boolean(),
  icon_url: Type.Optional(Type.String()),
  branding: Type.Object({
    primary: Type.Optional(Type.String()),
    secondary: Type.Optional(Type.String()),
    accent: Type.Optional(Type.String()),
  }),
});

export const companySchemas = {
  params: {
    companyId: Type.Object({
      companyId: Type.String(),
    }),

    entityParams: Type.Object({
      companyId: Type.String(),
      entityId: Type.String(),
    }),

    contactParams: Type.Object({
      companyId: Type.String(),
      entityType: Type.Union([
        Type.Literal("company"),
        Type.Literal("business-unit"),
        Type.Literal("region"),
        Type.Literal("site"),
        Type.Literal("asset-group"),
        Type.Literal("work-group"),
        Type.Literal("role"),
      ]),
      entityId: Type.String(),
    }),

    contactDeleteParams: Type.Object({
      companyId: Type.String(),
      entityType: Type.Union([
        Type.Literal("company"),
        Type.Literal("business-unit"),
        Type.Literal("region"),
        Type.Literal("site"),
        Type.Literal("asset-group"),
        Type.Literal("work-group"),
        Type.Literal("role"),
      ]),
      entityId: Type.String(),
      contactId: Type.String(),
    }),

    contactUpdateParams: Type.Object({
      companyId: Type.String(),
      contactId: Type.String(),
    }),

    teamMemberParams: Type.Object({
      companyId: Type.String(),
      userId: Type.String(),
    }),
  },

  querystring: {
    entityType: Type.Object(
      {
        type: Type.Union([
          Type.Literal("business-units"),
          Type.Literal("regions"),
          Type.Literal("sites"),
          Type.Literal("asset-groups"),
          Type.Literal("work-groups"),
          Type.Literal("roles"),
        ]),
      },
      { additionalProperties: false }
    ),
  },

  body: {
    createCompany: Type.Object(
      {
        name: Type.String(),
        code: Type.Optional(Type.String()),
        description: Type.Optional(Type.String()),
      },
      { additionalProperties: false }
    ),

    updateCompany: Type.Object(
      {
        name: Type.Optional(Type.String()),
        code: Type.Optional(Type.String()),
        description: Type.Optional(Type.String()),
      },
      { additionalProperties: false }
    ),

    createContact: Type.Object(
      {
        full_name: Type.String(),
        email: Type.String({ format: "email" }),
        phone: Type.Optional(Type.String()),
        title: Type.Optional(Type.String()),
      },
      { additionalProperties: false }
    ),

    updateContact: Type.Object(
      {
        full_name: Type.Optional(Type.String()),
        email: Type.Optional(Type.String({ format: "email" })),
        phone: Type.Optional(Type.String()),
        title: Type.Optional(Type.String()),
      },
      { additionalProperties: false }
    ),

    addTeamMember: Type.Object(
      {
        email: Type.String({ format: "email" }),
        role: Type.Union([
          Type.Literal("owner"),
          Type.Literal("admin"),
          Type.Literal("viewer"),
          Type.Literal("interviewee"),
        ]),
      },
      { additionalProperties: false }
    ),

    updateTeamMember: Type.Object(
      {
        role: Type.Union([
          Type.Literal("owner"),
          Type.Literal("admin"),
          Type.Literal("viewer"),
          Type.Literal("interviewee"),
        ]),
      },
      { additionalProperties: false }
    ),
  },

  responses: {
    company: companyWithRoleItem,

    companyList: Type.Object({
      success: Type.Boolean(),
      data: Type.Array(companyWithRoleItem),
    }),

    companyWithRoleDetail: Type.Object({
      success: Type.Boolean(),
      data: companyWithRoleItem,
    }),

    companyDetail: Type.Object({
      success: Type.Boolean(),
      data: companyItem,
    }),

    entityList: Type.Object({
      success: Type.Boolean(),
      data: Type.Array(Type.Object({}, { additionalProperties: true })),
    }),

    companyTree: Type.Object({
      success: Type.Boolean(),
      data: Type.Object({}, { additionalProperties: true }),
    }),

    contactList: Type.Object({
      success: Type.Boolean(),
      data: Type.Array(
        Type.Object({
          id: Type.Number(),
          full_name: Type.String(),
          email: Type.String(),
          phone: Type.String(),
          title: Type.String(),
        })
      ),
    }),

    contactDetail: Type.Object({
      success: Type.Boolean(),
      data: Type.Object({
        id: Type.Number(),
        full_name: Type.String(),
        email: Type.String(),
        phone: Type.String(),
        title: Type.String(),
        company_id: Type.String(),
      }),
    }),

    teamMemberList: Type.Object({
      success: Type.Boolean(),
      data: Type.Array(
        Type.Object({
          id: Type.Number(),
          user_id: Type.String(),
          company_id: Type.String(),
          role: Type.String(),
          created_at: Type.String(),
          updated_at: Type.String(),
          user: Type.Object({
            id: Type.String(),
            email: Type.String(),
            full_name: Type.Union([Type.String(), Type.Null()]),
          }),
        })
      ),
    }),

    teamMemberDetail: Type.Object({
      success: Type.Boolean(),
      data: Type.Object({
        id: Type.Number(),
        user_id: Type.String(),
        company_id: Type.String(),
        role: Type.String(),
        created_at: Type.String(),
        updated_at: Type.String(),
        user: Type.Object({
          id: Type.String(),
          email: Type.String(),
          full_name: Type.Union([Type.String(), Type.Null()]),
        }),
      }),
    }),

    iconUpload: Type.Object({
      success: Type.Boolean(),
      data: Type.Object({
        icon_url: Type.String(),
      }),
    }),

    ...commonResponseSchemas.responses,
  },
};
