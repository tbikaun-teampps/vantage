import {
  IconDots,
  IconSettings,
  IconRefresh,
  IconDownload,
  IconTrash,
  IconPlugConnected,
  IconEye,
  IconCloudCheck,
} from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import showDisabledToast from "@/components/disabled-toast";
import { type NavItem } from "@/types/sidebar";

export function NavData({ title, items }: { title: string; items: NavItem[] }) {
  const { isMobile } = useSidebar();

  const handleMainItemClick =
    (item: NavItem) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (item.disabled) {
        e.preventDefault();
        showDisabledToast(item.title, "page");
      }
    };

  const handleDropdownItemClick =
    (_: string, actionName: string, disabled?: boolean) =>
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) {
        e.preventDefault();
        showDisabledToast(actionName, "functionality");
      }
    };

  const getMenuItems = (itemName: string, parentDisabled?: boolean) => {
    if (itemName === "Upload Files") {
      return (
        <>
          <DropdownMenuItem
            onClick={handleDropdownItemClick(
              itemName,
              "View Files",
              parentDisabled
            )}
          >
            <IconEye />
            <span>View Files</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleDropdownItemClick(
              itemName,
              "Configure",
              parentDisabled
            )}
          >
            <IconSettings />
            <span>Configure</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleDropdownItemClick(
              itemName,
              "Export",
              parentDisabled
            )}
          >
            <IconDownload />
            <span>Export</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={handleDropdownItemClick(
              itemName,
              "Clear All",
              parentDisabled
            )}
          >
            <IconTrash />
            <span>Clear All</span>
          </DropdownMenuItem>
        </>
      );
    }

    if (itemName === "Connect Data") {
      return (
        <>
          <DropdownMenuItem
            onClick={handleDropdownItemClick(
              itemName,
              "Test Connection",
              parentDisabled
            )}
          >
            <IconCloudCheck />
            <span>Test Connection</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleDropdownItemClick(
              itemName,
              "Sync Now",
              parentDisabled
            )}
          >
            <IconRefresh />
            <span>Sync Now</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleDropdownItemClick(
              itemName,
              "Configure",
              parentDisabled
            )}
          >
            <IconSettings />
            <span>Configure</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={handleDropdownItemClick(
              itemName,
              "Disconnect",
              parentDisabled
            )}
          >
            <IconPlugConnected />
            <span>Disconnect</span>
          </DropdownMenuItem>
        </>
      );
    }
    // Default fallback menu items
    return (
      <>
        <DropdownMenuItem
          onClick={handleDropdownItemClick(itemName, "View", parentDisabled)}
        >
          <IconEye />
          <span>View</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleDropdownItemClick(
            itemName,
            "Configure",
            parentDisabled
          )}
        >
          <IconSettings />
          <span>Configure</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={handleDropdownItemClick(itemName, "Remove", parentDisabled)}
        >
          <IconTrash />
          <span>Remove</span>
        </DropdownMenuItem>
      </>
    );
  };

  const handleMoreClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    showDisabledToast("More options");
  };

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild>
              <a href={item.url} onClick={handleMainItemClick(item)}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </a>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction
                  showOnHover
                  className="data-[state=open]:bg-accent rounded-sm"
                >
                  <IconDots />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-32 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                {getMenuItems(item.title, item.disabled)}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton
            className="text-sidebar-foreground/70"
            onClick={handleMoreClick}
          >
            <IconDots className="text-sidebar-foreground/70" />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
