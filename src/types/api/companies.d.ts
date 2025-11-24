import type { paths } from ".";

export type GetCompaniesResponseData =
  paths["/companies"]["get"]["responses"][200]["content"]["application/json"]["data"];

export type GetCompanyByIdResponseData =
  paths["/companies/{companyId}"]["get"]["responses"][200]["content"]["application/json"]["data"];

export type CreateCompanyBodyData =
  paths["/companies"]["post"]["requestBody"]["content"]["application/json"];

export type CreateCompanyResponseData =
  paths["/companies"]["post"]["responses"][200]["content"]["application/json"]["data"];

export type UpdateCompanyBodyData = NonNullable<
  paths["/companies/{companyId}"]["put"]["requestBody"]
>["content"]["application/json"];

export type UpdateCompanyResponseData =
  paths["/companies/{companyId}"]["put"]["responses"][200]["content"]["application/json"]["data"];

export type GetCompanyTreeResponseData =
  paths["/companies/{companyId}/tree"]["get"]["responses"][200]["content"]["application/json"]["data"];

export type GetCompanyEntitiesParams =
  paths["/companies/{companyId}/entities"]["get"]["parameters"]["query"];

export type GetCompanyEntitiesResponseData =
  paths["/companies/{companyId}/entities"]["get"]["responses"][200]["content"]["application/json"]["data"];

export type CreateCompanyEntityParams =
  paths["/companies/{companyId}/entities"]["post"]["parameters"]["query"];

export type CreateCompanyEntityBodyData = NonNullable<
  paths["/companies/{companyId}/entities"]["post"]["requestBody"]
>["content"]["application/json"];

export type CreateCompanyEntityResponseData =
  paths["/companies/{companyId}/entities"]["post"]["responses"][200]["content"]["application/json"]["data"];

export type UpdateCompanyEntityParams =
  paths["/companies/{companyId}/entities/{entityId}"]["put"]["parameters"]["query"];

export type UpdateCompanyEntityBodyData = NonNullable<
  paths["/companies/{companyId}/entities/{entityId}"]["put"]["requestBody"]
>["content"]["application/json"];

export type UpdateCompanyEntityResponseData =
  paths["/companies/{companyId}/entities/{entityId}"]["put"]["responses"][200]["content"]["application/json"]["data"];

export type DeleteCompanyEntityParams =
  paths["/companies/{companyId}/entities/{entityId}"]["delete"]["parameters"]["query"];

// --- TEAM ---

export type GetTeamResponseData =
  paths["/companies/{companyId}/team"]["get"]["responses"][200]["content"]["application/json"]["data"];

export type AddTeamMemberBodyData =
  paths["/companies/{companyId}/team"]["post"]["requestBody"]["content"]["application/json"];

export type AddTeamMemberResponseData =
  paths["/companies/{companyId}/team"]["post"]["responses"][200]["content"]["application/json"]["data"];

export type UpdateTeamMemberBodyData =
  paths["/companies/{companyId}/team/{userId}"]["put"]["requestBody"]["content"]["application/json"];

export type UpdateTeamMemberResponseData =
  paths["/companies/{companyId}/team/{userId}"]["put"]["responses"][200]["content"]["application/json"]["data"];

// --- MISC ---

export type GetCompanyInterviewResponseActionsResponseData =
  paths["/companies/{companyId}/actions"]["get"]["responses"][200]["content"]["application/json"]["data"];

export type UploadCompanyIconResponseData =
  paths["/companies/{companyId}/icon"]["post"]["responses"][200]["content"]["application/json"]["data"];

export type UpdateCompanyBrandingBodyData =
  paths["/companies/{companyId}/branding"]["patch"]["requestBody"]["content"]["application/json"];

export type UpdateCompanyBrandingResponseData =
  paths["/companies/{companyId}/branding"]["patch"]["responses"][200]["content"]["application/json"]["data"];

export type CompanyImportResponseData =
  paths["/companies/{companyId}/import"]["post"]["responses"][200]["content"]["application/json"]["data"];

// --- CONTACTS ---

export type GetEntityContactsResponseData =
  paths["/companies/{companyId}/contacts/{entityType}/{entityId}"]["get"]["responses"][200]["content"]["application/json"]["data"];

export type LinkContactToEntityBodyData =
  paths["/companies/{companyId}/contacts/{entityType}/{entityId}"]["post"]["requestBody"]["content"]["application/json"];

export type LinkContactToEntityResponseData =
  paths["/companies/{companyId}/contacts/{entityType}/{entityId}"]["post"]["responses"][200]["content"]["application/json"]["data"];

export type UpdateContactBodyData = NonNullable<
  paths["/companies/{companyId}/contacts/{contactId}"]["put"]["requestBody"]
>["content"]["application/json"];

export type UpdateContactResponseData =
  paths["/companies/{companyId}/contacts/{contactId}"]["put"]["responses"][200]["content"]["application/json"]["data"];

export type GetContactsByRoleResponseData =
  paths["/companies/{companyId}/contacts/roles/{roleId}"]["get"]["responses"][200]["content"]["application/json"]["data"];

// --- DERIVED ---
export type CompanyUserRole = GetCompaniesResponseData[number]["role"];
export type TeamMember = GetTeamResponseData[number];

export type Company = GetCompanyByIdResponseData;

export type Contact = NonNullable<GetEntityContactsResponseData>[number];

export type CompanyTree = GetCompanyTreeResponseData;

// Derived tree node types from API response
export type BusinessUnitNode = CompanyTree["business_units"][number];
export type RegionNode = BusinessUnitNode["regions"][number];
export type SiteNode = RegionNode["sites"][number];
export type AssetGroupNode = SiteNode["asset_groups"][number];
export type WorkGroupNode = AssetGroupNode["work_groups"][number];
export type RoleNode = WorkGroupNode["roles"][number];
export type ReportingRoleNode = RoleNode["reporting_roles"][number];

// Union type for any tree node
export type AnyTreeNode =
  | (CompanyTree & { type: "company" })
  | (BusinessUnitNode & { type: "business_unit" })
  | (RegionNode & { type: "region" })
  | (SiteNode & { type: "site" })
  | (AssetGroupNode & { type: "asset_group" })
  | (WorkGroupNode & { type: "work_group" })
  | (RoleNode & { type: "role" });

export type AnyTreeNodeNoType =
  | CompanyTree
  | BusinessUnitNode
  | RegionNode
  | SiteNode
  | AssetGroupNode
  | WorkGroupNode
  | RoleNode
  | ReportingRoleNode;

// Helper type for accessing tree node children (all properties optional)
export type TreeNodeWithChildren = {
  business_units?: BusinessUnitNode[];
  regions?: RegionNode[];
  sites?: SiteNode[];
  asset_groups?: AssetGroupNode[];
  work_groups?: WorkGroupNode[];
  roles?: RoleNode[];
  reporting_roles?: ReportingRoleNode[];
};

// Union type for tree nodes excluding company (creatable nodes)
export type CreateableTreeNode = Exclude<
  AnyTreeNode,
  CompanyTree & { type: "company" }
>;

// Tree structure interfaces
// TODO: change this to hyphen variant derived from api?
export type CompanyTreeNodeType = AnyTreeNode["type"];

// We don't want to allow "company" type creation
export type CreateableTreeNodeType = Exclude<CompanyTreeNodeType, "company">;

// Contactable entity types are those that can have contacts associated with them
export type ContactableEntityType = CompanyTreeNodeType;

// Helper type for entity IDs (company uses string, others use number)
export type EntityId<T extends ContactableEntityType> = T extends "company"
  ? string
  : number;


export type RoleLevelEnum = NonNullable<RoleNode['level']>

// Entity type aliases derived from the discriminated union
// These are automatically generated from the server's Zod schema via OpenAPI
export type BusinessUnitEntity = Extract<
  GetCompanyEntitiesResponseData[number],
  { entity_type: "business_unit" }
>;

export type RegionEntity = Extract<
  GetCompanyEntitiesResponseData[number],
  { entity_type: "region" }
>;

export type SiteEntity = Extract<
  GetCompanyEntitiesResponseData[number],
  { entity_type: "site" }
>;

export type AssetGroupEntity = Extract<
  GetCompanyEntitiesResponseData[number],
  { entity_type: "asset_group" }
>;

export type WorkGroupEntity = Extract<
  GetCompanyEntitiesResponseData[number],
  { entity_type: "work_group" }
>;

export type RoleEntity = Extract<
  GetCompanyEntitiesResponseData[number],
  { entity_type: "role" }
>;