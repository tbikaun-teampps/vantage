import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { IconLogout } from "@tabler/icons-react";
import { useAuthStore } from "@/stores/auth-store";

export function AccountActionsCard() {
  const { signOut } = useAuthStore();

  return (
    <Card
      className="border-destructive/20 bg-destructive/10"
      data-tour="account-actions"
    >
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-base font-medium">Sign Out</Label>
            <p className="text-sm text-muted-foreground">
              Sign out of your account on this device
            </p>
          </div>
          <Button
            variant="destructive"
            onClick={signOut}
            className="flex items-center gap-2"
          >
            <IconLogout className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
