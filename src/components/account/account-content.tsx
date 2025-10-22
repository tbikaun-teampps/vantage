import { useAuthStore } from "@/stores/auth-store";
import { useProfile } from "@/hooks/useProfile";
import { ProfileCard } from "./profile-card";
import { AccountActionsCard } from "./account-actions-card";

export function AccountContent() {
  const { user } = useAuthStore();
  const { data: profile, isLoading: profileLoading } = useProfile();

  if (!user || profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading account information...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Profile not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full px-6 overflow-auto">
      <ProfileCard />
      <AccountActionsCard />
    </div>
  );
}
