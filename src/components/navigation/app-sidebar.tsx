import * as React from "react";
import { useLocation } from "react-router-dom";
import { IconChevronRight } from "@tabler/icons-react";
import { NavSecondary } from "@/components/navigation/nav-secondary";
import { NavUser } from "@/components/navigation/nav-user";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";
import { getSidebarData } from "./sidebar-data";
import type {
  NavItemWithSub,
  NavSubItem,
  NavSubSubItem,
  NavSectionProps,
} from "@/types/sidebar";
import CompanySelector from "@/components/company-selector";
import { NavData } from "./nav-data";
import showDisabledToast from "@/components/disabled-toast";
import { getVersionInfo } from "@/lib/version";
import { useCurrentCompany } from "@/components/CompanyRoute";
import { companyRoutes } from "@/router/routes";

// Helper functions
function isPathActive(currentPath: string, itemPath: string): boolean {
  if (itemPath === "/") return currentPath === "/";
  return currentPath === itemPath || currentPath.startsWith(itemPath + "/");
}

function hasActiveSubItem(currentPath: string, items?: NavSubItem[]): boolean {
  if (!items) return false;
  return items.some(
    (item) =>
      isPathActive(currentPath, item.url) ||
      hasActiveSubSubItem(currentPath, item.items)
  );
}

function hasActiveSubSubItem(
  currentPath: string,
  items?: NavSubSubItem[]
): boolean {
  if (!items) return false;
  return items.some((item) => isPathActive(currentPath, item.url));
}

// Component for rendering sub-sub items (third level)
function SubSubItemsRenderer({
  subItem,
  pathname,
  handleSubSubItemClick,
}: {
  subItem: NavSubItem;
  pathname: string;
  handleSubSubItemClick: (
    subSubItem: NavSubSubItem
  ) => (e: React.MouseEvent) => void;
}) {
  if (!subItem.items || subItem.items.length === 0) return null;

  const hasActiveSubSub = hasActiveSubSubItem(pathname, subItem.items);
  const isSubItemActive = isPathActive(pathname, subItem.url);
  const shouldExpandSubSub = isSubItemActive || hasActiveSubSub;

  return (
    <Collapsible
      defaultOpen={shouldExpandSubSub}
      className="group/subcollapsible"
    >
      <div className="flex items-center w-full">
        <SidebarMenuSubButton
          asChild
          isActive={isSubItemActive}
          className="flex-1 mr-1"
        >
          <Link
            to={subItem.url}
            onClick={
              handleSubSubItemClick ? handleSubSubItemClick(subItem) : undefined
            }
          >
            {subItem.icon && <subItem.icon className="size-4" />}
            <span>{subItem.title}</span>
          </Link>
        </SidebarMenuSubButton>

        <CollapsibleTrigger asChild>
          <button
            className="flex items-center justify-center w-6 h-6 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            aria-label={`Toggle ${subItem.title} submenu`}
          >
            <IconChevronRight className="size-3 transition-transform duration-200 group-data-[state=open]/subcollapsible:rotate-90" />
          </button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent>
        <SidebarMenuSub className="ml-4">
          {subItem.items.map(
            (subSubItem: NavSubSubItem, subSubIndex: number) => {
              const isSubSubActive = isPathActive(pathname, subSubItem.url);

              return (
                <SidebarMenuSubItem key={subSubIndex}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={isSubSubActive}
                    className="text-sm"
                  >
                    <Link
                      to={subSubItem.url}
                      onClick={handleSubSubItemClick(subSubItem)}
                    >
                      {subSubItem.icon && (
                        <subSubItem.icon className="size-3" />
                      )}
                      <span>{subSubItem.title}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            }
          )}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );
}

function NavSection({ title, items, className, disabled }: NavSectionProps) {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <SidebarGroup className={className}>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item: NavItemWithSub, index) => {
          const isActive = isPathActive(pathname, item.url);
          const hasActiveSub = hasActiveSubItem(pathname, item.items);
          const shouldExpand = isActive || hasActiveSub;
          const itemDisabled = disabled || item.disabled;

          const handleItemClick = (e: React.MouseEvent) => {
            if (itemDisabled) {
              e.preventDefault();
              showDisabledToast(item.title, "page");
            }
          };

          const handleSubItemClick =
            (subItem: NavSubItem) => (e: React.MouseEvent) => {
              if (subItem.disabled) {
                e.preventDefault();
                showDisabledToast(subItem.title, "page");
              }
            };

          const handleSubSubItemClick =
            (subSubItem: NavSubSubItem) => (e: React.MouseEvent) => {
              if (subSubItem.disabled) {
                e.preventDefault();
                showDisabledToast(subSubItem.title, "page");
              }
            };

          return (
            <React.Fragment key={index}>
              {item.items ? (
                <Collapsible
                  asChild
                  defaultOpen={shouldExpand}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <div className="flex items-center w-full">
                      <SidebarMenuButton
                        asChild
                        tooltip={item.title}
                        isActive={isActive}
                        className="flex-1 mr-1"
                      >
                        <Link
                          to={item.url}
                          className="flex items-center gap-2"
                          onClick={handleItemClick}
                        >
                          {item.icon && <item.icon className="size-4" />}
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>

                      <CollapsibleTrigger asChild>
                        <button
                          className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                          aria-label={`Toggle ${item.title} submenu`}
                        >
                          <IconChevronRight className="size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </button>
                      </CollapsibleTrigger>
                    </div>

                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map(
                          (subItem: NavSubItem, subIndex: number) => {
                            // Check if this sub-item has its own sub-items (third level)
                            if (subItem.items && subItem.items.length > 0) {
                              return (
                                <SidebarMenuSubItem key={subIndex}>
                                  <SubSubItemsRenderer
                                    subItem={subItem}
                                    pathname={pathname}
                                    handleSubSubItemClick={
                                      handleSubSubItemClick
                                    }
                                  />
                                </SidebarMenuSubItem>
                              );
                            }

                            // Regular sub-item without further nesting
                            const isSubActive = isPathActive(
                              pathname,
                              subItem.url
                            );

                            return (
                              <SidebarMenuSubItem key={subIndex}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={isSubActive}
                                >
                                  <Link
                                    to={subItem.url}
                                    onClick={handleSubItemClick(subItem)}
                                  >
                                    {subItem.icon && (
                                      <subItem.icon className="size-4" />
                                    )}
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          }
                        )}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={isActive}
                  >
                    <Link to={item.url} onClick={handleItemClick}>
                      {item.icon && <item.icon className="size-4" />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </React.Fragment>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { displayVersion } = getVersionInfo();
  const { companyId } = useCurrentCompany();


  // Use company-specific sidebar data if we have a company ID
  const sidebarData = companyId
    ? getSidebarData(companyId)
    : getSidebarData("");

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="w-full h-14">
              <Link
                to={
                  companyId
                    ? companyRoutes.dashboard(companyId)
                    : "/select-company"
                }
                className="flex items-center justify-center px-2"
              >
                <div className="w-full h-8 relative">
                  <img
                    src="/assets/logos/vantage-logo-full.svg"
                    alt="Vantage Logo"
                    className="w-full h-full object-contain dark:hidden"
                  />
                  <img
                    src="/assets/logos/vantage-logo-full-white.png"
                    alt="Vantage Logo"
                    className="w-full h-full object-contain hidden dark:block"
                  />
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
        <div className="mb-4">
          <CompanySelector />
        </div>
      <SidebarContent>
        <div data-sidebar-section="monitor">
          <NavSection title="Monitor" items={sidebarData.navMonitor} />
        </div>
        <div data-sidebar-section="discover">
          <NavSection title="Discover" items={sidebarData.navDiscover} />
        </div>
        <div data-sidebar-section="improve">
          <NavSection title="Improve" items={sidebarData.navImprove} />
        </div>
        <div data-sidebar-section="settings">
          <NavSection title="Settings" items={sidebarData.navSettings} />
        </div>
        {/* <div data-sidebar-section="data">
          <NavData title="Data" items={sidebarData.navData} />
        </div> */}
        <NavSecondary items={sidebarData.navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <div className="flex flex-col items-center justify-center space-y-1 py-2">
        <p className="text-gray-400 text-xs">
          {/* #eb59ff to  #032a83*/}
          Built by{" "}
          <a
            href="https://www.teampps.com.au"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-[#eb59ff] to-[#032a83] bg-clip-text text-transparent hover:from-[#f472b6] hover:to-[#1e40af] transition-all duration-300"
          >
            TEAM
          </a>{" "}
          • {displayVersion}
        </p>
      </div>
    </Sidebar>
  );
}
