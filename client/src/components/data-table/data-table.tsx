// components/data-table/data-table.tsx
import * as React from "react";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconLayoutColumns,
  IconFilter,
} from "@tabler/icons-react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Skeleton } from "@/components/ui/skeleton";
import { type DataTableConfig } from "./types";

// Loading skeleton component
function DataTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Skeleton className="h-8 w-32" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-32" />
        </div>
      </div>
      <div className="px-4 lg:px-6">
        <div className="rounded-lg border">
          <div className="p-4">
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-8" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Empty state component
function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">{title.replace("_", " ")}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

// Helper function to create standard columns
function createStandardColumns<T>(config: {
  enableRowSelection?: boolean;
  getRowId: (row: T) => string;
}): ColumnDef<T>[] {
  const columns: ColumnDef<T>[] = [];

  if (config.enableRowSelection) {
    columns.push({
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    });
  }

  return columns;
}

// Main reusable data table component
export function DataTable<T>(config: DataTableConfig<T>) {
  const {
    data: initialData,
    columns: baseColumns,
    getRowId,
    isLoading = false,
    enableRowSelection = true,
    enableSorting = true,
    tabs,
    defaultTab,
    getStatusCounts,
    filterByStatus,
    primaryAction,
    getEmptyStateContent,
    defaultPageSize = 10,
    pageSizeOptions = [10, 20, 30, 40, 50],
    tableMeta,
    showFiltersButton = true,
    onRowClick,
  } = config;

  const [data, setData] = React.useState(() => initialData);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });
  const [activeTab, setActiveTab] = React.useState(defaultTab);

  // Update local data when prop changes
  React.useEffect(() => {
    setData(initialData);
  }, [initialData]);

  // Combine standard columns with custom columns
  const columns = React.useMemo(() => {
    const standardColumns = createStandardColumns({
      enableRowSelection,
      getRowId,
    });
    return [...standardColumns, ...baseColumns];
  }, [baseColumns, enableRowSelection, getRowId]);

  // Calculate filtered data based on active tab
  const filteredData = React.useMemo(() => {
    if (!filterByStatus || !activeTab) return data;
    return filterByStatus(data, activeTab);
  }, [data, activeTab, filterByStatus]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      ...(enableSorting && { sorting }),
      columnVisibility,
      ...(enableRowSelection && { rowSelection }),
      columnFilters,
      pagination,
    },
    getRowId,
    enableRowSelection,
    enableSorting,
    ...(enableRowSelection && { onRowSelectionChange: setRowSelection }),
    ...(enableSorting && { onSortingChange: setSorting }),
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    ...(enableSorting && { getSortedRowModel: getSortedRowModel() }),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    meta: tableMeta,
  });

  // Get status counts for tabs
  const statusCounts = React.useMemo(() => {
    return getStatusCounts ? getStatusCounts(data) : {};
  }, [data, getStatusCounts]);

  if (isLoading) {
    return <DataTableSkeleton />;
  }

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full flex-col justify-start gap-6"
    >
      {/* Header Controls */}
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Label htmlFor="view-selector" className="sr-only">
          View
        </Label>
        <Select value={activeTab} onValueChange={setActiveTab}>
          <SelectTrigger
            className="flex w-fit @6xl/main:hidden"
            size="sm"
            id="view-selector"
          >
            <SelectValue placeholder="Select a view" />
          </SelectTrigger>
          <SelectContent>
            {tabs.map((tab) => (
              <SelectItem key={tab.value} value={tab.value}>
                {tab.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @6xl/main:flex">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}{" "}
              {statusCounts[tab.value] > 0 && (
                <Badge variant="secondary">{statusCounts[tab.value]}</Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex items-center gap-2">
          {showFiltersButton && (
            <Button variant="outline" size="sm" disabled>
              <IconFilter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns />
                <span className="hidden lg:inline">Customize Columns</span>
                <span className="lg:hidden">Columns</span>
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
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
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          {primaryAction && (
            <Button size="sm" onClick={primaryAction.onClick}>
              {primaryAction.icon && <primaryAction.icon />}
              <span className="hidden lg:inline">{primaryAction.label}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Tab Contents */}
      {tabs.map((tab) => (
        <TabsContent
          key={tab.value}
          value={tab.value}
          className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
        >
          {tab.content ? (
            tab.content
          ) : (
            <DataTableContent
              data={filteredData}
              table={table}
              columns={columns}
              getRowId={getRowId}
              pageSizeOptions={pageSizeOptions}
              getEmptyStateContent={getEmptyStateContent}
              tabStatus={tab.value}
              onRowClick={onRowClick}
              tableMeta={tableMeta}
            />
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}

// Separate component for table content to avoid repetition
function DataTableContent<T>({
  data,
  table,
  columns,
  getRowId,
  pageSizeOptions,
  getEmptyStateContent,
  tabStatus,
  onRowClick,
  tableMeta,
}: {
  data: T[];
  table: any;
  columns: ColumnDef<T>[];
  getRowId: (row: T) => string;
  pageSizeOptions: number[];
  getEmptyStateContent?: (status: string) => {
    title: string;
    description: string;
  };
  tabStatus: string;
  onRowClick?: (row: T) => void;
  tableMeta?: any;
}) {
  if (data.length === 0 && getEmptyStateContent) {
    const emptyState = getEmptyStateContent(tabStatus);
    return (
      <EmptyState
        title={emptyState.title}
        description={emptyState.description}
      />
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup: any) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header: any) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="**:data-[slot=table-cell]:first:w-8">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row: any) => {
                const isSelected =
                  tableMeta?.selectedRowId === getRowId(row.original);
                return (
                  <TableRow
                    key={getRowId(row.original)}
                    data-state={row.getIsSelected() && "selected"}
                    className={`transition-colors ${
                      onRowClick ? "cursor-pointer hover:bg-muted/50" : ""
                    } ${isSelected ? "bg-primary/10" : ""}`}
                    onClick={() => onRowClick?.(row.original)}
                  >
                    {row.getVisibleCells().map((cell: any) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4">
        <div className="text-muted-foreground hidden flex-1 text-sm lg:flex" />
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              Rows per page
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
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
              <span className="sr-only">Go to first page</span>
              <IconChevronsLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <IconChevronLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <IconChevronRight />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <IconChevronsRight />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
