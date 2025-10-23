import { type ColumnDef } from "@tanstack/react-table";

interface TabConfig {
  value: string;
  label: string;
  count?: number;
  content?: React.ReactNode;
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
