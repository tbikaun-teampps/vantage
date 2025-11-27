import axios from "axios";
import { TokenManager } from "@/lib/auth/token-manager";
import { routes } from "@/router/routes";

// Determine the API base URL
// In development with Vite proxy: use "/api" (proxied to VITE_API_BASE_URL)
// In production: use full URL from VITE_API_BASE_URL (e.g., https://api.domain.com)
const getApiBaseUrl = () => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  // If running in development mode with Vite, use relative path for proxy
  if (import.meta.env.DEV) {
    return "/api";
  }

  // In production, use the full URL if provided (subdomain should not include /api)
  if (apiBaseUrl) {
    return apiBaseUrl;
  }

  // Fallback to relative path
  return "/api";
};

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag to prevent multiple concurrent refresh requests
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

// Helper function to refresh the token
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = TokenManager.getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  try {
    const response = await axios.post(
      `${getApiBaseUrl()}/auth/refresh`,
      { refresh_token: refreshToken },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    if (response.data.success && response.data.data) {
      const { access_token, refresh_token, expires_at } = response.data.data;

      // Update stored tokens
      TokenManager.setTokens({
        access_token,
        refresh_token,
        expires_at,
      });

      return access_token;
    }

    return null;
  } catch (error) {
    console.error("Token refresh failed:", error);
    return null;
  }
}

// Request interceptor to add authentication (JWT or public interview token)
apiClient.interceptors.request.use(
  async (config) => {
    // Check if we're on a public interview page by examining the URL
    const currentPath = window.location.pathname;

    // Detect public interview route: /interview/:id
    const interviewMatch = currentPath.match(/\/interview\/(\d+)/);

    if (interviewMatch) {
      // Check for interview token in sessionStorage
      const interviewId = interviewMatch[1];
      const token = sessionStorage.getItem(
        `vantage_interview_token_${interviewId}`
      );

      if (token) {
        // Use the interview token
        config.headers.Authorization = `Bearer ${token}`;
      }
      // If no token, request will proceed without auth (e.g., for /auth endpoint)
    } else {
      // Standard authenticated request - add JWT token
      let accessToken = TokenManager.getAccessToken();

      // Check if token is expiring and refresh if needed
      if (accessToken && TokenManager.isTokenExpiring()) {
        // If already refreshing, wait for that request
        if (isRefreshing && refreshPromise) {
          accessToken = await refreshPromise;
        } else {
          // Start new refresh
          isRefreshing = true;
          refreshPromise = refreshAccessToken();
          accessToken = await refreshPromise;
          isRefreshing = false;
          refreshPromise = null;
        }

        // If refresh failed, clear tokens and redirect to login
        if (!accessToken) {
          TokenManager.clearTokens();
          if (!window.location.pathname.includes(routes.login)) {
            window.location.href = routes.login;
          }
          return Promise.reject(new Error("Session expired"));
        }
      }

      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Check if on public interview page
      const currentPath = window.location.pathname;
      const interviewMatch = currentPath.match(/\/interview\/(\d+)/);

      if (interviewMatch) {
        // Handle interview token expiry
        const interviewId = interviewMatch[1];
        sessionStorage.removeItem(`vantage_interview_token_${interviewId}`);
        window.location.reload();
        return Promise.reject(error);
      }

      // For standard auth: Try to refresh token once
      if (!originalRequest._retry) {
        originalRequest._retry = true;

        const refreshToken = TokenManager.getRefreshToken();
        if (refreshToken) {
          try {
            const newAccessToken = await refreshAccessToken();

            if (newAccessToken) {
              // Retry the original request with new token
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              return apiClient(originalRequest);
            }
          } catch (refreshError) {
            console.error(
              "Token refresh failed in response interceptor:",
              refreshError
            );
          }
        }
      }

      // Refresh failed or not available - clear tokens and redirect to login
      TokenManager.clearTokens();
      if (!window.location.pathname.includes(routes.login)) {
        window.location.href = routes.login;
      }
    } else if (error.response?.status === 500) {
      console.error("Server error:", error.response.data);
    }

    // If the API returned an error message in response.data.error, use it as the error message
    if (error.response?.data?.error) {
      error.message = error.response.data.error;
    }
    // Attach validation errors array if present (for CSV import validation, etc.)
    if (error.response?.data?.errors) {
      error.validationErrors = error.response.data.errors;
    }

    return Promise.reject(error);
  }
);

export { apiClient };
