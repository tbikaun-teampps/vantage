import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/auth-store";
import { useProfile } from "@/hooks/useProfile";
import { ProfileCard } from "@/components/account/profile-card";

interface AccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountModal({ open, onOpenChange }: AccountModalProps) {
  const { user } = useAuthStore();
  const { data: profile, isLoading: profileLoading } = useProfile();

  if (!user || profileLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Account Settings</DialogTitle>
            <DialogDescription>
              Manage your account preferences and settings
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">
              Loading account information...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!profile) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Account Settings</DialogTitle>
            <DialogDescription>
              Manage your account preferences and settings
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Profile not found.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Account Settings</DialogTitle>
          <DialogDescription>
            Manage your account preferences and settings
          </DialogDescription>
        </DialogHeader>
        <ProfileCard />
      </DialogContent>
    </Dialog>
  );
}
