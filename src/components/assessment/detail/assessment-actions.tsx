import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconActivity } from "@tabler/icons-react";
import { getActionsByAssessmentId } from "@/lib/api/assessments";
import { SimpleDataTable } from "@/components/simple-data-table";
import { type ColumnDef } from "@tanstack/react-table";
import { formatDistance } from "date-fns";
import type { GetActionsByAssessmentIdResponseData } from "@/types/api/assessments";

interface AssessmentActionsProps {
  assessmentId: number;
}

export function AssessmentActions({ assessmentId }: AssessmentActionsProps) {
  const [actions, setActions] = useState<GetActionsByAssessmentIdResponseData>(
    []
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadActions = async () => {
      if (!assessmentId) {
        setActions([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const actionsData = await getActionsByAssessmentId(assessmentId);
        setActions(actionsData);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to load actions"
        );
        setActions([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadActions();
  }, [assessmentId]);

  // Column definitions
  const columns: ColumnDef<GetActionsByAssessmentIdResponseData[number]>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div className="font-medium text-sm truncate">{row.original.title}</div>
      ),
    },
    {
      accessorKey: "description",
      header: () => <div>Description</div>,
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.description || "No description"}
        </div>
      ),
    },
    {
      accessorKey: "question_title",
      header: "Question",
      cell: ({ row }) => (
        <div
          className="text-sm max-w-md truncate"
          title={row.original.question_title}
        >
          {row.original.question_title}
        </div>
      ),
    },
    {
      accessorKey: "interview_name",
      header: "Interview",
      cell: ({ row }) => (
        <div className="text-sm font-medium">{row.original.interview_name}</div>
      ),
    },
    {
      accessorKey: "created_by",
      header: () => <div>Author</div>,
      cell: ({ row }) => {
        const author = row.original.created_by;
        if (!author) {
          return <div className="text-sm text-muted-foreground">Unknown</div>;
        }
        return (
          <div className="text-sm">
            {author.full_name}{" "}
            <span className="text-muted-foreground">({author.email})</span>
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: () => <div>Created</div>,
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {formatDistance(new Date(row.original.created_at), new Date(), {
            addSuffix: true,
          })}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <Card className="shadow-none border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconActivity className="h-5 w-5" />
            Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-sm text-muted-foreground">
              Loading actions...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-none border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconActivity className="h-5 w-5" />
            Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-destructive text-sm">
              Error loading actions: {error}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-none border-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconActivity className="h-5 w-5" />
          Actions
          {actions.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              ({actions.length} {actions.length === 1 ? "action" : "actions"})
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Actions created during interviews in this assessment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SimpleDataTable
          data={actions}
          columns={columns}
          getRowId={(row) => row.id.toString()}
          enableSorting={true}
          enableFilters={true}
          enableColumnVisibility={true}
          filterPlaceholder="Search actions..."
          defaultPageSize={10}
          pageSizeOptions={[10, 20, 30]}
          tabs={[
            {
              value: "all",
              label: "All Actions",
              data: actions,
              emptyStateTitle: "No Actions",
              emptyStateDescription:
                "No actions have been created for this assessment yet.",
            },
          ]}
          defaultTab="all"
        />
      </CardContent>
    </Card>
  );
}
