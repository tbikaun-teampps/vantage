import { useState, type ReactNode } from "react";
import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconNotification,
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
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { useTheme } from "@/hooks/use-theme";
import showDisabledToast from "@/components/disabled-toast";
import { SubscriptionModal } from "@/components/account/subscription-modal";
import { AccountModal } from "@/components/account/account-modal";

interface UserMenuProps {
  variant: "sidebar" | "standalone";
  showNotifications?: boolean;
  grayscaleAvatar?: boolean;
}

interface UserMenuInternalProps {
  showNotifications: boolean;
  trigger: ReactNode;
  contentClassName: string;
  contentSide: "bottom" | "right";
  wrapper?: (children: ReactNode) => ReactNode;
}

function useUserMenuData() {
  const { profile, loading, signOut } = useAuthStore();
  const { resolvedTheme } = useTheme();
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);

  // Don't render if still loading or no user
  if (loading || !profile) {
    return null;
  }

  // Extract user data
  const userName = profile.full_name || profile.email?.split("@")[0];
  const userEmail = profile.email;
  const subscriptionTier = profile.subscription_tier;
  const isAdmin = profile.is_admin === true;

  const getSubscriptionBadge = () => {
    switch (subscriptionTier) {
      case "demo":
        return {
          name: "Demo",
          icon: IconInfoCircle,
          variant: "secondary" as const,
        };
      case "consultant":
        return {
          name: "Consultant",
          icon: IconStar,
          variant: "default" as const,
        };
      case "enterprise":
        return {
          name: "Enterprise",
          icon: IconCrown,
          variant: "default" as const,
        };
      default:
        return {
          name: "Demo",
          icon: IconInfoCircle,
          variant: "secondary" as const,
        };
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

  const handleNotificationsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    showDisabledToast("Notifications", "page");
  };

  // Determine which logo to use based on theme
  const logoSrc =
    resolvedTheme === "dark"
      ? "/assets/logos/vantage-logo-white.png"
      : "/assets/logos/vantage-logo.svg";

  return {
    userName,
    userEmail,
    isAdmin,
    subscriptionBadge,
    BadgeIcon,
    logoSrc,
    signOut,
    handleAccountClick,
    handleSubscriptionClick,
    handleNotificationsClick,
    subscriptionModalOpen,
    setSubscriptionModalOpen,
    accountModalOpen,
    setAccountModalOpen,
  };
}

function UserMenuInternal({
  showNotifications,
  trigger,
  contentClassName,
  contentSide,
  wrapper,
}: UserMenuInternalProps) {
  const data = useUserMenuData();

  if (!data) {
    return null;
  }

  const {
    userName,
    userEmail,
    isAdmin,
    subscriptionBadge,
    BadgeIcon,
    logoSrc,
    signOut,
    handleAccountClick,
    handleSubscriptionClick,
    handleNotificationsClick,
    subscriptionModalOpen,
    setSubscriptionModalOpen,
    accountModalOpen,
    setAccountModalOpen,
  } = data;

  const dropdownContent = (
    <>
      <DropdownMenuLabel className="p-0 font-normal">
        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={logoSrc} alt={userName} />
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
        <DropdownMenuItem
          onClick={handleSubscriptionClick}
          className="justify-between"
        >
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
        {showNotifications && (
          <DropdownMenuItem onClick={handleNotificationsClick}>
            <IconNotification />
            Notifications
          </DropdownMenuItem>
        )}
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={signOut}>
        <IconLogout />
        Log out
      </DropdownMenuItem>
    </>
  );

  const modals = (
    <>
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

  const menu = (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        <DropdownMenuContent
          className={contentClassName}
          side={contentSide}
          align="end"
          sideOffset={4}
        >
          {dropdownContent}
        </DropdownMenuContent>
      </DropdownMenu>
      {modals}
    </>
  );

  return wrapper ? <>{wrapper(menu)}</> : menu;
}

export function UserMenu({
  variant,
  showNotifications = false,
  grayscaleAvatar = false,
}: UserMenuProps) {
  if (variant === "sidebar") {
    return <UserMenuSidebar showNotifications={showNotifications} grayscaleAvatar={grayscaleAvatar} />;
  }
  return <UserMenuStandalone />;
}

function UserMenuSidebar({
  showNotifications,
  grayscaleAvatar,
}: {
  showNotifications: boolean;
  grayscaleAvatar: boolean;
}) {
  const { isMobile } = useSidebar();
  const data = useUserMenuData();

  if (!data) {
    return null;
  }

  const { userName, userEmail, logoSrc } = data;

  const trigger = (
    <SidebarMenuButton
      size="lg"
      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
    >
      <Avatar className={`h-8 w-8 rounded-lg ${grayscaleAvatar ? "grayscale" : ""}`}>
        <AvatarImage src={logoSrc} alt={userName} />
        <AvatarFallback className="rounded-lg">V</AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{userName}</span>
        <span className="text-muted-foreground truncate text-xs">
          {userEmail}
        </span>
      </div>
      <IconDotsVertical className="ml-auto size-4" />
    </SidebarMenuButton>
  );

  return (
    <UserMenuInternal
      showNotifications={showNotifications}
      trigger={trigger}
      contentClassName="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
      contentSide={isMobile ? "bottom" : "right"}
      wrapper={(children) => (
        <SidebarMenu>
          <SidebarMenuItem>{children}</SidebarMenuItem>
        </SidebarMenu>
      )}
    />
  );
}

function UserMenuStandalone() {
  const data = useUserMenuData();

  if (!data) {
    return null;
  }

  const { userName, logoSrc } = data;

  const trigger = (
    <Button
      variant="ghost"
      size="sm"
      className="h-auto p-2 hover:bg-accent/50"
    >
      <Avatar className="h-8 w-8 rounded-lg">
        <AvatarImage src={logoSrc} alt={userName} />
        <AvatarFallback className="rounded-lg">V</AvatarFallback>
      </Avatar>
      <IconDotsVertical className="ml-2 h-4 w-4" />
    </Button>
  );

  return (
    <UserMenuInternal
      showNotifications={false}
      trigger={trigger}
      contentClassName="w-64 rounded-lg"
      contentSide="bottom"
    />
  );
}
