import type { paths } from ".";

// --- SHARED ROLES ---

export type GetAllSharedRolesResponseData =
  paths["/shared/roles"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

export type CreateSharedRoleBodyData =
  paths["/shared/roles"]["post"]["requestBody"]["content"]["application/json"];

export type CreateSharedRoleResponseData =
  paths["/shared/roles"]["post"]["responses"]["201"]["content"]["application/json"]["data"];

export type UpdateSharedRoleBodyData = NonNullable<
  paths["/shared/roles/{roleId}"]["put"]["requestBody"]
>["content"]["application/json"];

export type UpdateSharedRoleResponseData =
  paths["/shared/roles/{roleId}"]["put"]["responses"]["200"]["content"]["application/json"]["data"];

// --- SHARED MEASUREMENT DEFINITIONS ---

export type GetMeasurementDefinitionsResponseData =
  paths["/shared/measurement-definitions"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

export type GetMeasurementDefinitionByIdResponseData =
  paths["/shared/measurement-definitions/{id}"]["get"]["responses"]["200"]["content"]["application/json"]["data"];
