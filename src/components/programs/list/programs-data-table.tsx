import { IconPlus } from "@tabler/icons-react";
import { type ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { SimpleDataTable } from "@/components/simple-data-table";
import type { ProgramWithRelations } from "@/types/program";
import { formatDistanceToNow } from "date-fns";
import { useCompanyRoutes } from "@/hooks/useCompanyRoutes";
import { useCompanyAwareNavigate } from "@/hooks/useCompanyAwareNavigate";
import { useCanAdmin } from "@/hooks/useUserCompanyRole";

interface ProgramsDataTableProps {
  data: ProgramWithRelations[];
  isLoading?: boolean;
}

export function ProgramsDataTable({
  data,
  isLoading = false,
}: ProgramsDataTableProps) {
  const userCanAdmin = useCanAdmin();
  const routes = useCompanyRoutes();
  const navigate = useCompanyAwareNavigate();

  const columns: ColumnDef<ProgramWithRelations>[] = [
    {
      accessorKey: "name",
      header: "Program Name",
      cell: ({ row }) => {
        const program = row.original;
        return (
          <Link
            to={routes.programDetail(program.id)}
            className="font-medium hover:underline"
          >
            {program.name}
          </Link>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const count = row.original.status;
        return (
          <Badge variant="secondary" className="capitalize">
            {count}
          </Badge>
        );
      },
    },
    {
      accessorKey: "presite_questionnaire",
      header: "Self-Audit",
      cell: ({ row }) => {
        const hasPresite = !!row.original.presite_questionnaire;
        return (
          <Badge variant={hasPresite ? "default" : "outline"}>
            {hasPresite ? "✓" : "—"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "onsite_questionnaire",
      header: "Onsite-Audit",
      cell: ({ row }) => {
        const hasOnsite = !!row.original.onsite_questionnaire;
        return (
          <Badge variant={hasOnsite ? "default" : "outline"}>
            {hasOnsite ? "✓" : "—"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "metrics_count",
      header: "Desktop Measurements",
      cell: ({ row }) => {
        const count = row.original.metrics_count || 0;
        return (
          <Badge variant={count > 0 ? "default" : "outline"}>
            {count > 0 ? count : "—"}
          </Badge>
        );
      },
    },
    // {
    //   accessorKey: "frequency_weeks",
    //   header: "Frequency",
    //   cell: ({ row }) => {
    //     const weeks = row.getValue("frequency_weeks") as number;
    //     return (
    //       <span>
    //         {weeks} week{weeks !== 1 ? "s" : ""}
    //       </span>
    //     );
    //   },
    // },

    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => {
        const createdAt = row.getValue("created_at") as string;
        return (
          <span className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </span>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="text-lg font-semibold">Loading programs...</div>
          <div className="text-sm text-muted-foreground">Please wait</div>
        </div>
      </div>
    );
  }

  return (
    <SimpleDataTable
      data={data}
      columns={columns}
      getRowId={(row) => row.id.toString()}
      enableSorting={true}
      enableFilters={true}
      enableColumnVisibility={true}
      filterPlaceholder="Search programs..."
      primaryAction={
        userCanAdmin
          ? {
              label: "Create Program",
              icon: IconPlus,
              onClick: () => navigate(routes.programsNew()),
            }
          : undefined
      }
    />
  );
}
