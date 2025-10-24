import React from "react";
import {
  IconExternalLink,
  IconClock,
  IconCircleCheckFilled,
  IconPlayerPause,
  IconCancel,
  IconPlus,
  IconLock,
  IconLockOpen,
  IconCopy,
  IconLoader2,
  IconEyeOff,
  IconMail,
  IconDots,
  IconTrash,
  IconEye,
  IconCalendar,
  IconEdit,
  IconUsers,
  IconUser,
} from "@tabler/icons-react";
import { type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
} from "@/components/ui/alert-dialog";
import {
  SimpleDataTable,
  type SimpleDataTableTab,
} from "@/components/simple-data-table";
import { useInterviewActions } from "@/hooks/interview/useInterviewActions";
import type {
  InterviewWithResponses,
  InterviewWithDetails,
} from "@/types/assessment";
import { useCompanyRoutes } from "@/hooks/useCompanyRoutes";
import { sendInterviewReminder, sendInterviewSummary } from "@/lib/api/emails";
import { useCanAdmin } from "@/hooks/useUserCompanyRole";
import { useCompanyAwareNavigate } from "@/hooks/useCompanyAwareNavigate";
import { InterviewSettingsDialog } from "@/components/interview/detail/InterviewSettingsDialog";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface InterviewsDataTableProps {
  data: InterviewWithResponses[] | InterviewWithDetails[];
  isLoading?: boolean;
  showAssessmentColumn?: boolean;
  showProgramColumn?: boolean;
  defaultTab?: string;
  onTabChange?: (tabValue: string) => void;
  onCreateInterview?: () => void;
}

type InterviewData = InterviewWithResponses | InterviewWithDetails;

export function InterviewsDataTable({
  data,
  isLoading = false,
  showAssessmentColumn = false,
  showProgramColumn = false,
  defaultTab = "all",
  onTabChange,
  onCreateInterview,
}: InterviewsDataTableProps) {
  const userCanAdmin = useCanAdmin();
  const navigate = useCompanyAwareNavigate();
  const { updateInterview, deleteInterview } = useInterviewActions();
  const [togglingInterviewId, setTogglingInterviewId] = React.useState<
    number | null
  >(null);
  const [sendingEmailId, setSendingEmailId] = React.useState<{
    id: number;
    type: "summary" | "reminder";
  } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deletingInterviewId, setDeletingInterviewId] = React.useState<
    number | null
  >(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [editingInterview, setEditingInterview] =
    React.useState<InterviewData | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const routes = useCompanyRoutes();

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
      case "cancelled":
        return <IconCancel className="mr-1 h-3 w-3 text-gray-500" />;
      default:
        return <IconClock className="mr-1 h-3 w-3 text-gray-500" />;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  const handleCopyIndividualLink = (interview: InterviewData) => {
    if (!interview.enabled || !interview.is_individual) {
      toast.error("Interview must be enabled to copy individual link");
      return;
    }

    const publicUrl = `${window.location.origin}/external/interview/${interview.id}?code=${interview.access_code}&email=${interview.interviewee?.email}`;
    navigator.clipboard
      .writeText(publicUrl)
      .then(() => {
        toast.success("Individual interview link copied to clipboard");
      })
      .catch(() => {
        toast.error("Failed to copy link to clipboard");
      });
  };

  const handleSendReminderEmail = async (interview: InterviewData) => {
    if (!interview.enabled || !interview.is_individual) {
      toast.error("Interview must be enabled to send reminder");
      return;
    }

    setSendingEmailId({ id: interview.id, type: "reminder" });
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

  const handleSendSummaryEmail = async (interviewId: number) => {
    setSendingEmailId({ id: interviewId, type: "summary" });
    try {
      const result = await sendInterviewSummary(interviewId);

      if (result.success) {
        toast.success("Interview summary sent successfully!");
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

  const handleDeleteClick = (interviewId: number) => {
    setDeletingInterviewId(interviewId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingInterviewId) return;

    setIsDeleting(true);
    try {
      await deleteInterview(deletingInterviewId);
      toast.success("Interview deleted successfully");
      setDeleteDialogOpen(false);
      setDeletingInterviewId(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete interview";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeletingInterviewId(null);
  };

  const handleEditClick = (interview: InterviewData) => {
    setEditingInterview(interview);
    setEditDialogOpen(true);
  };

  const handleEditSave = async (updates: {
    name?: string;
    status?: string;
    notes?: string;
    due_at?: string | null;
  }) => {
    if (!editingInterview) return;

    setIsSaving(true);
    try {
      await updateInterview({
        id: editingInterview.id,
        updates,
      });
      toast.success("Interview updated successfully");
      setEditDialogOpen(false);
      setEditingInterview(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update interview";
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // Column definitions
  const columns: ColumnDef<InterviewData>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex-1">
          <Link
            to={
              row.original.is_individual &&
              row.original.access_code &&
              row.original.interviewee?.email
                ? routes.externalInterviewDetail(
                    row.original.id,
                    row.original.access_code,
                    row.original.interviewee.email
                  )
                : routes.interviewDetail(row.original.id)
            }
            className="text-xs text-primary hover:text-primary/80 underline inline-flex items-center gap-1"
            target="_blank"
            rel="noopener noreferrer"
          >
            {row.original.name || `Interview #${row.original.id}`}
            <IconExternalLink className="h-3 w-3" />
          </Link>
        </div>
      ),
    },
    // Conditionally include assessment column
    ...(showAssessmentColumn
      ? [
          {
            accessorKey: "assessment" as const,
            header: "Assessment",
            cell: ({ row }: { row: { original: InterviewData } }) => {
              const interview = row.original as InterviewWithResponses;
              return (
                <div className="flex-1">
                  <Link
                    to={routes.assessmentDetails(
                      interview.assessment.type || "onsite",
                      interview.assessment.id
                    )}
                    className="text-xs text-primary hover:text-primary/80 underline inline-flex items-center gap-1"
                  >
                    {interview.assessment.name}
                  </Link>
                </div>
              );
            },
          } as ColumnDef<InterviewData>,
        ]
      : []),
    // Conditionally include program column
    ...(showProgramColumn
      ? [
          {
            accessorKey: "program" as const,
            header: "Program",
            cell: ({ row }: { row: { original: InterviewData } }) => {
              const interview = row.original as InterviewWithResponses;
              console.log("interview: ", interview);
              if (!interview.program?.name) {
                return (
                  <div className="text-xs text-muted-foreground truncate">
                    N/A
                  </div>
                );
              }
              return (
                <div className="flex-1">
                  <Link
                    to={routes.assessmentDetails(
                      interview.assessment.type || "onsite",
                      interview.assessment.id
                    )}
                    className="text-xs text-primary hover:text-primary/80 underline inline-flex items-center gap-1"
                  >
                    {interview?.program?.name || "N/A"}{" "}
                    {interview?.program?.program_phase_name
                      ? `- ${interview?.program?.program_phase_name}`
                      : ""}
                  </Link>
                </div>
              );
            },
          } as ColumnDef<InterviewData>,
        ]
      : []),
    {
      accessorKey: "is_individual",
      header: "Type",
      cell: ({ row }) => {
        const interview = row.original;
        return interview.is_individual ? (
          <Badge
            variant={interview.enabled ? "secondary" : "outline"}
            className={`${
              !interview.enabled && "border-orange-300 text-orange-800"
            }`}
          >
            <IconUser className="h-3 w-3 mr-1" />
            Individual
            {!interview.enabled && <IconLock className="h-3 w-3 ml-1" />}
          </Badge>
        ) : (
          <Badge variant="secondary">
            <IconUsers className="h-3 w-3 mr-1" />
            Group
          </Badge>
        );
      },
    },
    {
      accessorKey: "interviewee",
      header: "Interviewee",
      cell: ({ row }) => (
        <div className="max-w-32 text-xs">
          <div className="flex flex-col space-y-1">
            {row.original.interviewee?.full_name && (
              <div
                className="font-medium truncate"
                title={row.original.interviewee.full_name}
              >
                {row.original.interviewee.full_name}
              </div>
            )}
            <div
              className="text-muted-foreground truncate"
              title={row.original.interviewee?.email || undefined}
            >
              {row.original.interviewee?.email || "N/A"}
            </div>
            {row.original.interviewee?.title && (
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
          className="truncate text-xs"
          title={row.original.interviewee?.role || undefined}
        >
          {row.original.interviewee?.role || "All"}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className={cn("capitalize", getStatusStyle(row.original.status))}
          >
            {getStatusIcon(row.original.status)}
            {row.original.status.replace("_", " ")}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "completion_rate",
      header: "Progress",
      cell: ({ row }) => (
        <div className="relative w-full">
          <Progress
            value={Math.round(row.original.completion_rate * 100)}
            className="h-4"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium mix-blend-difference text-white">
              {Math.round(row.original.completion_rate * 100)}%
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "average_score",
      header: () => <div className="text-center">Ave. Score</div>,
      cell: ({ row }) => (
        <div className="w-full text-center">
          <Badge variant="secondary">
            {Math.round(row.original.average_score * 10) / 10}/
            {row.original.max_rating_value}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "created_at",
      header: () => <div className="text-center">Created</div>,
      cell: ({ row }) => (
        <div className="text-xs text-center">
          {formatDistanceToNow(new Date(row.original.created_at), {
            addSuffix: true,
          })}
        </div>
      ),
    },
    {
      accessorKey: "due_at",
      header: () => <div className="text-center">Due In</div>,
      cell: ({ row }) => (
        <div className="text-xs text-center">
          {row.original.due_at
            ? formatDistanceToNow(new Date(row.original.due_at), {
                addSuffix: false,
              })
            : "N/A"}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => {
        const interview = row.original;
        return (
          <div className="flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  {togglingInterviewId === interview.id ||
                  sendingEmailId?.id === interview.id ? (
                    <IconLoader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <IconDots className="h-4 w-4" />
                  )}
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => navigate(routes.interviewDetail(interview.id))}
                >
                  <IconEye className="mr-2 h-4 w-4" />
                  View Interview
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEditClick(interview)}>
                  <IconEdit className="mr-2 h-4 w-4" />
                  Edit Interview
                </DropdownMenuItem>

                {interview.is_individual && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() =>
                        handleToggleEnabled(interview.id, !interview.enabled)
                      }
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
                      onClick={() => handleCopyIndividualLink(interview)}
                      disabled={
                        !interview.enabled ||
                        !interview.access_code ||
                        !interview.interviewee?.email
                      }
                    >
                      <IconCopy className="mr-2 h-4 w-4" />
                      Copy Link
                    </DropdownMenuItem>
                  </>
                )}

                {interview.is_individual && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleSendSummaryEmail(interview.id)}
                      disabled={
                        sendingEmailId?.id === interview.id &&
                        sendingEmailId.type === "summary"
                      }
                    >
                      {sendingEmailId?.id === interview.id &&
                      sendingEmailId.type === "summary" ? (
                        <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <IconMail className="mr-2 h-4 w-4" />
                      )}
                      {sendingEmailId?.id === interview.id &&
                      sendingEmailId.type === "summary"
                        ? "Sending..."
                        : "Send Summary Email"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleSendReminderEmail(interview)}
                      disabled={
                        !interview.enabled ||
                        !interview.access_code ||
                        !interview.interviewee?.email ||
                        (sendingEmailId?.id === interview.id &&
                          sendingEmailId.type === "reminder")
                      }
                    >
                      {sendingEmailId?.id === interview.id &&
                      sendingEmailId.type === "reminder" ? (
                        <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <IconMail className="mr-2 h-4 w-4" />
                      )}
                      {sendingEmailId?.id === interview.id &&
                      sendingEmailId.type === "reminder"
                        ? "Sending..."
                        : "Send Reminder Email"}
                    </DropdownMenuItem>
                  </>
                )}

                {userCanAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDeleteClick(interview.id)}
                      disabled={
                        isDeleting && deletingInterviewId === interview.id
                      }
                      className="text-destructive focus:text-destructive"
                    >
                      {isDeleting && deletingInterviewId === interview.id ? (
                        <>
                          <IconLoader2 className="mr-2 h-4 w-4 animate-spin text-destructive" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <IconTrash className="mr-2 h-4 w-4 text-destructive" />
                          Delete Interview
                        </>
                      )}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  // Filter data by status for tabs
  const allInterviews = data;
  const inProgressInterviews = data.filter(
    (i) => i.status.toLowerCase() === "in_progress"
  );
  const pendingInterviews = data.filter(
    (i) => i.status.toLowerCase() === "pending"
  );
  const completedInterviews = data.filter(
    (i) => i.status.toLowerCase() === "completed"
  );
  const cancelledInterviews = data.filter(
    (i) => i.status.toLowerCase() === "cancelled"
  );

  // Define tabs
  const tabs: SimpleDataTableTab[] = [
    {
      value: "all",
      label: "All",
      data: allInterviews,
      emptyStateTitle: "No interviews",
      emptyStateDescription: "Create your first interview to get started.",
    },
    {
      value: "in_progress",
      label: "In Progress",
      data: inProgressInterviews,
      emptyStateTitle: "No in progress interviews",
      emptyStateDescription: "No interviews are currently in progress.",
    },
    {
      value: "pending",
      label: "Pending",
      data: pendingInterviews,
      emptyStateTitle: "No pending interviews",
      emptyStateDescription: "No interviews are pending.",
    },
    {
      value: "completed",
      label: "Completed",
      data: completedInterviews,
      emptyStateTitle: "No completed interviews",
      emptyStateDescription: "No interviews have been completed yet.",
    },
    {
      value: "cancelled",
      label: "Cancelled",
      data: cancelledInterviews,
      emptyStateTitle: "No cancelled interviews",
      emptyStateDescription: "No interviews have been cancelled.",
    },
  ];

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

  const deletingInterview = deletingInterviewId
    ? data.find((i) => i.id === deletingInterviewId)
    : null;

  return (
    <>
      <SimpleDataTable
        data={allInterviews}
        columns={columns}
        getRowId={(row) => row.id.toString()}
        tabs={tabs}
        defaultTab={defaultTab}
        onTabChange={onTabChange}
        enableSorting={true}
        enableFilters={true}
        enableColumnVisibility={true}
        filterPlaceholder="Search interviews..."
        primaryAction={
          userCanAdmin && onCreateInterview
            ? {
                label: "New Interview",
                icon: IconPlus,
                onClick: onCreateInterview,
              }
            : undefined
        }
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Interview</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this interview?
              <br />
              <br />
              <strong>This action is permanent and cannot be undone</strong>. It
              will remove all associated data, including responses and actions.
              {deletingInterview && (
                <>
                  <br />
                  <br />
                  Interview:{" "}
                  <strong>
                    {deletingInterview.name ||
                      `Interview #${deletingInterview.id}`}
                  </strong>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleDeleteCancel}
              disabled={isDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Interview Dialog */}
      <InterviewSettingsDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        interviewData={editingInterview}
        onSave={handleEditSave}
        isSaving={isSaving}
        showDelete={false}
      />
    </>
  );
}
