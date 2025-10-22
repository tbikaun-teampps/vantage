import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { IconDatabase } from "@tabler/icons-react";
import { useAuthStore } from "@/stores/auth-store";

interface DemoModeCardProps {
  onToggle: (checked: boolean) => void;
  isUpdating: boolean;
}

export function DemoModeCard({ onToggle, isUpdating }: DemoModeCardProps) {
  const { isDemoMode } = useAuthStore();

  // Check if demo mode is locked via environment variable
  const isDemoModeLocked = import.meta.env.VITE_DEMO_MODE_LOCKED === "true";

  // Don't render if demo mode is locked
  if (isDemoModeLocked) {
    return null;
  }

  return (
    <Card
      className="border-blue-200 dark:border-blue-800 bg-blue-200/10 dark:border-blue-800/20"
      data-tour="account-demo-mode"
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconDatabase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Demo Mode
        </CardTitle>
        <CardDescription>
          {isDemoMode
            ? "You're currently exploring Vantage with demo data"
            : "Enable demo mode to explore with sample data"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-base font-medium">
              {isDemoMode ? "Using Demo Data" : "Demo Mode"}
            </Label>
            <p className="text-sm text-muted-foreground">
              {isDemoMode
                ? "Ready to start using your own data? Disable demo mode to set up your company structure."
                : "Enable demo mode to explore Vantage with sample data and see how it works."}
            </p>
          </div>
          <Switch
            checked={isDemoMode}
            onCheckedChange={onToggle}
            disabled={isUpdating}
          />
        </div>
      </CardContent>
    </Card>
  );
}
