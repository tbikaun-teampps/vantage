import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { Outlet } from "react-router-dom";
// import { cannyService } from "@/lib/canny/canny-service";

export function AuthProvider() {
  const initialize = useAuthStore((state) => state.initialize);
  // const user = useAuthStore((state) => state.user);
  // const profile = useAuthStore((state) => state.profile);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Identify user with Canny when auth state changes (commented out for now)
  // useEffect(() => {
  //   if (user && profile) {
  //     cannyService.identify();
  //   }
  // }, [user, profile]);

  // return <>{children}</>;
  return <Outlet />;
}
