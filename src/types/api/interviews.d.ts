import type { paths } from ".";

export type InterviewSummaryResponseData =
  paths["/interviews/{interviewId}/summary"]["get"]["responses"]["200"]["content"]["application/json"]["data"];
