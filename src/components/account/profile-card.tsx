import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useProfile, useProfileActions } from "@/hooks/useProfile";

export function ProfileCard() {
  const { data: profile } = useProfile();
  const { updateProfile } = useProfileActions();
  const [formData, setFormData] = React.useState({
    fullName: "",
    email: "",
  });
  const [isProfileUpdating, setIsProfileUpdating] = React.useState(false);

  // Update form data when profile changes
  React.useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.full_name || "",
        email: profile.email || "",
      });
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!formData.fullName.trim()) {
      toast.error("Full name is required");
      return;
    }

    setIsProfileUpdating(true);
    await updateProfile({
      full_name: formData.fullName.trim(),
    });
    setIsProfileUpdating(false);
  };

  if (!profile) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                fullName: e.target.value,
              }))
            }
            placeholder="Enter your full name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            disabled
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground">
            Contact support to change your email address
          </p>
        </div>
      </div>
      <div className="flex justify-end">
        <Button onClick={handleSaveProfile} disabled={isProfileUpdating}>
          {isProfileUpdating ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
