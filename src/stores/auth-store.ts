import { create } from "zustand";
import { queryClient } from "@/lib/query-client";
import { TokenManager } from "@/lib/auth/token-manager";
import { authApi, sessionToTokenData } from "@/lib/api/auth";
import type { AuthStore } from "@/types/auth";

let isInitialized = false;

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,
  profile: null,
  permissions: null,
  companies: [],
  loading: true,
  authenticated: false,

  setUser: (user) => set({ user, authenticated: !!user }),
  setSession: (session) => set({ session, authenticated: !!session }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  setPermissions: (permissions) => set({ permissions }),
  setCompanies: (companies) => set({ companies }),

  signIn: async (email: string, password: string) => {
    try {
      const response = await authApi.signIn(email, password);

      if (!response.success || !response.data) {
        return { error: response.message || "Sign in failed" };
      }

      const { user, profile, permissions, companies, session } = response.data;

      // Store tokens in TokenManager
      const tokenData = sessionToTokenData(session);
      TokenManager.setTokens(tokenData);

      // Update store with enriched data
      set({
        user,
        profile,
        permissions,
        companies,
        session: tokenData,
        authenticated: true,
        loading: false,
      });

      // If user is an enterprise user, redirect to their company, they do not have company selection
      // as this is set up for them.
      if (profile.subscription_tier === "enterprise") {
        // Enterprise users should only belong to one company
        if (companies.length === 0) {
          // User exists but company is not set up yet, redirect to a dedicated page
          return { redirectPath: `/enterprise-welcome` };
        } else {
          // Redirect to the first company dashboard; they should only have one.
          const companyId = companies[0].id;
          return { redirectPath: `/${companyId}/dashboard` };
        }
      }

      return { redirectPath: "/select-company" };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Sign in failed";
      return { error: message };
    }
  },

  signOut: async () => {
    try {
      // Call backend to invalidate session
      await authApi.signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      // Always clear local state regardless of backend response
      TokenManager.clearTokens();

      // Logout from Canny (commented out for now)
      // if (window.Canny) {
      //   window.Canny('logout');
      // }

      // Clear the auth state
      set({
        user: null,
        session: null,
        profile: null,
        permissions: null,
        companies: [],
        authenticated: false,
      });

      // Clear React Query cache to prevent data leakage between users
      queryClient.clear();
    }
  },

  resetPassword: async (email: string) => {
    try {
      await authApi.resetPassword(email);
      return {};
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Password reset failed";
      return { error: message };
    }
  },

  initialize: async () => {
    // Prevent multiple initializations
    if (isInitialized) {
      return;
    }
    isInitialized = true;

    // Check if we have stored tokens
    const tokens = TokenManager.getTokens();

    if (!tokens) {
      set({ loading: false, authenticated: false });
      return;
    }

    try {
      // Validate session with backend
      const response = await authApi.validateSession();

      if (response.success && response.data) {
        const { user, profile, permissions, companies } = response.data;

        set({
          user,
          profile,
          permissions,
          companies,
          session: tokens,
          authenticated: true,
          loading: false,
        });
      } else {
        // Session invalid - clear tokens
        TokenManager.clearTokens();
        set({ loading: false, authenticated: false });
      }
    } catch (error) {
      // Session validation failed - clear tokens
      console.error("Session initialization failed:", error);
      TokenManager.clearTokens();
      set({ loading: false, authenticated: false });
    }
  },
}));
