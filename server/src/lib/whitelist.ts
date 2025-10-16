export const authWhitelist = [
  "/health",
  "/documentation",
  "/documentation/json",
  "/openapi.json",
  "/interviews/auth",
  "/auth/signin",
  "/auth/refresh", // Refresh uses refresh_token in body, not auth header
];
export const subscriptionWhitelist = ["/users/subscription"]; // Allow the user to update their subscription
