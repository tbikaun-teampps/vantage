import {
  IconPencil,
  IconCircleCheckFilled,
  IconEye,
  IconArchive,
  IconPlus,
} from "@tabler/icons-react";
import { type ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import {
  SimpleDataTable,
  type SimpleDataTableTab,
} from "@/components/simple-data-table";
import { formatDistanceToNow } from "date-fns";
import { useCompanyAwareNavigate } from "@/hooks/useCompanyAwareNavigate";
import { useCompanyRoutes } from "@/hooks/useCompanyRoutes";
import { useCanAdmin } from "@/hooks/useUserCompanyRole";
import type { GetQuestionnairesResponseData } from "@/types/api/questionnaire";

interface QuestionnairesDataTableProps {
  questionnaires: GetQuestionnairesResponseData;
  isLoading: boolean;
  error?: string | null;
  defaultTab?: string;
  onTabChange?: (tabValue: string) => void;
  onRetry?: () => void;
}

export function QuestionnairesDataTable({
  questionnaires,
  isLoading,
  defaultTab = "all",
  onTabChange,
}: QuestionnairesDataTableProps) {
  const userCanAdmin = useCanAdmin();
  const navigate = useCompanyAwareNavigate();
  const routes = useCompanyRoutes();

  // Status icons helper
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft":
        return <IconPencil className="h-3 w-3 text-blue-500" />;
      case "published":
        return <IconCircleCheckFilled className="h-3 w-3 text-green-500" />;
      case "under_review":
        return <IconEye className="h-3 w-3 text-yellow-500" />;
      case "archived":
        return <IconArchive className="h-3 w-3 text-gray-500" />;
      default:
        return <IconPencil className="h-3 w-3 text-red-500" />;
    }
  };

  // Column definitions
  const columns: ColumnDef<GetQuestionnairesResponseData[number]>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <Link
          to={routes.questionnaireDetail(row.original.id)}
          className="text-primary hover:text-primary/80 underline inline-flex items-center gap-1"
        >
          <span className="max-w-[160px] truncate" title={row.original.name}>
            {row.original.name}
          </span>
        </Link>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div
          className="text-sm max-w-[160px] truncate"
          title={row.original.description ?? "No Description"}
        >
          {row.original.description || "No Description"}
        </div>
      ),
    },
    {
      accessorKey: "section_count",
      header: () => <div className="text-center">Sections</div>,
      cell: ({ row }) => (
        <div className="text-sm text-center">{row.original.section_count}</div>
      ),
    },
    {
      accessorKey: "step_count",
      header: () => <div className="text-center">Steps</div>,
      cell: ({ row }) => (
        <div className="text-sm text-center">{row.original.step_count}</div>
      ),
    },
    {
      accessorKey: "question_count",
      header: () => <div className="text-center">Questions</div>,
      cell: ({ row }) => (
        <div className="text-sm text-center">{row.original.question_count}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="w-20 h-8 text-center">
          <div className="flex items-center justify-center">
            {getStatusIcon(row.original.status)}
            <span className="capitalize ml-2">
              {row.original.status.replaceAll("_", " ")}
            </span>
          </div>
        </div>
      ),
    },
    // TODO: add this column. Need server role to join this data on the server though.
    // {
    //   accessorKey: "created_by",
    //   header: "Created By",
    //   cell: ({ row }) => (
    //     <div className="text-sm text-muted-foreground">
    //       {row.original.created_by || "N/A"}
    //     </div>
    //   ),
    // },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {formatDistanceToNow(row.original.created_at, { addSuffix: true })}
        </div>
      ),
    },
    {
      accessorKey: "updated_at",
      header: "Last Modified",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {formatDistanceToNow(row.original.updated_at, { addSuffix: true })}
        </div>
      ),
    },
  ];

  // Filter data by status for tabs
  const allQuestionnaires = questionnaires;
  const publishedQuestionnaires = questionnaires.filter(
    (q) => q.status === "published"
  );
  const draftQuestionnaires = questionnaires.filter(
    (q) => q.status === "draft"
  );
  const underReviewQuestionnaires = questionnaires.filter(
    (q) => q.status === "under_review"
  );
  const archivedQuestionnaires = questionnaires.filter(
    (q) => q.status === "archived"
  );

  // Define tabs
  const tabs: SimpleDataTableTab[] = [
    {
      value: "all",
      label: "All",
      data: allQuestionnaires,
      emptyStateTitle: "No questionnaires",
      emptyStateDescription: "Create your first questionnaire to get started.",
    },
    {
      value: "published",
      label: "Published",
      data: publishedQuestionnaires,
      emptyStateTitle: "No published questionnaires",
      emptyStateDescription: "No published questionnaires at the moment.",
    },
    {
      value: "under_review",
      label: "Under Review",
      data: underReviewQuestionnaires,
      emptyStateTitle: "No questionnaires under review",
      emptyStateDescription:
        "No questionnaires are under review at the moment.",
    },
    {
      value: "draft",
      label: "Draft",
      data: draftQuestionnaires,
      emptyStateTitle: "No draft questionnaires",
      emptyStateDescription: "Create a new questionnaire to get started.",
    },
    {
      value: "archived",
      label: "Archived",
      data: archivedQuestionnaires,
      emptyStateTitle: "No archived questionnaires",
      emptyStateDescription: "No archived questionnaires.",
    },
  ];

  const handleNewQuestionnaire = () => {
    navigate("/questionnaires/new");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="text-lg font-semibold">Loading questionnaires...</div>
          <div className="text-sm text-muted-foreground">Please wait</div>
        </div>
      </div>
    );
  }

  return (
    <SimpleDataTable
      data={allQuestionnaires}
      columns={columns}
      getRowId={(row) => row.id.toString()}
      tabs={tabs}
      defaultTab={defaultTab}
      onTabChange={onTabChange}
      enableSorting={true}
      enableFilters={true}
      enableColumnVisibility={true}
      filterPlaceholder="Search questionnaires..."
      primaryAction={
        userCanAdmin
          ? {
              label: "New Questionnaire",
              icon: IconPlus,
              onClick: handleNewQuestionnaire,
            }
          : undefined
      }
    />
  );
}
