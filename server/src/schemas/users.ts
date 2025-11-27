import { z } from "zod";

// Params schema for subscription tier
export const SubscriptionTierParamsSchema = z.object({
  subscription_tier: z.enum(["demo", "consultant", "enterprise"]),
});

// Body schema for updating profile
export const UpdateProfileBodySchema = z.object({
  full_name: z.string().optional(),
  // Add other updatable profile fields as needed
});

// Response schema for GET /me - user profile
export const UserProfileResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string().optional(),
    role: z.string().optional(),
  }),
  profile: z.object({
    id: z.string(),
    email: z.string(),
    full_name: z.string().nullable(),
    is_admin: z.boolean(),
    is_internal: z.boolean(),
    subscription_tier: z.string(),
    subscription_features: z.any(), // Json type - flexible
    onboarded: z.boolean(),
    onboarded_at: z.string().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
  }),
});

// Simple success response schema
export const SuccessResponseSchema = z.object({
  success: z.boolean(),
});

// Response schema for profile update
export const UpdateProfileResponseSchema = z.object({
  success: z.boolean(),
  profile: z.any(), // Using z.any() for flexible profile object
});

// Export all schemas as a collection
export const UsersSchemas = {
  SubscriptionTierParamsSchema,
  UpdateProfileBodySchema,
  UserProfileResponseSchema,
  SuccessResponseSchema,
  UpdateProfileResponseSchema,
};
