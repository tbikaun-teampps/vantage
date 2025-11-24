import { useEffect, useState } from "react";
import { useInterviewActions } from "@/hooks/interview/useInterviewActions";
import { useAssessments } from "@/hooks/useAssessments";
import { useAuthStore } from "@/stores/auth-store";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { IconLoader } from "@tabler/icons-react";
import { toast } from "sonner";
import {
  getRolesAssociatedWithAssessment,
  validateAssessmentRolesForQuestionnaire,
} from "@/lib/api/interviews";
import { getContactsByRole } from "@/lib/api/contacts";
import type {
  CreateInterviewBodyData,
  GetInterviewAssessmentRolesResponseData,
} from "@/types/api/interviews";
import type { GetContactsByRoleResponseData } from "@/types/api/companies";

interface CreateInterviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (interviewId: string) => void;
  mode: "standalone" | "contextual";
  assessmentId?: number;
  showIndividualOptions?: boolean;
}

export function CreateInterviewDialog({
  open,
  onOpenChange,
  onSuccess,
  mode,
  assessmentId,
  showIndividualOptions = false,
}: CreateInterviewDialogProps) {
  const {
    createInterview,
    isCreating,
    createIndividualInterviews,
    isCreatingIndividual,
  } = useInterviewActions();
  const { user } = useAuthStore();
  const companyId = useCompanyFromUrl();
  const { data: assessments = [], isLoading: assessmentsLoading } =
    useAssessments(companyId);

  const [selectedAssessmentId, setSelectedAssessmentId] = useState<
    number | undefined
  >(assessmentId || undefined);
  const [interviewName, setInterviewName] = useState<string>("");
  const [interviewNotes, setInterviewNotes] = useState<string>("");
  const [isIndividualInterview, setIsIndividualInterview] =
    useState<boolean>(false);
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
  const [availableRoles, setAvailableRoles] =
    useState<GetInterviewAssessmentRolesResponseData>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState<boolean>(false);
  const [availableContacts, setAvailableContacts] =
    useState<GetContactsByRoleResponseData>([]);
  const [selectedContactIds, setSelectedContactIds] = useState<number[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState<boolean>(false);
  const [isValidatingRoles, setIsValidatingRoles] = useState<boolean>(false);
  const [hasApplicableQuestions, setHasApplicableQuestions] =
    useState<boolean>(true);

  // Load roles when assessment is selected
  useEffect(() => {
    async function loadRoles() {
      if (selectedAssessmentId) {
        setIsLoadingRoles(true);
        try {
          const data =
            await getRolesAssociatedWithAssessment(selectedAssessmentId);
          setAvailableRoles(data);
        } catch (error) {
          console.error("Failed to load roles:", error);
          toast.error("Failed to load available roles");
          setAvailableRoles([]);
        } finally {
          setIsLoadingRoles(false);
        }
      } else {
        setAvailableRoles([]);
        setSelectedRoleIds([]);
      }
    }
    loadRoles();
  }, [selectedAssessmentId, open]);

  // Generate default name when assessment is selected
  useEffect(() => {
    if (selectedAssessmentId) {
      const selectedAssessment = assessments.find(
        (a) => a.id === selectedAssessmentId
      );
      if (selectedAssessment) {
        const timestamp = new Date().toLocaleDateString();
        const prefix = isIndividualInterview
          ? "Individual Interview"
          : "Interview";
        setInterviewName(`${prefix} - ${timestamp}`);
      }
    }
  }, [selectedAssessmentId, assessments, isIndividualInterview, open]);

  // Validate that selected roles have applicable questions
  useEffect(() => {
    async function validateRoleApplicability() {
      if (!selectedAssessmentId || selectedRoleIds.length === 0) {
        setHasApplicableQuestions(true);
        return;
      }

      setIsValidatingRoles(true);
      try {
        const validation = await validateAssessmentRolesForQuestionnaire({
          assessmentId: selectedAssessmentId,
          roleIds: selectedRoleIds,
        });

        setHasApplicableQuestions(validation.isValid);
      } catch (error) {
        console.error("Failed to validate role applicability:", error);
        setHasApplicableQuestions(false);
      } finally {
        setIsValidatingRoles(false);
      }
    }

    validateRoleApplicability();
  }, [selectedAssessmentId, selectedRoleIds, open]);

  // Load contacts when role is selected for individual interviews
  useEffect(() => {
    async function loadContacts() {
      if (
        isIndividualInterview &&
        showIndividualOptions &&
        selectedRoleIds.length > 0
      ) {
        const roleId = selectedRoleIds[0]; // For individual interviews, only one role is selected
        setIsLoadingContacts(true);
        try {
          const contacts = await getContactsByRole(companyId, roleId);
          setAvailableContacts(contacts);
          // Reset selected contacts when role changes
          setSelectedContactIds([]);
        } catch (error) {
          console.error("Failed to load contacts:", error);
          toast.error("Failed to load contacts for this role");
          setAvailableContacts([]);
        } finally {
          setIsLoadingContacts(false);
        }
      } else {
        setAvailableContacts([]);
        setSelectedContactIds([]);
      }
    }
    loadContacts();
  }, [
    isIndividualInterview,
    showIndividualOptions,
    selectedRoleIds,
    companyId,
    open,
  ]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      if (mode === "standalone") {
        setSelectedAssessmentId(undefined);
      }
      setInterviewName("");
      setInterviewNotes("");
      setIsIndividualInterview(false);
      setSelectedRoleIds([]);
      setAvailableRoles([]);
      setAvailableContacts([]);
      setSelectedContactIds([]);
      setIsValidatingRoles(false);
      setHasApplicableQuestions(true);
    }
  }, [open, mode]);

  // Handle create interview
  const handleCreateInterview = async () => {
    if (!selectedAssessmentId || !user || !companyId) {
      toast.error("Please select an assessment");
      return;
    }

    if (!interviewName.trim()) {
      toast.error("Please enter an interview name");
      return;
    }

    if (isIndividualInterview && showIndividualOptions) {
      if (selectedRoleIds.length === 0) {
        toast.error("Please select a role for individual interviews");
        return;
      }
      if (selectedContactIds.length === 0) {
        toast.error(
          "Please select at least one contact for individual interviews"
        );
        return;
      }
    }

    try {
      if (
        isIndividualInterview &&
        showIndividualOptions &&
        selectedContactIds.length > 0
      ) {
        const newInterviews = await createIndividualInterviews({
          assessment_id: selectedAssessmentId,
          name: interviewName,
          interview_contact_ids: selectedContactIds,
        });
        console.log("newInterviews: ", newInterviews);

        if (newInterviews.length > 0) {
          toast.success(
            `${newInterviews.length} interview${newInterviews.length > 1 ? "s" : ""} created successfully`
          );
          handleClose();
          // onSuccess?.(newInterview?.id?.toString() || "");
        } else {
          toast.error("Failed to create any interviews");
        }
      } else {
        // Original single interview creation logic for group or non-contact scenarios
        const interviewData: CreateInterviewBodyData = {
          assessment_id: selectedAssessmentId,
          interviewer_id: isIndividualInterview ? null : user.id,
          name: interviewName,
          notes: interviewNotes,
          is_individual: isIndividualInterview && showIndividualOptions,
          enabled: true,
        };

        // Add selected roles for both public and private interviews
        if (selectedRoleIds.length > 0) {
          interviewData.role_ids = selectedRoleIds;
        }

        const newInterview = await createInterview(interviewData);

        toast.success(
          isIndividualInterview && showIndividualOptions
            ? "Individual interview created successfully"
            : "Interview created successfully"
        );
        handleClose();
        onSuccess?.(newInterview?.id?.toString() || "");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create interview"
      );
    }
  };

  // Handle dialog close
  const handleClose = () => {
    onOpenChange(false);
  };

  // Filter active assessments for standalone mode
  const activeAssessments =
    mode === "standalone"
      ? assessments.filter(
          (assessment) =>
            assessment.status === "active" || assessment.status === "draft"
        )
      : [];

  const handleSelectAssessment = (assessmentId: string) => {
    setSelectedAssessmentId(parseInt(assessmentId));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Interview</DialogTitle>
          <DialogDescription>
            {mode === "standalone"
              ? "Select an assessment and add any notes for the interview"
              : "Add a new interview to this assessment"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Assessment Selection - Only show in standalone mode */}
          {mode === "standalone" && (
            <div className="space-y-2">
              <Label htmlFor="assessment">Assessment *</Label>
              <Select
                value={selectedAssessmentId?.toString() || ""}
                onValueChange={handleSelectAssessment}
                disabled={assessmentsLoading}
              >
                <SelectTrigger id="assessment">
                  <SelectValue
                    placeholder={
                      assessmentsLoading
                        ? "Loading assessments..."
                        : "Select an assessment"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {activeAssessments.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No active assessments available
                    </div>
                  ) : (
                    activeAssessments.map((assessment) => (
                      <SelectItem
                        key={assessment.id}
                        value={assessment.id.toString()}
                      >
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="truncate font-medium">
                            {assessment.name}
                          </span>
                          {assessment.questionnaire_name && (
                            <span className="text-muted-foreground text-sm truncate">
                              {assessment.questionnaire_name}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Interview Name *</Label>
            <Input
              id="name"
              type="text"
              value={interviewName}
              onChange={(e) => setInterviewName(e.target.value)}
              placeholder="Enter interview name..."
              disabled={isCreating || isCreatingIndividual}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes or instructions for this interview..."
              value={interviewNotes}
              onChange={(e) => setInterviewNotes(e.target.value)}
              disabled={isCreating || isCreatingIndividual}
            />
          </div>

          {/* Warning when no roles are available */}
          {selectedAssessmentId &&
            !isLoadingRoles &&
            availableRoles.length === 0 && (
              <div className="rounded-md border border-destructive bg-destructive/10 p-4">
                <p className="text-sm font-medium text-destructive">
                  No roles available
                </p>
                <p className="text-sm text-destructive/90 mt-1">
                  The location of this assessment has no roles configured.
                  Please add roles to your company structure before creating
                  interviews, as roles are required to identify who will provide
                  answers.
                </p>
              </div>
            )}

          {/* Group Interview Role Selection - Optional */}
          {!isIndividualInterview && availableRoles.length > 0 && (
            <div className="space-y-3">
              <div>
                <Label>Roles (optional)</Label>
                <p className="text-sm text-muted-foreground">
                  Select roles that apply to this interview for better context
                </p>
                {selectedRoleIds.length > 0 &&
                  !hasApplicableQuestions &&
                  !isValidatingRoles && (
                    <p className="text-sm text-destructive">
                      The selected roles have no applicable questions in this
                      assessment's questionnaire. Please select different roles
                      or contact an administrator.
                    </p>
                  )}
              </div>
              <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-3">
                {isLoadingRoles ? (
                  <div className="text-sm text-muted-foreground text-center py-2">
                    Loading roles...
                  </div>
                ) : (
                  availableRoles.map((role) => (
                    <div key={role.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`role-${role.id}`}
                        checked={selectedRoleIds.includes(role.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedRoleIds([...selectedRoleIds, role.id]);
                          } else {
                            setSelectedRoleIds(
                              selectedRoleIds.filter((id) => id !== role.id)
                            );
                          }
                        }}
                        disabled={isCreating || isCreatingIndividual}
                      />
                      <Label
                        htmlFor={`role-${role.id}`}
                        className="text-sm cursor-pointer"
                      >
                        {role.name || "Unknown Role"}
                        {role.work_group_name && (
                          <span className="text-muted-foreground ml-2">
                            ({role.work_group_name})
                          </span>
                        )}
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Individual Interview Options - Only show if enabled */}
          {showIndividualOptions && (
            <>
              <div className="flex items-center space-x-2">
                <Switch
                  id="individual-mode"
                  checked={isIndividualInterview}
                  onCheckedChange={setIsIndividualInterview}
                  disabled={isCreating || isCreatingIndividual}
                />
                <Label htmlFor="individual-mode">
                  Make this interview individual
                </Label>
              </div>

              {isIndividualInterview && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="role">Interviewee Role *</Label>
                    <Select
                      value={selectedRoleIds[0]?.toString() || ""}
                      onValueChange={(value) =>
                        setSelectedRoleIds(value ? [parseInt(value)] : [])
                      }
                      disabled={
                        isCreating || isLoadingRoles || isCreatingIndividual
                      }
                    >
                      <SelectTrigger id="role">
                        <SelectValue
                          placeholder={
                            isLoadingRoles
                              ? "Loading roles..."
                              : "Select a role for this interview"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRoles.length === 0 && !isLoadingRoles ? (
                          <div className="p-2 text-sm text-muted-foreground text-center">
                            No roles available for this assessment site
                          </div>
                        ) : (
                          availableRoles.map((role) => (
                            <SelectItem
                              key={role.id}
                              value={role.id.toString()}
                            >
                              {role.name || "Unknown Role"}
                              {role.work_group_name && (
                                <span className="text-muted-foreground ml-2">
                                  ({role.work_group_name})
                                </span>
                              )}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Role context for interview questions and responses
                    </p>
                    {selectedRoleIds.length > 0 &&
                      !hasApplicableQuestions &&
                      !isValidatingRoles && (
                        <p className="text-sm text-destructive">
                          The selected role has no applicable questions in this
                          assessment's questionnaire. Please select a different
                          role or contact an administrator.
                        </p>
                      )}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Label>Interviewee Contacts *</Label>
                          {selectedContactIds.length > 0 && (
                            <span className="text-sm text-muted-foreground">
                              ({selectedContactIds.length} selected)
                            </span>
                          )}
                        </div>
                        {availableContacts && availableContacts.length > 0 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const allContactIds = availableContacts.map(
                                (contact) => contact.id
                              );
                              const allSelected = allContactIds.every((id) =>
                                selectedContactIds.includes(id)
                              );

                              if (allSelected) {
                                // Deselect all contacts
                                setSelectedContactIds([]);
                              } else {
                                // Select all contacts
                                setSelectedContactIds(allContactIds);
                              }
                            }}
                            disabled={
                              isCreating ||
                              isLoadingContacts ||
                              selectedRoleIds.length === 0 ||
                              isCreatingIndividual
                            }
                          >
                            {(() => {
                              const allContactIds = availableContacts.map(
                                (contact) => contact.id
                              );
                              const allSelected = allContactIds.every((id) =>
                                selectedContactIds.includes(id)
                              );
                              return allSelected
                                ? "Unselect All"
                                : "Select All";
                            })()}
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Select contacts to create interviews for each
                      </p>
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2 border rounded-md p-3">
                      {isLoadingContacts ? (
                        <div className="text-sm text-muted-foreground text-center py-4">
                          Loading contacts...
                        </div>
                      ) : selectedRoleIds.length === 0 ? (
                        <div className="text-sm text-muted-foreground text-center py-4">
                          Please select a role first
                        </div>
                      ) : availableContacts &&
                        availableContacts.length === 0 ? (
                        <div className="text-sm text-muted-foreground text-center py-4">
                          No contacts available for this role. Please add
                          contacts to the role first.
                        </div>
                      ) : (
                        availableContacts &&
                        availableContacts.map((contact) => (
                          <div
                            key={contact.id}
                            className="flex items-start space-x-3 p-2 hover:bg-muted/50 rounded-md"
                          >
                            <Checkbox
                              id={`contact-${contact.id}`}
                              checked={selectedContactIds.includes(contact.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedContactIds([
                                    ...selectedContactIds,
                                    contact.id,
                                  ]);
                                } else {
                                  setSelectedContactIds(
                                    selectedContactIds.filter(
                                      (id) => id !== contact.id
                                    )
                                  );
                                }
                              }}
                              disabled={isCreating || isCreatingIndividual}
                            />
                            <Label
                              htmlFor={`contact-${contact.id}`}
                              className="cursor-pointer flex-1"
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {contact.full_name}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {contact.email}
                                </span>
                                {contact.title && (
                                  <span className="text-xs text-muted-foreground">
                                    {contact.title}
                                  </span>
                                )}
                              </div>
                            </Label>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Participants will be generated a secure access code that
                      will be required to access the interview.
                    </p>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isCreating || isCreatingIndividual}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateInterview}
            disabled={
              !selectedAssessmentId ||
              !interviewName.trim() ||
              isCreating ||
              isCreatingIndividual ||
              isValidatingRoles ||
              !hasApplicableQuestions ||
              (selectedAssessmentId &&
                !isLoadingRoles &&
                availableRoles.length === 0) ||
              (isIndividualInterview &&
                showIndividualOptions &&
                (selectedRoleIds.length === 0 ||
                  selectedContactIds.length === 0))
            }
          >
            {isCreating || isCreatingIndividual ? (
              <>
                <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : isValidatingRoles ? (
              <>
                <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                Validating...
              </>
            ) : (
              "Create Interview"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
