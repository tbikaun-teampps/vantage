import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface UserCompany {
  id: string;
  role: "owner" | "admin" | "viewer" | "interviewee";
}

interface SignInResponse {
  success: boolean;
  data?: {
    user: {
      id: string;
      email: string;
    };
    profile: Profile;
    permissions: {
      canAccessMainApp: boolean;
      features: string[];
      maxCompanies: number;
    };
    companies: UserCompany[];
    session: {
      access_token: string;
      refresh_token: string;
      expires_at: number;
    };
  };
  error?: string;
  message?: string;
}

interface ValidateSessionResponse {
  success: boolean;
  data?: {
    user: {
      id: string;
      email: string;
    };
    profile: Profile;
    permissions: {
      canAccessMainApp: boolean;
      features: string[];
      maxCompanies: number;
    };
    companies: UserCompany[];
  };
  error?: string;
  message?: string;
}

const SUBSCRIPTION_FEATURES = {
  demo: {
    maxCompanies: 0,
    features: ["interviews", "assessments", "basic_analytics"],
  },
  consultant: {
    maxCompanies: 999,
    features: [
      "dashboard",
      "interviews",
      "assessments",
      "analytics",
      "recommendations",
      "advanced_features",
      "create_company",
      "select_company",
      "custom_branding",
    ],
  },
  enterprise: {
    maxCompanies: 1,
    features: [
      "dashboard",
      "interviews",
      "assessments",
      "analytics",
      "recommendations",
      "advanced_features",
      "custom_branding",
    ],
  },
  interviewee: {
    maxCompanies: 0,
    features: ["interview_access_only"],
  },
};

export class AuthService {
  private supabase: SupabaseClient<Database>;
  private supabaseAdmin: SupabaseClient<Database>;

  constructor(
    supabaseClient: SupabaseClient<Database>,
    supabaseAdminClient: SupabaseClient<Database>
  ) {
    this.supabase = supabaseClient;
    this.supabaseAdmin = supabaseAdminClient;
  }

  /**
   * Sign in a user with email and password
   * Validates credentials, checks subscription tier, and returns enriched user data
   * Blocks interviewee users from accessing the main application
   */
  async signIn(email: string, password: string): Promise<SignInResponse> {
    // Authenticate with Supabase
    const { data: authData, error: authError } =
      await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError || !authData.user || !authData.session) {
      return {
        success: false,
        error: "Authentication Failed",
        message: authError?.message || "Invalid email or password",
      };
    }

    // Fetch user profile
    const { data, error: profileError } = await this.supabase
      .from("profiles")
      .select()
      .eq("id", authData.user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Failed to fetch profile:", profileError);
      return {
        success: false,
        error: "Profile Fetch Failed",
        message: "Unable to retrieve user profile",
      };
    }

    if (!data) {
      return {
        success: false,
        error: "Profile Not Found",
        message: "User profile does not exist",
      };
    }

    // Type assertion: database has all Profile fields including is_admin
    const profile = data as Profile;

    // CRITICAL: Block interviewee users from main app access
    if (profile.subscription_tier === "interviewee") {
      // Sign them out immediately
      await this.supabase.auth.signOut();

      return {
        success: false,
        error: "Access Denied",
        message: "This account is not authorized to access the application",
      };
    }

    // Build permissions object based on subscription tier
    const tierConfig =
      SUBSCRIPTION_FEATURES[
        profile.subscription_tier as keyof typeof SUBSCRIPTION_FEATURES
      ] || SUBSCRIPTION_FEATURES.demo;

    const permissions = {
      canAccessMainApp: true,
      features: tierConfig.features,
      maxCompanies: tierConfig.maxCompanies,
    };

    // Fetch user's companies with roles
    const { data: userCompanies, error: companiesError } = await this.supabase
      .from("user_companies")
      .select("company_id, role, companies!inner()")
      .eq("user_id", authData.user.id)
      .neq("role", "interviewee")
      .eq("companies.is_deleted", false);

    console.log("User companies data:", userCompanies);

    if (companiesError) {
      console.error("Failed to fetch user companies:", companiesError);
      // Don't fail auth if companies fetch fails, just return empty array
    }

    const companies: UserCompany[] = (userCompanies || []).map((uc) => ({
      id: uc.company_id,
      role: uc.role,
    }));

    // Validate session has expires_at
    if (
      authData.session.expires_at === undefined ||
      authData.session.expires_at === null
    ) {
      console.error("Session missing expires_at timestamp");
      return {
        success: false,
        error: "Authentication Failed",
        message: "Invalid session data received from authentication provider",
      };
    }

    // Return enriched response
    return {
      success: true,
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email || email,
        },
        profile,
        permissions,
        companies,
        session: {
          access_token: authData.session.access_token,
          refresh_token: authData.session.refresh_token,
          expires_at: authData.session.expires_at,
        },
      },
    };
  }

  /**
   * Sign out a user
   * Invalidates the user's session token using admin client
   * @param token - The user's access token to invalidate
   */
  async signOut(
    token: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const { error } = await this.supabaseAdmin.auth.admin.signOut(token);

      if (error) {
        console.error("Sign out error:", error);
        return {
          success: false,
          error: "Sign Out Failed",
          message: error.message,
        };
      }

      return {
        success: true,
        message: "Successfully signed out",
      };
    } catch (err) {
      console.error("Unexpected sign out error:", err);
      return {
        success: false,
        error: "Sign Out Failed",
        message: "An unexpected error occurred during sign out",
      };
    }
  }

  /**
   * Refresh an access token using a refresh token
   * @param refreshToken - The refresh token to use for getting a new access token
   */
  async refreshToken(refreshToken: string): Promise<{
    success: boolean;
    data?: {
      access_token: string;
      refresh_token: string;
      expires_at: number;
    };
    error?: string;
    message?: string;
  }> {
    try {
      const { data, error } = await this.supabaseAdmin.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error || !data.session) {
        console.error("Token refresh error:", error);
        return {
          success: false,
          error: "Token Refresh Failed",
          message: error?.message || "Unable to refresh token",
        };
      }

      // Supabase always provides expires_at, but we validate it exists
      if (
        data.session.expires_at === undefined ||
        data.session.expires_at === null ||
        typeof data.session.expires_at !== "number"
      ) {
        console.error(
          "Token refresh succeeded but expires_at is missing or invalid"
        );
        return {
          success: false,
          error: "Token Refresh Failed",
          message: "Invalid session data received from authentication provider",
        };
      }

      return {
        success: true,
        data: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at,
        },
      };
    } catch (err) {
      console.error("Unexpected refresh token error:", err);
      return {
        success: false,
        error: "Token Refresh Failed",
        message: "An unexpected error occurred during token refresh",
      };
    }
  }

  /**
   * Validate current session and return enriched user data
   * Re-checks authorization to ensure user still has access
   * Does not return session tokens - client keeps existing tokens
   * @param token - The user's access token to validate
   */
  async validateSession(token: string): Promise<ValidateSessionResponse> {
    try {
      // Validate the token
      const {
        data: { user },
        error: authError,
      } = await this.supabase.auth.getUser(token);

      if (authError || !user) {
        return {
          success: false,
          error: "Invalid Session",
          message: authError?.message || "Session is invalid or expired",
        };
      }

      // Fetch user profile
      const { data, error: profileError } = await this.supabase
        .from("profiles")
        .select()
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Failed to fetch profile:", profileError);
        return {
          success: false,
          error: "Profile Fetch Failed",
          message: "Unable to retrieve user profile",
        };
      }

      if (!data) {
        return {
          success: false,
          error: "Profile Not Found",
          message: "User profile does not exist",
        };
      }

      // Type assertion: database has all Profile fields including is_admin
      const profile = data as Profile;

      // CRITICAL: Re-validate authorization - block interviewee users
      if (profile.subscription_tier === "interviewee") {
        return {
          success: false,
          error: "Access Denied",
          message: "This account is not authorized to access the application",
        };
      }

      // Build permissions object based on subscription tier
      const tierConfig =
        SUBSCRIPTION_FEATURES[
          profile.subscription_tier as keyof typeof SUBSCRIPTION_FEATURES
        ] || SUBSCRIPTION_FEATURES.demo;

      const permissions = {
        canAccessMainApp: true,
        features: tierConfig.features,
        maxCompanies: tierConfig.maxCompanies,
      };

      // Fetch user's companies with roles
      const { data: userCompanies, error: companiesError } = await this.supabase
        .from("user_companies")
        .select("company_id, role, companies!inner()")
        .eq("user_id", user.id)
        .neq("role", "interviewee")
        .eq("companies.is_deleted", false);

      if (companiesError) {
        console.error("Failed to fetch user companies:", companiesError);
        // Don't fail auth if companies fetch fails, just return empty array
      }

      const companies: UserCompany[] = (userCompanies || []).map((uc) => ({
        id: uc.company_id,
        role: uc.role,
      }));

      // Return enriched response without session tokens
      // Token refresh is handled by axios interceptor, not validateSession
      return {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email || "",
          },
          profile,
          permissions,
          companies,
        },
      };
    } catch (err) {
      console.error("Unexpected session validation error:", err);
      return {
        success: false,
        error: "Session Validation Failed",
        message: "An unexpected error occurred during session validation",
      };
    }
  }

  // async resetPassword() {}
}
