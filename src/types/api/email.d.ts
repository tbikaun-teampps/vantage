import type { paths } from ".";

export type SendInterviewReminderResponse =
  paths["/emails/send-interview-reminder"]["post"]["responses"]["200"]["content"]["application/json"];

export type SendInterviewSummaryResponse =
  paths["/emails/send-interview-summary"]["post"]["responses"]["200"]["content"]["application/json"];
