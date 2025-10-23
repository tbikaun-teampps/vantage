import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import type { Recommendation } from "@/lib/api/recommendations";

function getStatusVariant(status: string) {
  switch (status) {
    case "completed":
      return "default";
    case "in_progress":
      return "secondary";
    case "not_started":
      return "outline";
    default:
      return "outline";
  }
}

function getPriorityVariant(priority: string) {
  switch (priority) {
    case "high":
      return "destructive";
    case "medium":
      return "default";
    case "low":
      return "secondary";
    default:
      return "outline";
  }
}

export function createRecommendationsColumns(): ColumnDef<Recommendation>[] {
  return [
    {
      accessorKey: "content",
      header: "Content",
      cell: ({ row }) => {
        const content = row.original.content;
        return (
          <div className="font-medium whitespace-normal max-w-lg">
            {content}
          </div>
        );
      },
      enableHiding: false,
    },
    {
      accessorKey: "context",
      header: "Context",
      cell: ({ row }) => {
        const context = row.original.context;
        return (
          <div className="max-w-sm text-sm text-muted-foreground whitespace-normal" title={context}>
            {context}
          </div>
        );
      },
    },
    {
      accessorKey: "priority",
      header: () => <div className="text-center">Priority</div>,
      cell: ({ row }) => {
        const priority = row.original.priority;
        return (
          <div className="flex justify-center">
            <Badge variant={getPriorityVariant(priority)} className="capitalize">
              {priority}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <div className="flex justify-center">
            <Badge variant={getStatusVariant(status)} className="capitalize">
              {status.replace('_', ' ')}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: () => <div className="text-center">Created</div>,
      cell: ({ row }) => {
        const createdAt = row.original.created_at;
        return (
          <div className="flex justify-center">
            <Badge variant="outline">
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "updated_at",
      header: () => <div className="text-center">Updated</div>,
      cell: ({ row }) => {
        const updatedAt = row.original.updated_at;
        return (
          <div className="flex justify-center">
            <Badge variant="outline">
              {formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}
            </Badge>
          </div>
        );
      },
    },
  ];
}