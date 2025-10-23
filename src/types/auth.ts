/**
 * Authentication and User Management Types
 * All types related to user authentication, profiles, and sessions
 */

import type { DatabaseRow, Enums } from "./utils";

// Database types
export type UserProfile = DatabaseRow<"profiles">;

// Subscription types (using database enum)
export type SubscriptionTier = Enums["subscription_tier_enum"];

interface SubscriptionFeatures {
  maxCompanies: number;
}

export interface SubscriptionPlan {
  name: string;
  description: string;
  icon: React.ComponentType;
  iconColor: string;
  price: string;
  subtitle: string;
  color: string;
  highlights: string[];
  features: SubscriptionFeatures;
}

// Token storage (replaces Supabase Session)
export interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_at: number; // Unix timestamp in seconds
}

// Simplified user type (from backend, not Supabase User)
export interface AuthUser {
  id: string;
  email: string;
}

export type UserRole = "owner" | "admin" | "viewer" | "interviewee";

// User company role (from user_companies table)
export interface UserCompany {
  id: string;
  role: Exclude<UserRole, "interviewee">;
}

// Backend auth response types
export interface BackendAuthResponse {
  success: boolean;
  data?: {
    user: AuthUser;
    profile: UserProfile;
    permissions: UserPermissions;
    companies: UserCompany[];
    session: {
      access_token: string;
      refresh_token: string;
    };
  };
  error?: string;
  message?: string;
}

// Auth state (updated for backend auth)
export interface AuthState {
  user: AuthUser | null;
  session: TokenData | null;
  profile: UserProfile | null;
  permissions: UserPermissions | null;
  companies: UserCompany[];
  loading: boolean;
  authenticated: boolean;
}

// Authentication actions (streamlined - profile methods moved to React Query)
export interface AuthActions {
  setUser: (user: AuthUser | null) => void;
  setSession: (session: TokenData | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;

  signIn: (
    email: string,
    password: string
  ) => Promise<{ error?: string; redirectPath?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;

  initialize: () => Promise<void>;
}

// Complete auth store interface
export interface AuthStore extends AuthState, AuthActions {}

export interface UserPermissions {
  canAccessMainApp: boolean;
  features: string[];
  maxCompanies: number;
}
