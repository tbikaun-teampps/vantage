import type { paths } from ".";

export type SubmitFeedbackBodyData =
  paths["/feedback"]["post"]["requestBody"]["content"]["application/json"];

export type SubmitFeedbackResponse =
  paths["/feedback"]["post"]["responses"]["200"]["content"]["application/json"];

export type FeedbackType = NonNullable<SubmitFeedbackBodyData["type"]>;
