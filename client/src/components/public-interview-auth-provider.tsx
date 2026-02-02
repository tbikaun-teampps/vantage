import { useEffect } from "react";
import { useParams, Outlet } from "react-router-dom";
import { usePublicInterviewAuthStore } from "@/stores/public-interview-auth-store";

/**
 * Auth provider for public interview pages
 * Manages custom JWT token authentication for external interview access
 * Separate from the main AuthProvider which handles Supabase session auth
 */
export function PublicInterviewAuthProvider() {
  const { id } = useParams<{ id: string }>();
  const loadAuthFromSession = usePublicInterviewAuthStore(
    (state) => state.loadAuthFromSession
  );

  useEffect(() => {
    // Load token from sessionStorage if it exists
    if (id) {
      loadAuthFromSession(id);
    }
  }, [id, loadAuthFromSession]);

  return <Outlet />;
}
