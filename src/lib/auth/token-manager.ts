/**
 * Token Manager
 * Centralized service for managing authentication tokens
 * Stores tokens in localStorage and provides utility methods
 */
import type { TokenData } from "@/types/auth";

class TokenManager {
  private static readonly STORAGE_KEY = "vantage_auth_tokens";

  /**
   * Store authentication tokens in localStorage
   */
  static setTokens(tokens: TokenData): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tokens));
    } catch (error) {
      console.error("Failed to store tokens:", error);
    }
  }

  /**
   * Retrieve authentication tokens from localStorage
   */
  static getTokens(): TokenData | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("Failed to retrieve tokens:", error);
      return null;
    }
  }

  /**
   * Get only the access token
   */
  static getAccessToken(): string | null {
    const tokens = this.getTokens();
    return tokens?.access_token || null;
  }

  /**
   * Get only the refresh token
   */
  static getRefreshToken(): string | null {
    const tokens = this.getTokens();
    return tokens?.refresh_token || null;
  }

  /**
   * Clear all stored tokens
   */
  static clearTokens(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear tokens:", error);
    }
  }

  /**
   * Check if the access token is expired or expiring soon (within 5 minutes)
   * Returns true if token doesn't exist, is expired, or expiring soon
   */
  static isTokenExpiring(): boolean {
    const tokens = this.getTokens();
    if (!tokens) {
      return true;
    }

    const expiresAt = tokens.expires_at;
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    const fiveMinutes = 5 * 60; // 5 minutes in seconds

    // Token is expiring if it expires within the next 5 minutes
    return expiresAt - now < fiveMinutes;
  }

  /**
   * Check if tokens exist
   */
  static hasTokens(): boolean {
    return this.getTokens() !== null;
  }

  /**
   * Update only the access token (for refresh operations)
   */
  static updateAccessToken(
    accessToken: string,
    refreshToken: string,
    expiresAt: number
  ): void {
    this.setTokens({
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: expiresAt,
    });
  }
}

export { TokenManager };
export type { TokenData };
