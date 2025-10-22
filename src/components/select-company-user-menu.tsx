import { useState } from "react";
import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconUserCircle,
  IconStar,
  IconCrown,
  IconInfoCircle,
  IconShield,
} from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { useProfile } from "@/hooks/useProfile";
import { useTheme } from "@/hooks/use-theme";
import { SubscriptionModal } from "./account/subscription-modal";
import { AccountModal } from "./account/account-modal";

export function SelectCompanyUserMenu() {
  const { user, signOut } = useAuthStore();
  const { data: profile } = useProfile();
  const { resolvedTheme } = useTheme();
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);

  // Don't render if no user
  if (!user) {
    return null;
  }

  // Extract user data with fallbacks, prioritizing profile data
  const userName =
    profile?.full_name ||
    user?.user_metadata?.display_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "User";
  const userEmail = profile?.email || user?.email || "user@example.com";
  const userAvatar = user?.user_metadata?.avatar_url;
  const subscriptionTier = profile?.subscription_tier || 'demo';
  const isAdmin = profile?.is_admin === true;
  
  const getSubscriptionBadge = () => {
    switch (subscriptionTier) {
      case 'demo':
        return { name: 'Demo', icon: IconInfoCircle, variant: 'secondary' as const };
      case 'consultant':
        return { name: 'Consultant', icon: IconStar, variant: 'default' as const };
      case 'enterprise':
        return { name: 'Enterprise', icon: IconCrown, variant: 'default' as const };
      default:
        return { name: 'Demo', icon: IconInfoCircle, variant: 'secondary' as const };
    }
  };
  
  const subscriptionBadge = getSubscriptionBadge();
  const BadgeIcon = subscriptionBadge.icon;

  const handleAccountClick = () => {
    setAccountModalOpen(true);
  };

  const handleSubscriptionClick = () => {
    setSubscriptionModalOpen(true);
  };

  // Determine which logo to use based on theme
  const logoSrc =
    resolvedTheme === "dark"
      ? "/assets/logos/vantage-logo-white.png"
      : "/assets/logos/vantage-logo.svg";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-2 hover:bg-accent/50"
          >
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={userAvatar || logoSrc} alt={userName} />
              <AvatarFallback className="rounded-lg">V</AvatarFallback>
            </Avatar>
            <IconDotsVertical className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-64 rounded-lg"
          side="bottom"
          align="end"
          sideOffset={4}
        >
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={userAvatar || logoSrc} alt={userName} />
                <AvatarFallback className="rounded-lg">V</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium">{userName}</span>
                  {isAdmin && (
                    <Badge
                      variant="destructive"
                      className="text-xs h-5 px-1.5 flex items-center gap-1"
                    >
                      <IconShield className="h-3 w-3" />
                      Admin
                    </Badge>
                  )}
                </div>
                <span className="text-muted-foreground truncate text-xs">
                  {userEmail}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={handleAccountClick}>
              <IconUserCircle />
              Account
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSubscriptionClick} className="justify-between">
              <div className="flex items-center gap-2">
                <IconCreditCard />
                Subscription
              </div>
              <Badge
                variant={subscriptionBadge.variant}
                className="text-xs h-5 px-1.5 flex items-center gap-1"
              >
                <BadgeIcon className="h-3 w-3" />
                {subscriptionBadge.name}
              </Badge>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOut}>
            <IconLogout />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <SubscriptionModal
        open={subscriptionModalOpen}
        onOpenChange={setSubscriptionModalOpen}
      />
      
      <AccountModal
        open={accountModalOpen}
        onOpenChange={setAccountModalOpen}
      />
    </>
  );
}