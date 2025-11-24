import type { paths } from ".";

export type SignInBodyData =
  paths["/auth/signin"]["post"]["requestBody"]["content"]["application/json"];
export type SignInResponse =
  paths["/auth/signin"]["post"]["responses"]["200"]["content"]["application/json"];

export type RefreshTokenBodyData =
  paths["/auth/refresh"]["post"]["requestBody"]["content"]["application/json"];
export type RefreshTokenResponse =
  paths["/auth/refresh"]["post"]["responses"]["200"]["content"]["application/json"];

export type ValidateSessionResponse =
  paths["/auth/session"]["get"]["responses"]["200"]["content"]["application/json"];

export type GetExternalInterviewTokenBodyData =
  paths["/auth/external/interview-token"]["post"]["requestBody"]["content"]["application/json"];
export type GetExternalInterviewTokenResponse =
  paths["/auth/external/interview-token"]["post"]["responses"]["200"]["content"]["application/json"];

// User-related types
export type UserCompanies = NonNullable<SignInResponse["data"]>["companies"];
export type UserProfile = NonNullable<SignInResponse["data"]>["profile"];
export type UserPermissions = NonNullable<
  SignInResponse["data"]
>["permissions"];
export type AuthUser = NonNullable<SignInResponse["data"]>["user"];
type UserSession = NonNullable<SignInResponse["data"]>["session"];

export type TokenData = UserSession;
export type SubscriptionTier = Exclude<
  UserProfile["subscription_tier"],
  "interviewee"
>;
