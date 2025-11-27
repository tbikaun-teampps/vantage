import { DashboardPage } from "@/components/dashboard";
import { Badge } from "@/components/ui/badge";
import { IconDownload } from "@tabler/icons-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { downloadAuditLogs } from "@/lib/api/auditlogs";
import type { AuditLogListItem } from "@/types/api/audit";
import { SimpleDataTable } from "@/components/simple-data-table";
import { type ColumnDef } from "@tanstack/react-table";

const columns: ColumnDef<AuditLogListItem>[] = [
  {
    accessorKey: "user",
    header: "User",
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <span className="font-medium">{row.original.user.full_name}</span>
        <span className="text-xs text-muted-foreground">
          {row.original.user.email}
        </span>
      </div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "message",
    header: "Message",
    cell: ({ row }) => <span className="text-sm">{row.original.message}</span>,
    enableSorting: true,
  },
  {
    accessorKey: "changed_fields",
    header: "Changed Fields",
    cell: ({ row }) => {
      if (!row.original.changed_fields?.length) {
        return <span className="text-muted-foreground">—</span>;
      }
      return (
        <div className="flex gap-1 flex-wrap max-w-xs">
          {row.original.changed_fields.map((field: string) => (
            <Badge key={field} variant="outline" className="text-xs">
              {field}
            </Badge>
          ))}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "created_at",
    header: "Performed At",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {formatDistanceToNow(new Date(row.original.created_at), {
          addSuffix: true,
        })}
      </span>
    ),
    enableSorting: true,
  },
];

export function AuditLogsPage() {
  const companyId = useCompanyFromUrl();
  const { data, isLoading, isError } = useAuditLogs(companyId);

  const handleDownload = async () => {
    try {
      const blob = await downloadAuditLogs(companyId);

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
      toast.success("Audit logs downloaded successfully");
    } catch (error) {
      console.error("Failed to download audit logs:", error);
      toast.error("Failed to download audit logs");
    }
  };

  if (isLoading) {
    return (
      <DashboardPage
        title="Audit Logs"
        description="View audit logs for this company"
        tourId="audit-logs"
      >
        <div className="p-6">
          <div className="text-sm text-muted-foreground">
            Loading audit logs...
          </div>
        </div>
      </DashboardPage>
    );
  }

  if (isError) {
    return (
      <DashboardPage
        title="Audit Logs"
        description="View audit logs for this company"
        tourId="audit-logs"
      >
        <div className="p-6">
          <div className="text-sm text-destructive">
            Error loading audit logs. Please try again.
          </div>
        </div>
      </DashboardPage>
    );
  }

  return (
    <DashboardPage
      title="Audit Logs"
      description="View audit logs for this company"
      tourId="audit-logs"
    >
      <div className="p-6 max-h-[calc(100vh-10rem)] overflow-y-auto">
        <SimpleDataTable
          data={data || []}
          columns={columns}
          getRowId={(log) => String(log.id)}
          enableSorting={true}
          enableFilters={true}
          enableColumnVisibility={true}
          filterPlaceholder="Search audit logs..."
          secondaryAction={{
            label: "Download",
            icon: IconDownload,
            onClick: handleDownload,
          }}
          defaultPageSize={50}
          pageSizeOptions={[25, 50, 100]}
        />
      </div>
    </DashboardPage>
  );
}
