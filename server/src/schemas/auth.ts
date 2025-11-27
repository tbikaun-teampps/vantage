import { z } from "zod";
import { SubscriptionTier } from "../types/entities/profiles";
import { UserCompanyRoleEnum } from "./company";

export const SubscriptionTierEnum: SubscriptionTier[] = [
  "demo",
  "consultant",
  "enterprise",
  "interviewee",
];

// SignIn endpoint schemas
export const SignInBodySchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

const ProfileSchema = z.object({
   id: z.string(),
   subscription_tier: z.enum(SubscriptionTierEnum),
   subscription_features: z.any(),
   full_name: z.string().nullable(),
   email: z.string(),
   is_admin: z.boolean(),
   is_internal: z.boolean(),
   onboarded: z.boolean(),
   onboarded_at: z.string().nullable(),
   updated_at: z.string(),
 });

const SignInData = z.object({
  user: z.object({
    id: z.string(),
    email: z.email(),
  }),
  profile: ProfileSchema,
  permissions: z.object({
    canAccessMainApp: z.boolean(),
    features: z.array(z.string()),
    maxCompanies: z.number(),
  }),
  companies: z.array(
    z.object({
      id: z.string(),
      role: z.enum(UserCompanyRoleEnum),
    })
  ),
  session: z.object({
    access_token: z.string(),
    refresh_token: z.string(),
    expires_at: z.number(),
  }),
});

export const SignInResponseSchema = z.object({
  success: z.boolean(),
  data: SignInData.optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

// SignOut endpoint schemas
export const SignOutResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  error: z.string().optional(),
});

// Refresh endpoint schemas
export const RefreshBodySchema = z.object({
  refresh_token: z.string(),
});

const RefreshData = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_at: z.number(),
});

export const RefreshResponseSchema = z.object({
  success: z.boolean(),
  data: RefreshData.optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

// Session endpoint schemas
const SessionData = z.object({
  user: z.object({
    id: z.string(),
    email: z.string(),
  }),
  profile: ProfileSchema,
  permissions: z.object({
    canAccessMainApp: z.boolean(),
    features: z.array(z.string()),
    maxCompanies: z.number(),
  }),
  companies: z.array(
    z.object({
      id: z.string(),
      role: z.enum(UserCompanyRoleEnum),
    })
  ),
});

export const SessionResponseSchema = z.object({
  success: z.boolean(),
  data: SessionData.optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

// Interview token endpoint schemas
export const InterviewTokenBodySchema = z.object({
  interviewId: z.number(),
  email: z.string(),
  accessCode: z.string(),
});

export const InterviewTokenResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    token: z.string(),
  }),
});

// Export all schemas as a collection
export const AuthSchemas = {
  // SignIn
  SignInBodySchema,
  SignInResponseSchema,

  // SignOut
  SignOutResponseSchema,

  // Refresh
  RefreshBodySchema,
  RefreshResponseSchema,

  // Session
  SessionResponseSchema,

  // Interview token
  InterviewTokenBodySchema,
  InterviewTokenResponseSchema,
};
