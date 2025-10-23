import React from "react";
import {
  IconExternalLink,
  IconClock,
  IconCircleCheckFilled,
  IconPlayerPause,
  IconArchive,
  IconPlus,
  IconLock,
  IconLockOpen,
  IconCopy,
  IconLoader2,
  IconEyeOff,
  IconMail,
  IconDots,
  IconTrash,
} from "@tabler/icons-react";
import { type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { SimpleDataTable } from "@/components/simple-data-table";
import { useInterviewActions } from "@/hooks/interview/useInterviewActions";
import type { InterviewWithResponses } from "@/types/assessment";
import { useCompanyRoutes } from "@/hooks/useCompanyRoutes";
import { sendInterviewReminder } from "@/lib/api/emails";
import { useAuthStore } from "@/stores/auth-store";
interface InterviewsDataTableProps {
  data: InterviewWithResponses[];
  isLoading?: boolean;
  defaultTab?: string;
  onTabChange?: (tabValue: string) => void;
  onCreateInterview?: () => void;
}

export function InterviewsDataTable({
  data,
  isLoading = false,
  defaultTab = "all",
  onTabChange,
  onCreateInterview,
}: InterviewsDataTableProps) {
  const { updateInterview, deleteInterview } = useInterviewActions();
  const [togglingInterviewId, setTogglingInterviewId] = React.useState<
    number | null
  >(null);
  const [sendingEmailId, setSendingEmailId] = React.useState<number | null>(
    null
  );
  const routes = useCompanyRoutes();

  // Get user and company info for email sender details
  const { user } = useAuthStore();

  // Status icons helper
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return (
          <IconCircleCheckFilled className="mr-1 h-3 w-3 text-green-500" />
        );
      case "in_progress":
        return <IconClock className="mr-1 h-3 w-3 text-blue-500" />;
      case "pending":
        return <IconPlayerPause className="mr-1 h-3 w-3 text-red-500" />;
      case "archived":
        return <IconArchive className="mr-1 h-3 w-3 text-gray-500" />;
      default:
        return <IconClock className="mr-1 h-3 w-3 text-gray-500" />;
    }
  };

  const handleToggleEnabled = async (
    interviewId: number,
    newEnabledState: boolean
  ) => {
    setTogglingInterviewId(interviewId);
    try {
      await updateInterview({
        id: interviewId,
        updates: { enabled: newEnabledState },
      });
      toast.success(
        `Interview ${newEnabledState ? "enabled" : "disabled"} successfully`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update interview status";
      toast.error(errorMessage);
    } finally {
      setTogglingInterviewId(null);
    }
  };

  const handleCopyIndividualLink = (interview: InterviewWithResponses) => {
    if (!interview.enabled || !interview.is_individual) {
      toast.error("Interview must be enabled to copy individual interview link");
      return;
    }

    const publicUrl = `${window.location.origin}/external/interview/${interview.id}?code=${interview.access_code}&email=${interview.interviewee.email}`;
    navigator.clipboard
      .writeText(publicUrl)
      .then(() => {
        toast.success("Individual interview link copied to clipboard");
      })
      .catch(() => {
        toast.error("Failed to copy link to clipboard");
      });
  };

  const handleSendReminderEmail = async (interview: InterviewWithResponses) => {
    if (!interview.enabled || !interview.is_individual) {
      toast.error("Interview must be enabled to send reminder");
      return;
    }

    if (!interview.interviewee.email) {
      toast.error("No email address found for this interview");
      return;
    }

    if (!user?.email) {
      toast.error("Unable to identify sender for email");
      return;
    }

    setSendingEmailId(interview.id);
    try {
      const result = await sendInterviewReminder(interview.id);

      if (result.success) {
        toast.success("Interview reminder sent successfully!");
      } else {
        toast.error(result.message || "Failed to send email");
      }
    } catch (error) {
      console.error("Email sending error:", error);
      toast.error("Failed to send email. Please try again.");
    } finally {
      setSendingEmailId(null);
    }
  };

  const handleDeleteInterview = async (interview: InterviewWithResponses) => {
    try {
      await deleteInterview(interview.id);
      toast.success("Interview deleted successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete interview";
      toast.error(errorMessage);
    }
  };

  // Column definitions
  const columns: ColumnDef<InterviewWithResponses>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        return (
          <div className="flex-1">
            <Link
              to={
                row.original.is_individual
                  ? routes.externalInterviewDetail(
                      row.original.id,
                      row.original.access_code,
                      row.original.interviewee.email
                    )
                  : routes.interviewDetail(row.original.id)
              }
              className="text-primary hover:text-primary/80 underline inline-flex items-center gap-1"
              target="_blank"
              rel="noopener noreferrer"
            >
              {row.original.name}
              <IconExternalLink className="h-3 w-3" />
            </Link>
          </div>
        );
      },
    },
    {
      accessorKey: "is_individual",
      header: "Individual",
      cell: ({ row }) => {
        const interview = row.original;
        return interview.is_individual ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Badge
                variant={interview.enabled ? "default" : "outline"}
                className={`cursor-pointer hover:opacity-80 transition-opacity ${
                  interview.enabled
                    ? "bg-green-100 text-green-800 border-green-300 hover:bg-green-200"
                    : "border-orange-300 text-orange-800 hover:bg-orange-50"
                } ${
                  togglingInterviewId === interview.id ||
                  sendingEmailId === interview.id
                    ? "opacity-50"
                    : ""
                }`}
              >
                {togglingInterviewId === interview.id ||
                sendingEmailId === interview.id ? (
                  <IconLoader2 className="h-3 w-3 animate-spin mr-1" />
                ) : interview.enabled ? (
                  <IconLockOpen className="h-3 w-3 mr-1" />
                ) : (
                  <IconLock className="h-3 w-3 mr-1" />
                )}
                Public
              </Badge>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  handleToggleEnabled(interview.id, !interview.enabled);
                }}
                disabled={togglingInterviewId === interview.id}
              >
                {interview.enabled ? (
                  <>
                    <IconLock className="mr-2 h-4 w-4" />
                    Disable Access
                  </>
                ) : (
                  <>
                    <IconLockOpen className="mr-2 h-4 w-4" />
                    Enable Access
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  handleCopyIndividualLink(interview);
                }}
                disabled={
                  !interview.enabled ||
                  !interview.access_code ||
                  !interview.interviewee.email
                }
              >
                <IconCopy className="mr-2 h-4 w-4" />
                Copy Public Link
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  handleSendReminderEmail(interview);
                }}
                disabled={
                  !interview.enabled ||
                  !interview.access_code ||
                  !interview.interviewee.email ||
                  sendingEmailId === interview.id
                }
              >
                {sendingEmailId === interview.id ? (
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <IconMail className="mr-2 h-4 w-4" />
                )}
                {sendingEmailId === interview.id
                  ? "Sending..."
                  : "Send Reminder Email"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Badge variant="secondary">
            <IconEyeOff className="h-3 w-3 mr-1" />
            Private
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(row.original.status)}
          <Badge variant="outline" className="capitalize">
            {row.original.status.replace("_", " ")}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "completion_rate",
      header: () => <div className="text-center">Completion</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Badge variant="outline">
            {Math.round(row.original.completion_rate * 100)}%
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "average_score",
      header: () => <div className="text-center">Average Score</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Badge variant="outline">
            {Math.round(row.original.average_score)}/
            {row.original.max_rating_value}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "interviewer",
      header: "Interviewer",
      cell: ({ row }) => (
        <div
          className="max-w-32 truncate text-xs"
          title={row.original.interviewer.name || undefined}
        >
          {row.original.interviewer.name || "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "interviewee",
      header: "Interviewee",
      cell: ({ row }) => (
        <div className="max-w-32 text-xs">
          <div className="flex flex-col space-y-1">
            {row.original.interviewee.full_name && (
              <div
                className="font-medium truncate"
                title={row.original.interviewee.full_name}
              >
                {row.original.interviewee.full_name}
              </div>
            )}
            <div
              className="text-muted-foreground truncate"
              title={row.original.interviewee.email || undefined}
            >
              {row.original.interviewee.email || "N/A"}
            </div>
            {row.original.interviewee.title && (
              <div
                className="text-muted-foreground text-xs truncate"
                title={row.original.interviewee.title}
              >
                {row.original.interviewee.title}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Roles",
      cell: ({ row }) => (
        <div
          className="max-w-24 truncate text-xs"
          title={row.original.interviewee.role || undefined}
        >
          {row.original.interviewee.role || "All"}
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const interview = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 transition-colors"
                aria-label={`Actions for ${interview.name}`}
              >
                <IconDots className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <IconTrash className="mr-2 h-4 w-4" />
                    Delete Interview
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Interview</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{interview.name}"? This
                      action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeleteInterview(interview)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Filter data by status for tabs
  const allInterviews = data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="text-lg font-semibold">Loading interviews...</div>
          <div className="text-sm text-muted-foreground">Please wait</div>
        </div>
      </div>
    );
  }

  return (
    <SimpleDataTable
      data={allInterviews}
      columns={columns}
      getRowId={(row) => row.id.toString()}
      defaultTab={defaultTab}
      onTabChange={onTabChange}
      enableSorting={true}
      enableFilters={true}
      enableColumnVisibility={true}
      filterPlaceholder="Search interviews..."
      primaryAction={
        onCreateInterview
          ? {
              label: "New Interview",
              icon: IconPlus,
              onClick: onCreateInterview,
            }
          : undefined
      }
    />
  );
}
