import * as React from "react";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconLayoutColumns,
} from "@tabler/icons-react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Configuration types
export interface SimpleDataTableTab {
  value: string;
  label: string;
  data?: any[];
  emptyStateTitle?: string;
  emptyStateDescription?: string;
}

interface SimpleDataTableConfig<T> {
  data: T[];
  columns: ColumnDef<T>[];
  getRowId: (row: T) => string;

  // Optional features
  enableSorting?: boolean;
  enableFilters?: boolean;
  enableColumnVisibility?: boolean;

  // Tab configuration
  tabs?: SimpleDataTableTab[];
  defaultTab?: string;
  onTabChange?: (tabValue: string) => void;

  // Pagination
  defaultPageSize?: number;
  pageSizeOptions?: number[];

  // Actions
  onRowClick?: (row: T) => void;
  primaryAction?: {
    label: string;
    icon?: React.ComponentType<any>;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    icon?: React.ComponentType<any>;
    onClick: () => void;
  };

  // Filtering
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterPlaceholder?: string;
  filterColumnId?: string;
}

// Empty state component
const EmptyState = React.memo(
  ({ title, description }: { title: string; description: string }) => (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
);

// Main reusable data table component
export function SimpleDataTable<T>(config: SimpleDataTableConfig<T>) {
  const {
    data: initialData,
    columns,
    getRowId,
    enableSorting = true,
    enableFilters = true,
    enableColumnVisibility = true,
    tabs,
    defaultTab,
    onTabChange,
    defaultPageSize = 10,
    pageSizeOptions = [10, 20, 30, 40, 50],
    onRowClick,
    primaryAction,
    secondaryAction,
    filterValue,
    onFilterChange,
    filterPlaceholder = "Filter...",
    filterColumnId,
  } = config;

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });
  const [activeTab, setActiveTab] = React.useState(
    defaultTab || tabs?.[0]?.value || "all"
  );

  // Handle tab changes
  const handleTabChange = React.useCallback(
    (tabValue: string) => {
      setActiveTab(tabValue);
      onTabChange?.(tabValue);
    },
    [onTabChange]
  );

  // Get current tab data
  const currentTabData = React.useMemo(() => {
    if (!tabs) return initialData;
    const currentTab = tabs.find((tab) => tab.value === activeTab);
    return currentTab?.data || initialData;
  }, [tabs, activeTab, initialData]);

  const table = useReactTable({
    data: currentTabData,
    columns,
    state: {
      columnVisibility,
      columnFilters,
      pagination,
      globalFilter,
      ...(enableSorting && { sorting }),
    },
    getRowId,
    enableSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    ...(enableSorting && { onSortingChange: setSorting }),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    ...(enableSorting && { getSortedRowModel: getSortedRowModel() }),
  });

  // Get status counts for tabs
  const tabCounts = React.useMemo(() => {
    if (!tabs) return {};
    return tabs.reduce(
      (acc, tab) => {
        acc[tab.value] = tab.data?.length || 0;
        return acc;
      },
      {} as Record<string, number>
    );
  }, [tabs]);

  // Table content component
  const TableContent = React.memo(() => {
    const rows = table.getRowModel().rows;

    if (rows.length === 0) {
      const currentTab = tabs?.find((tab) => tab.value === activeTab);
      return (
        <EmptyState
          title={currentTab?.emptyStateTitle || `No ${activeTab} items`}
          description={
            currentTab?.emptyStateDescription || "No data available."
          }
        />
      );
    }

    return (
      <>
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={getRowId(row.original)}
                  onClick={() => onRowClick?.(row.original)}
                  className={
                    onRowClick ? "cursor-pointer hover:bg-muted/50" : ""
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredRowModel().rows.length} total rows
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => table.setPageSize(Number(value))}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent side="top">
                  {pageSizeOptions.map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  });

  if (!tabs) {
    // Simple table without tabs
    return (
      <div className="w-full space-y-4">
        {/* Header Controls */}
        <div className="flex items-center justify-between">
          {enableFilters && (
            <Input
              placeholder={filterPlaceholder}
              value={
                filterValue ||
                (filterColumnId
                  ? (table
                      .getColumn(filterColumnId)
                      ?.getFilterValue() as string)
                  : table.getState().globalFilter) ||
                ""
              }
              onChange={(event) => {
                const value = event.target.value;
                if (onFilterChange) {
                  onFilterChange(value);
                } else if (filterColumnId) {
                  table.getColumn(filterColumnId)?.setFilterValue(value);
                } else {
                  table.setGlobalFilter(value);
                }
              }}
              className="max-w-sm focus:outline-none"
            />
          )}

          <div className="flex items-center gap-2">
            {enableColumnVisibility && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <IconLayoutColumns />
                    <span className="hidden lg:inline">Columns</span>
                    <IconChevronDown />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id.replace("_", " ")}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {secondaryAction && (
              <Button
                size="sm"
                variant="outline"
                onClick={secondaryAction.onClick}
              >
                {secondaryAction.icon && (
                  <secondaryAction.icon className="mr-2 h-4 w-4" />
                )}
                {secondaryAction.label}
              </Button>
            )}

            {primaryAction && (
              <Button size="sm" onClick={primaryAction.onClick}>
                {primaryAction.icon && (
                  <primaryAction.icon className="mr-2 h-4 w-4" />
                )}
                {primaryAction.label}
              </Button>
            )}
          </div>
        </div>

        <TableContent />
      </div>
    );
  }

  // Table with tabs
  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="w-full space-y-4"
    >
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        {/* Mobile tab selector */}
        <Select value={activeTab} onValueChange={handleTabChange}>
          <SelectTrigger className="flex w-fit @6xl/main:hidden" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {tabs.map((tab) => (
              <SelectItem key={tab.value} value={tab.value}>
                {tab.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Desktop tabs */}
        <TabsList className="hidden @6xl/main:flex">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
              {tabCounts[tab.value] > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {tabCounts[tab.value]}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex items-center gap-2">
          {enableFilters && (
            <Input
              placeholder={filterPlaceholder}
              value={
                filterValue ||
                (filterColumnId
                  ? (table
                      .getColumn(filterColumnId)
                      ?.getFilterValue() as string)
                  : table.getState().globalFilter) ||
                ""
              }
              onChange={(event) => {
                const value = event.target.value;
                if (onFilterChange) {
                  onFilterChange(value);
                } else if (filterColumnId) {
                  table.getColumn(filterColumnId)?.setFilterValue(value);
                } else {
                  table.setGlobalFilter(value);
                }
              }}
              className="max-w-sm focus:outline-none"
            />
          )}

          {enableColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <IconLayoutColumns />
                  <span className="hidden lg:inline">Columns</span>
                  <IconChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id.replace("_", " ")}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {secondaryAction && (
            <Button
              size="sm"
              variant="outline"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.icon && (
                <secondaryAction.icon className="mr-2 h-4 w-4" />
              )}
              {secondaryAction.label}
            </Button>
          )}

          {primaryAction && (
            <Button size="sm" onClick={primaryAction.onClick}>
              {primaryAction.icon && (
                <primaryAction.icon className="mr-2 h-4 w-4" />
              )}
              {primaryAction.label}
            </Button>
          )}
        </div>
      </div>

      {/* Tab Contents */}
      {tabs.map((tab) => (
        <TabsContent
          key={tab.value}
          value={tab.value}
          className="space-y-4"
        >
          <TableContent />
        </TabsContent>
      ))}
    </Tabs>
  );
}
