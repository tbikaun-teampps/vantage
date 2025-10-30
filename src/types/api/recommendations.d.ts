import type { paths } from ".";

export type RecommendationsResponseData =
  paths["/companies/{companyId}/recommendations"]["get"]["responses"]["200"]["content"]["application/json"]["data"];

export type RecommendationListItem = RecommendationsResponseData[number];
