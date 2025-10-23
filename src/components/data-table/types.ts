// components/data-table/types.ts
import { type ColumnDef } from "@tanstack/react-table";

export interface TabConfig {
  value: string;
  label: string;
  count?: number;
  content?: React.ReactNode;
}

export interface DataTableAction {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: "default" | "destructive";
  disabled?: boolean;
}

export interface DataTableConfig<T> {
  // Data and columns
  data: T[];
  columns: ColumnDef<T>[];
  getRowId: (row: T) => string;

  // Loading state
  isLoading?: boolean;

  // Row selection and sorting
  enableRowSelection?: boolean;
  enableSorting?: boolean;

  // Tabs configuration
  tabs: TabConfig[];
  defaultTab: string;

  // Status filtering
  getStatusCounts?: (data: T[]) => Record<string, number>;
  filterByStatus?: (data: T[], status: string) => T[];

  // Actions
  primaryAction?: {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: () => void;
  };

  // Empty states
  getEmptyStateContent?: (status: string) => {
    title: string;
    description: string;
  };

  // Pagination
  defaultPageSize?: number;
  pageSizeOptions?: number[];

  // Table meta (for passing additional data to cells)
  tableMeta?: any;

  // UI options
  showFiltersButton?: boolean;
  onRowClick?: (row: T) => void;
}

export interface TableAction {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: () => void | Promise<void>;
  variant?: "default" | "destructive";
  disabled?: boolean;
  separator?: boolean;
}

export interface StatusCellProps<T extends Record<string, any>> {
  item: T;
  statusKey: keyof T;
  statusOptions: Array<{
    value: string;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    iconColor?: string;
  }>;
  onStatusChange: (item: T, newStatus: string) => Promise<void> | void;
  className?: string;
}
