import { useMemo } from "react";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";
import { useRecommendations } from "@/hooks/useRecommendations";
import {
  SimpleDataTable,
  type SimpleDataTableTab,
} from "@/components/simple-data-table";
import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import type { RecommendationListItem } from "@/types/api/recommendations";
import { Link } from "react-router-dom";
import { IconExternalLink } from "@tabler/icons-react";
import { useCompanyRoutes } from "@/hooks/useCompanyRoutes";

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

export function RecommendationsTable() {
  const companyId = useCompanyFromUrl();
  const routes = useCompanyRoutes();
  const { data: recommendations = [], isLoading } =
    useRecommendations(companyId);

  // Create columns
  const columns: ColumnDef<RecommendationListItem>[] = [
    {
      accessorKey: "assessment",
      header: "Assessment",
      cell: ({ row }) => {
        const assessment = row.original.assessment;
        return (
          <div className="flex-1">
            <Link
              to={routes.assessmentDetails(
                assessment.type || "onsite",
                assessment.id
              )}
              className="text-xs text-primary hover:text-primary/80 underline inline-flex items-center gap-1"
              target="_blank"
              rel="noopener noreferrer"
            >
              {assessment.name}
              <IconExternalLink className="h-3 w-3" />
            </Link>
          </div>
        );
      },
      enableHiding: false,
    },
    {
      accessorKey: "program",
      header: "Program",
      cell: ({ row }) => {
        const program = row.original.program;
        if (!program || !program.id) {
          return (
            <div className="flex-1">
              <span className="text-xs text-muted-foreground italic">
                Not part of a program
              </span>
            </div>
          );
        }
        return (
          <div className="flex-1">
            <Link
              to={routes.programDetail(program.id)}
              className="text-xs text-primary hover:text-primary/80 underline inline-flex items-center gap-1"
              target="_blank"
              rel="noopener noreferrer"
            >
              {program.name}
              <IconExternalLink className="h-3 w-3" />
            </Link>
          </div>
        );
      },
      enableHiding: false,
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => {
        const title = row.original.title;
        return (
          <div className="font-medium whitespace-normal max-w-lg text-xs">
            {title}
          </div>
        );
      },
      enableHiding: false,
    },
    {
      accessorKey: "content",
      header: "Content",
      cell: ({ row }) => {
        const content = row.original.content;
        return (
          <div className="font-medium whitespace-normal max-w-lg text-xs">
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
          <div
            className="max-w-xl text-xs text-muted-foreground whitespace-normal"
            title={context}
          >
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
            <Badge
              variant={getPriorityVariant(priority)}
              className="capitalize"
            >
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
              {status.replace("_", " ")}
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
          <div className="flex justify-center text-xs">
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </div>
        );
      },
    },
    // {
    //   accessorKey: "updated_at",
    //   header: () => <div className="text-center">Last Updated</div>,
    //   cell: ({ row }) => {
    //     const updatedAt = row.original.updated_at;
    //     return (
    //       <div className="flex justify-center text-xs">
    //           {formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}
    //       </div>
    //     );
    //   },
    // },
  ];

  // Create tabs configuration with filtering
  const tabs: SimpleDataTableTab[] = useMemo(
    () => [
      {
        value: "all",
        label: "All Recommendations",
        data: recommendations,
        emptyStateTitle: "No recommendations found",
        emptyStateDescription: "No recommendations have been created yet.",
      },
      {
        value: "not_started",
        label: "Not Started",
        data: recommendations.filter((r) => r.status === "not_started"),
        emptyStateTitle: "No pending recommendations",
        emptyStateDescription:
          "All recommendations have been started or completed.",
      },
      {
        value: "in_progress",
        label: "In Progress",
        data: recommendations.filter((r) => r.status === "in_progress"),
        emptyStateTitle: "No active recommendations",
        emptyStateDescription: "No recommendations are currently in progress.",
      },
      {
        value: "completed",
        label: "Completed",
        data: recommendations.filter((r) => r.status === "completed"),
        emptyStateTitle: "No completed recommendations",
        emptyStateDescription: "No recommendations have been completed yet.",
      },
      {
        value: "high_priority",
        label: "High Priority",
        data: recommendations.filter((r) => r.priority === "high"),
        emptyStateTitle: "No high priority recommendations",
        emptyStateDescription: "No high priority recommendations found.",
      },
    ],
    [recommendations]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="text-lg font-semibold">
            Loading recommendations...
          </div>
          <div className="text-sm text-muted-foreground">
            Fetching recommendations
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-auto p-6">
      <SimpleDataTable
        data={recommendations}
        columns={columns}
        getRowId={(row) => `recommendation-${row.id}`}
        tabs={tabs}
        defaultTab="all"
        enableSorting={true}
        enableFilters={true}
        enableColumnVisibility={true}
        filterPlaceholder="Search recommendations..."
      />
    </div>
  );
}
