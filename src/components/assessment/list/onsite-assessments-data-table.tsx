import {
  IconUsers,
  IconPencil,
  IconClock,
  IconCircleCheckFilled,
  IconEye,
  IconArchive,
  IconPlus,
} from "@tabler/icons-react";
import { type ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  SimpleDataTable,
  type SimpleDataTableTab,
} from "@/components/simple-data-table";
import { useAssessmentContext } from "@/hooks/useAssessmentContext";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from "date-fns";
import { useCompanyRoutes } from "@/hooks/useCompanyRoutes";
import { useCanAdmin } from "@/hooks/useUserCompanyRole";
import type { AssessmentStatus, GetAssessmentsResponseData } from "@/types/api/assessments";

interface OnsiteAssessmentsDataTableProps {
  data: GetAssessmentsResponseData;
  isLoading?: boolean;
  defaultTab?: string;
  onTabChange?: (tabValue: string) => void;
  onCreateAssessment?: () => void;
}

export function OnsiteAssessmentsDataTable({
  data,
  isLoading = false,
  defaultTab = "all",
  onTabChange,
  onCreateAssessment,
}: OnsiteAssessmentsDataTableProps) {
  const userCanAdmin = useCanAdmin();

  const { assessmentType } = useAssessmentContext();
  const routes = useCompanyRoutes();

  const getStatusIcon = (status: AssessmentStatus) => {
    switch (status) {
      case "completed":
        return <IconCircleCheckFilled className="h-3 w-3 text-green-500" />;
      case "active":
        return <IconClock className="h-3 w-3 text-blue-500" />;
      case "draft":
        return <IconPencil className="h-3 w-3 text-red-500" />;
      case "under_review":
        return <IconEye className="h-3 w-3 text-yellow-500" />;
      case "archived":
        return <IconArchive className="h-3 w-3 text-gray-500" />;
      default:
        return <IconClock className="h-3 w-3 text-gray-500" />;
    }
  };

  // Column definitions
  const columns: ColumnDef<GetAssessmentsResponseData[number]>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex-1">
          <Link
            to={routes.assessmentDetails(row.original.type, row.original.id)}
            className="text-primary hover:text-primary/80 underline inline-flex items-center gap-1"
          >
            {row.original.name}
          </Link>
        </div>
      ),
    },
    {
      accessorKey: "questionnaire_name",
      header: "Questionnaire",
      cell: ({ row }) => {
        const hasQuestionnaire = row.original.questionnaire_id !== null;

        if (!hasQuestionnaire) {
          return <div className="text-muted-foreground">No Questionnaire</div>;
        }

        return (
          <div className="flex-1">
            <Link
              to={routes.questionnaireDetail(
                row.original.questionnaire_id!.toString()
              )}
              className="text-primary hover:text-primary/80 underline inline-flex items-center gap-1 group"
              title={row.original.questionnaire_name}
            >
              <span className="truncate">
                {row.original.questionnaire_name}
              </span>
            </Link>
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => <Badge variant="outline">{row.original.type}</Badge>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="flex items-center ">
          {getStatusIcon(row.original.status)}
          <span className="capitalize ml-2">
            {row.original.status.replaceAll("_", " ")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "interview_count",
      header: "Interview Progress",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <IconUsers className="h-3 w-3 text-muted-foreground" />
          <Progress
            value={Math.round(
              (row.original.completed_interview_count /
                row.original.interview_count) *
                100
            )}
            className="w-20"
          />
          <span className="text-sm text-muted-foreground">
            {row.original.interview_count === 0
              ? "0%"
              : `${Math.round(
                  (row.original.completed_interview_count /
                    row.original.interview_count) *
                    100
                )}%`}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "total_responses",
      header: () => <div className="text-center">Responses</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Badge variant="outline">{row.original.total_responses}</Badge>
        </div>
      ),
    },
    {
      accessorKey: "created_at",
      header: () => <div className="text-center">Created</div>,
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground text-center">
          {formatDistanceToNow(row.original.created_at, { addSuffix: true })}
        </div>
      ),
    },
    {
      accessorKey: "updated_at",
      header: () => <div className="text-center">Last Modified</div>,
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground text-center">
          {formatDistanceToNow(row.original.updated_at, { addSuffix: true })}
        </div>
      ),
    },
  ];

  // Filter data by status for tabs
  const allAssessments = data;
  const activeAssessments = data.filter((a) => a.status === "active");
  const draftAssessments = data.filter((a) => a.status === "draft");
  const underReviewAssessments = data.filter(
    (a) => a.status === "under_review"
  );
  const completedAssessments = data.filter((a) => a.status === "completed");
  const archivedAssessments = data.filter((a) => a.status === "archived");

  // Define tabs
  const tabs: SimpleDataTableTab[] = [
    {
      value: "all",
      label: "All",
      data: allAssessments,
      emptyStateTitle: `No ${assessmentType || ""} assessments`,
      emptyStateDescription: `Create your first ${
        assessmentType || ""
      } assessment to get started.`,
    },
    {
      value: "active",
      label: "Active",
      data: activeAssessments,
      emptyStateTitle: `No active ${assessmentType || ""} assessments`,
      emptyStateDescription: `No ${
        assessmentType || ""
      } assessments are currently active.`,
    },
    {
      value: "draft",
      label: "Draft",
      data: draftAssessments,
      emptyStateTitle: `No draft ${assessmentType || ""} assessments`,
      emptyStateDescription: `Create a new ${
        assessmentType || ""
      } assessment to get started.`,
    },
    {
      value: "under_review",
      label: "Under Review",
      data: underReviewAssessments,
      emptyStateTitle: `No ${assessmentType || ""} assessments under review`,
      emptyStateDescription: `No ${
        assessmentType || ""
      } assessments are under review at the moment.`,
    },
    {
      value: "completed",
      label: "Completed",
      data: completedAssessments,
      emptyStateTitle: `No completed ${assessmentType || ""} assessments`,
      emptyStateDescription: `No ${
        assessmentType || ""
      } assessments have been completed yet.`,
    },
    {
      value: "archived",
      label: "Archived",
      data: archivedAssessments,
      emptyStateTitle: `No archived ${assessmentType || ""} assessments`,
      emptyStateDescription: `No ${
        assessmentType || ""
      } assessments have been archived.`,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="text-lg font-semibold">
            Loading {assessmentType || ""} assessments...
          </div>
          <div className="text-sm text-muted-foreground">Please wait</div>
        </div>
      </div>
    );
  }

  return (
    <SimpleDataTable
      data={allAssessments}
      columns={columns}
      getRowId={(row) => row.id.toString()}
      tabs={tabs}
      defaultTab={defaultTab}
      onTabChange={onTabChange}
      enableSorting={true}
      enableFilters={true}
      enableColumnVisibility={true}
      filterPlaceholder="Search assessments..."
      primaryAction={
        userCanAdmin && onCreateAssessment
          ? {
              label: "New Assessment",
              icon: IconPlus,
              onClick: onCreateAssessment,
            }
          : undefined
      }
    />
  );
}
