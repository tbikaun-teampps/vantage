import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Plus, Edit3, Trash2 } from "lucide-react";
import type {
  Dashboard,
  GetDashboardsResponseData,
} from "@/types/api/dashboard";

interface DashboardSelectorProps {
  dashboards: GetDashboardsResponseData;
  currentDashboard: Dashboard | null;
  onSelectDashboard: (dashboardId: number) => void;
  onCreateDashboard: () => void;
  onRenameDashboard: (dashboardId: number) => void;
  onDeleteDashboard: (dashboardId: number) => void;
}

export function DashboardSelector({
  dashboards,
  currentDashboard,
  onSelectDashboard,
  onCreateDashboard,
  onRenameDashboard,
  onDeleteDashboard,
}: DashboardSelectorProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleDeleteDashboard = (dashboardId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (dashboards.length > 1) {
      onDeleteDashboard(dashboardId);
    }
  };

  const handleRenameDashboard = (dashboardId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onRenameDashboard(dashboardId);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto p-0 text-2xl font-bold hover:bg-transparent hover:text-muted-foreground"
        >
          <span>{currentDashboard?.name || "Dashboard"}</span>
          <ChevronDown size={20} className="ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {dashboards.map((dashboard) => (
          <DropdownMenuItem
            key={dashboard.id}
            className="flex items-center justify-between group"
            onClick={() => {
              onSelectDashboard(dashboard.id);
              setIsOpen(false);
            }}
          >
            <div className="flex items-center">
              <span className="font-medium">
                {dashboard.id === currentDashboard?.id && "✓ "}
                {dashboard.name}
              </span>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => handleRenameDashboard(dashboard.id, e)}
              >
                <Edit3 size={12} />
              </Button>
              {dashboards.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  onClick={(e) => handleDeleteDashboard(dashboard.id, e)}
                >
                  <Trash2 size={12} />
                </Button>
              )}
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            onCreateDashboard();
            setIsOpen(false);
          }}
          className="text-muted-foreground"
        >
          <Plus size={16} className="mr-2" />
          Create New Dashboard
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
