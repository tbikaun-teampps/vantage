/**
 * Auth API Layer
 * Centralized authentication API calls
 * Separates network logic from state management
 */

import { apiClient } from "./client";
import type {
  BackendAuthResponse,
  ValidateSessionResponse,
  TokenData,
} from "@/types/auth";

export interface RefreshTokenResponse {
  success: boolean;
  data?: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
  error?: string;
  message?: string;
}

/**
 * Authentication API functions
 */
export const authApi = {
  /**
   * Sign in with email and password
   * Returns enriched user data with profile and permissions
   */
  async signIn(email: string, password: string): Promise<BackendAuthResponse> {
    const response = await apiClient.post<BackendAuthResponse>("/auth/signin", {
      email,
      password,
    });
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
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await apiClient.post<RefreshTokenResponse>(
      "/auth/refresh",
      {
        refresh_token: refreshToken,
      }
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

  /**
   * Request password reset email
   */
  async resetPassword(email: string): Promise<void> {
    await apiClient.post("/auth/reset-password", { email });
  },

  /**
   * Get external interview access token
   * Validates access code and email, returns JWT for public interview access
   */
  async getExternalInterviewToken(
    interviewId: number,
    email: string,
    accessCode: string
  ): Promise<{ token: string }> {
    const response = await apiClient.post<{
      success: boolean;
      data: { token: string };
    }>("/auth/external/interview-token", {
      interviewId,
      email,
      accessCode,
    });
    return response.data.data;
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
