import { UserMenu } from "@/components/user-menu";

export function NavUser() {
  return <UserMenu variant="sidebar" showNotifications={true} grayscaleAvatar={true} />;
}
