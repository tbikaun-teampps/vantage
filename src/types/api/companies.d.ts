import type { paths, components } from ".";

export type Company = components["schemas"]["company"];

export type CompanyList = components["schemas"]["companyList"];

export type CompanyListResponseData =
  paths["/companies"]["get"]["responses"][200]["content"]["application/json"]["data"];
export type CompanyResponseData =
  paths["/companies/{companyId}"]["get"]["responses"][200]["content"]["application/json"]["data"];

export type CompanyIconDeleteResponseData =
  paths["/companies/{companyId}/icon"]["delete"]["responses"][200]["content"]["application/json"]["data"];

export type CompanyIconPostResponseData =
  paths["/companies/{companyId}/icon"]["post"]["responses"][200]["content"]["application/json"]["data"];

// TODO: need to constrain the output from the server to what is required by the UI
// export type CompanyInterviewResponseActions =
//   paths["/companies/{companyId}/actions"]["get"]["responses"][200]["content"]["application/json"]["data"];

export type CompanyImportResponseData =
  paths["/companies/{companyId}/import"]["post"]["responses"][200]["content"]["application/json"]["data"];

// Company Entity Types

export type EntityListResponseData =
  paths["/companies/{companyId}/entities"]["get"]["responses"][200]["content"]["application/json"]["data"];

export type EntityPostResponseData =
  paths["/companies/{companyId}/entities"]["post"]["responses"][200]["content"]["application/json"]["data"];

export type EntityPutResponseData =
  paths["/companies/{companyId}/entities/{entityId}"]["put"]["responses"][200]["content"]["application/json"]["data"];

export type EntityDeleteResponseData =
  paths["/companies/{companyId}/entities/{entityId}"]["delete"]["responses"][200]["content"]["application/json"]["data"];

// Team Management Types

export type TeamListResponseData =
  paths["/companies/{companyId}/team"]["get"]["responses"][200]["content"]["application/json"]["data"];

export type TeamMemberPostResponseData =
  paths["/companies/{companyId}/team"]["post"]["responses"][200]["content"]["application/json"]["data"];

export type TeamMemberPutResponseData =
  paths["/companies/{companyId}/team/{memberId}"]["put"]["responses"][200]["content"]["application/json"]["data"];

export type TeamMemberDeleteResponseData =
  paths["/companies/{companyId}/team/{memberId}"]["delete"]["responses"][200]["content"]["application/json"]["data"];
