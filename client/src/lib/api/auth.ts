/**
 * Auth API Layer
 * Centralized authentication API calls
 * Separates network logic from state management
 */

import type {
  GetExternalInterviewTokenBodyData,
  GetExternalInterviewTokenResponse,
  RefreshTokenBodyData,
  RefreshTokenResponse,
  SignInBodyData,
  SignInResponse,
  SubscriptionTier,
  TokenData,
  ValidateSessionResponse,
} from "@/types/api/auth";
import { apiClient } from "./client";

/**
 * Authentication API functions
 */
export const authApi = {
  /**
   * Sign in with email and password
   * Returns enriched user data with profile and permissions
   */
  async signIn(data: SignInBodyData): Promise<SignInResponse> {
    const response = await apiClient.post<SignInResponse>("/auth/signin", data);
    return response.data;
  },

  /**
   * Sign out the current user
   * Invalidates the session on the backend
   */
  async signOut(): Promise<void> {
    await apiClient.post("/auth/signout");
  },

  /**
   * Refresh access token using refresh token
   * Returns new access and refresh tokens
   */
  async refreshToken(
    data: RefreshTokenBodyData
  ): Promise<RefreshTokenResponse> {
    const response = await apiClient.post<RefreshTokenResponse>(
      "/auth/refresh",
      data
    );
    return response.data;
  },

  /**
   * Validate current session and get enriched user data
   * Re-checks authorization and returns fresh profile/permissions
   * Does not return session tokens - client keeps existing tokens
   */
  async validateSession(): Promise<ValidateSessionResponse> {
    const response =
      await apiClient.get<ValidateSessionResponse>("/auth/session");
    return response.data;
  },

  // /**
  //  * Request password reset email
  //  */
  // async resetPassword(email: string): Promise<void> {
  //   await apiClient.post("/auth/reset-password", { email });
  // },

  /**
   * Get external interview access token
   * Validates access code and email, returns JWT for public interview access
   */
  async getExternalInterviewToken(
    data: GetExternalInterviewTokenBodyData
  ): Promise<GetExternalInterviewTokenResponse> {
    const response = await apiClient.post<GetExternalInterviewTokenResponse>(
      "/auth/external/interview-token",
      data
    );
    return response.data;
  },

  async updateSubscription(subscription_tier: SubscriptionTier): Promise<void> {
    await apiClient.put(`/auth/subscription/${subscription_tier}`);
  },
};

/**
 * Helper to convert session data to TokenData
 */
export function sessionToTokenData(session: {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}): TokenData {
  return {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at,
  };
}
