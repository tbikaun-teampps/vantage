/**
 * Authentication and User Management Types
 * All types related to user authentication, profiles, and sessions
 */

import type {
  TokenData,
  UserCompanies,
  UserProfile,
  UserPermissions,
  AuthUser,
} from "./api/auth";

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

// Auth state
interface AuthState {
  user: AuthUser | null;
  session: TokenData | null;
  profile: UserProfile | null;
  permissions: UserPermissions | null;
  companies: UserCompanies;
  loading: boolean;
  authenticated: boolean;
}

// Authentication actions
interface AuthActions {
  setUser: (user: AuthUser | null) => void;
  setSession: (session: TokenData | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setPermissions: (permissions: UserPermissions | null) => void;
  setCompanies: (companies: UserCompanies) => void;

  signIn: (
    email: string,
    password: string
  ) => Promise<{ error?: string; redirectPath?: string }>;
  signOut: () => Promise<void>;
  // resetPassword: (email: string) => Promise<{ error?: string }>;

  initialize: () => Promise<void>;
}

// Complete auth store interface
export interface AuthStore extends AuthState, AuthActions {}
