import type { paths } from ".";

export type UpdateProfileBodyData = NonNullable<
  paths["/users/profile"]["put"]["requestBody"]
>["content"]["application/json"];

export type UpdateProfileResponseData =
  paths["/users/profile"]["put"]["responses"]["200"]["content"]["application/json"];
