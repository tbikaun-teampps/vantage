import * as React from "react";
import {
  IconCircleCheckFilled,
  IconDotsVertical,
  IconPencil,
  IconFileText,
  IconShare,
  IconArchive,
  IconClock,
  IconLoader,
  IconEye,
  IconPlayerPause,
  IconAlertTriangle,
  IconTrendingUp,
  IconUsersGroup,
} from "@tabler/icons-react";
import { type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type StatusCellProps,
  type TableAction,
  type ActionsCellProps,
  type BadgeCellProps,
  type StatusOption,
} from "./types";

export function StatusCell<T extends Record<string, unknown>>({
  item,
  statusKey,
  statusOptions,
  onStatusChange,
  className = "w-42 h-8",
}: StatusCellProps<T>) {
  const currentStatus = item[statusKey] as string;

  const handleStatusChange = async (newStatus: string) => {
    try {
      await onStatusChange(item, newStatus);
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update status");
    }
  };

  return (
    <Select defaultValue={currentStatus} onValueChange={handleStatusChange}>
      <SelectTrigger className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex items-center">
              {option.icon && (
                <option.icon
                  className={`mr-2 h-4 w-4 ${option.iconColor || ""}`}
                />
              )}
              {option.label}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// Generic actions cell component
export function ActionsCell({ actions }: ActionsCellProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
          size="icon"
        >
          <IconDotsVertical />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        {actions.map((action, index) => (
          <React.Fragment key={index}>
            {action.separator && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={action.onClick}
              variant={action.variant}
              disabled={action.disabled}
            >
              {action.icon && <action.icon className="mr-2 h-4 w-4" />}
              {action.label}
            </DropdownMenuItem>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Badge cell component for counts/numbers
export function BadgeCell({
  value,
  variant = "outline",
  icon: Icon,
  className = "text-muted-foreground px-1.5",
  centered = true,
}: BadgeCellProps) {
  const containerClass = centered ? "w-full text-center" : "w-full";

  return (
    <div className={containerClass}>
      <div className="flex items-center justify-center gap-1">
        {Icon && <Icon className="h-3 w-3 text-muted-foreground" />}
        <Badge variant={variant} className={className}>
          {value}
        </Badge>
      </div>
    </div>
  );
}

// Common status configurations for different entity types
export const SURVEY_STATUS_OPTIONS: StatusOption[] = [
  {
    value: "active",
    label: "Active",
    icon: IconCircleCheckFilled,
    iconColor: "fill-green-500 dark:fill-green-400",
  },
  {
    value: "draft",
    label: "Draft",
    icon: IconPencil,
    iconColor: "text-yellow-500",
  },
  {
    value: "under_review",
    label: "Under Review",
    icon: IconUsersGroup,
    iconColor: "text-blue-500",
  },
  {
    value: "archived",
    label: "Archived",
    icon: IconArchive,
    iconColor: "text-gray-500",
  },
];

export const ASSESSMENT_STATUS_OPTIONS: StatusOption[] = [
  {
    value: "completed",
    label: "Completed",
    icon: IconCircleCheckFilled,
    iconColor: "fill-green-500 dark:fill-green-400",
  },
  {
    value: "active",
    label: "Active",
    icon: IconClock,
    iconColor: "text-blue-500",
  },
  {
    value: "under_review",
    label: "Under Review",
    icon: IconEye,
    iconColor: "text-yellow-500",
  },
  {
    value: "draft",
    label: "Draft",
    icon: IconPencil,
    iconColor: "text-red-500",
  },
  {
    value: "archived",
    label: "Archived",
    icon: IconArchive,
    iconColor: "text-gray-500",
  },
];

export const INTERVIEW_STATUS_OPTIONS: StatusOption[] = [
  {
    value: "Complete",
    label: "Complete",
    icon: IconCircleCheckFilled,
    iconColor: "fill-green-500 dark:fill-green-400",
  },
  {
    value: "Active",
    label: "Active",
    icon: IconClock,
    iconColor: "text-blue-500",
  },
  {
    value: "Pending",
    label: "Pending",
    icon: IconPlayerPause,
    iconColor: "text-red-500",
  },
  {
    value: "Archived",
    label: "Archived",
    icon: IconArchive,
    iconColor: "text-gray-500",
  },
];

// Common action creators
export function createEditAction(onEdit: () => void): TableAction {
  return {
    label: "Edit",
    icon: IconPencil,
    onClick: onEdit,
  };
}

export function createDuplicateAction(onDuplicate: () => void): TableAction {
  return {
    label: "Duplicate",
    icon: IconFileText,
    onClick: onDuplicate,
  };
}

export function createShareAction(
  onShare: () => void,
  disabled = false
): TableAction {
  return {
    label: "Share",
    icon: IconShare,
    onClick: onShare,
    disabled,
  };
}

export function createDeleteAction(onDelete: () => void): TableAction {
  return {
    label: "Delete",
    onClick: onDelete,
    variant: "destructive" as const,
    separator: true,
  };
}

// Risk badge utility for assessments
export function getRiskBadgeVariant(risk: string) {
  switch (risk.toLowerCase()) {
    case "critical":
      return "destructive";
    case "high":
      return "secondary";
    case "medium":
      return "outline";
    case "low":
      return "default";
    default:
      return "outline";
  }
}

// Trend icon utility
export function getTrendIcon(trend: string) {
  switch (trend.toLowerCase()) {
    case "improving":
      return <IconTrendingUp className="h-3 w-3 text-green-500" />;
    case "declining":
      return <IconTrendingUp className="h-3 w-3 rotate-180 text-red-500" />;
    case "stable":
      return <div className="h-3 w-3 rounded-full bg-blue-500" />;
    default:
      return null;
  }
}

// Action status icon utility
export function getActionStatusIcon(status: string) {
  switch (status.toLowerCase()) {
    case "completed":
      return <IconCircleCheckFilled className="h-4 w-4 text-green-500" />;
    case "in_progress":
      return <IconLoader className="h-4 w-4 text-blue-500" />;
    case "overdue":
      return <IconAlertTriangle className="h-4 w-4 text-red-500" />;
    case "none_required":
      return <IconCircleCheckFilled className="h-4 w-4 text-gray-400" />;
    default:
      return <IconClock className="h-4 w-4 text-gray-400" />;
  }
}

// Date utilities for assessment badges
export function calculateDaysAgo(dateString: string): number {
  const date = new Date(dateString);
  const today = new Date();
  const diffTime = today.getTime() - date.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function getAssessmentStatusBadge(
  dateString: string,
  type: "desktop" | "onsite"
) {
  const daysAgo = calculateDaysAgo(dateString);
  const monthsAgo = Math.floor(daysAgo / 30);
  const yearsAgo = Math.floor(daysAgo / 365);

  if (type === "desktop") {
    if (daysAgo > 180) {
      return {
        variant: "destructive" as const,
        label: "Overdue",
        tooltip: `${daysAgo} days ago (${monthsAgo} months)`,
      };
    } else if (daysAgo <= 30) {
      return {
        variant: "default" as const,
        label: "Recent",
        tooltip: `${daysAgo} days ago`,
      };
    } else if (daysAgo <= 90) {
      return {
        variant: "secondary" as const,
        label: "Current",
        tooltip: `${daysAgo} days ago (${monthsAgo} months)`,
      };
    } else {
      return {
        variant: "outline" as const,
        label: "Due Soon",
        tooltip: `${daysAgo} days ago (${monthsAgo} months)`,
      };
    }
  } else {
    // onsite
    if (daysAgo > 730) {
      return {
        variant: "destructive" as const,
        label: "Critical",
        tooltip: `${daysAgo} days ago (${yearsAgo} years)`,
      };
    } else if (daysAgo <= 180) {
      return {
        variant: "default" as const,
        label: "Recent",
        tooltip: `${daysAgo} days ago (${monthsAgo} months)`,
      };
    } else if (daysAgo <= 365) {
      return {
        variant: "secondary" as const,
        label: "Current",
        tooltip: `${daysAgo} days ago (${monthsAgo} months)`,
      };
    } else {
      return {
        variant: "outline" as const,
        label: "Due Soon",
        tooltip: `${daysAgo} days ago (${monthsAgo} months)`,
      };
    }
  }
}

// Generic column factory functions
export function createStatusColumn<T extends Record<string, unknown>>(
  accessor: keyof T & string,
  header: string,
  statusOptions: StatusOption[],
  onStatusChange: (item: T, newStatus: string) => Promise<void> | void
): ColumnDef<T> {
  return {
    accessorKey: accessor as string,
    header,
    cell: ({ row }) => (
      <StatusCell
        item={row.original}
        statusKey={accessor}
        statusOptions={statusOptions}
        onStatusChange={onStatusChange}
      />
    ),
  };
}

export function createBadgeColumn<T>(
  accessor: keyof T,
  header: string,
  variant: BadgeCellProps["variant"] = "outline",
  icon?: React.ComponentType<{ className?: string }>,
  centered = true
): ColumnDef<T> {
  return {
    accessorKey: accessor as string,
    header: centered
      ? () => <div className="w-full text-center">{header}</div>
      : header,
    cell: ({ row }) => (
      <BadgeCell
        value={row.getValue(accessor as string)}
        variant={variant}
        icon={icon}
        centered={centered}
      />
    ),
  };
}

export function createActionsColumn<T>(
  getActions: (item: T) => TableAction[]
): ColumnDef<T> {
  return {
    id: "actions",
    cell: ({ row }) => <ActionsCell actions={getActions(row.original)} />,
  };
}
