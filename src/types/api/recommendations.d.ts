import type { paths } from ".";

export type GetRecommendationsResponseData =
  paths["/companies/{companyId}/recommendations"]["get"]["responses"]["200"]["content"]["application/json"]["data"];