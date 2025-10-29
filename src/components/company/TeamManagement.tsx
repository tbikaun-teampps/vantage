import { useState } from "react";
import {
  useTeamMembers,
  useTeamActions,
  type TeamMember,
  type CompanyRole,
} from "@/hooks/useCompany";
import { useUserCompanyRole } from "@/hooks/useUserCompanyRole";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UserPlus, Trash2, Edit } from "lucide-react";
import { Loader } from "../loader";
import { DashboardPage } from "../dashboard";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";
import { useProfile } from "@/hooks/useProfile";

const roleLabels: Record<CompanyRole, string> = {
  owner: "Owner",
  admin: "Admin",
  viewer: "Viewer",
  interviewee: "Interviewee",
};

const roleBadgeVariants: Record<
  CompanyRole,
  "default" | "secondary" | "outline" | "destructive"
> = {
  owner: "default",
  admin: "secondary",
  viewer: "outline",
  interviewee: "outline",
};

export function TeamManagement() {
  const companyId = useCompanyFromUrl();
  const { data: teamMembers, isLoading } = useTeamMembers(companyId);
  const { data: currentUserRole } = useUserCompanyRole();
  const {
    addTeamMember,
    isAddingMember,
    updateTeamMember,
    isUpdatingMember,
    removeTeamMember,
    isRemovingMember,
  } = useTeamActions();
  const { data: profile } = useProfile();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<CompanyRole>("viewer");

  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [editRole, setEditRole] = useState<CompanyRole>("viewer");

  // Only owners and admins can manage team
  const canManageTeam =
    currentUserRole === "owner" || currentUserRole === "admin";

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    try {
      await addTeamMember({
        companyId,
        email: newMemberEmail.trim(),
        role: newMemberRole,
      });
      toast.success("Team member added successfully");
      setIsAddDialogOpen(false);
      setNewMemberEmail("");
      setNewMemberRole("viewer");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add team member"
      );
    }
  };

  const handleUpdateRole = async () => {
    if (!editingMember) return;

    try {
      await updateTeamMember({
        companyId,
        userId: editingMember.user_id,
        role: editRole,
      });
      toast.success("Team member role updated successfully");
      setEditingMember(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update team member"
      );
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await removeTeamMember({ companyId, userId });
      toast.success("Team member removed successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to remove team member"
      );
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  const headerAction = (
    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>
            Enter the email address of the person you want to add to this
            company.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="member@example.com"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={newMemberRole}
              onValueChange={(value) => setNewMemberRole(value as CompanyRole)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
                {/* <SelectItem value="interviewee">Interviewee</SelectItem> */}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddMember} disabled={isAddingMember}>
            {isAddingMember ? "Adding..." : "Add Member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <DashboardPage
      title="Team Members"
      description="Manage team members and their roles within the company."
      headerActions={canManageTeam ? headerAction : undefined}
      showBack
    >
      <div className="p-6">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                {canManageTeam && (
                  <TableHead className="text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {!teamMembers || teamMembers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={canManageTeam ? 4 : 3}
                    className="text-center text-muted-foreground"
                  >
                    No team members found
                  </TableCell>
                </TableRow>
              ) : (
                teamMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>{member.user.full_name || "—"}</TableCell>
                    <TableCell>{member.user.email}</TableCell>
                    <TableCell>
                      <Badge variant={roleBadgeVariants[member.role]}>
                        {roleLabels[member.role]}
                      </Badge>
                    </TableCell>
                    {/* Only show actions for other members when the user can manage the team (admin/owner).
                        Owners cannot be removed or have their role changed. Interviewees are not manageable here.
                    */}
                    {canManageTeam &&
                      profile?.id !== member.user.id &&
                      member.role !== "interviewee" && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Dialog
                              open={editingMember?.id === member.id}
                              onOpenChange={(open) => {
                                if (open) {
                                  setEditingMember(member);
                                  setEditRole(member.role);
                                } else {
                                  setEditingMember(null);
                                }
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Update Role</DialogTitle>
                                  <DialogDescription>
                                    Change the role for {member.user.email}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-role">Role</Label>
                                    <Select
                                      value={editRole}
                                      onValueChange={(value) =>
                                        setEditRole(value as CompanyRole)
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="owner">
                                          Owner
                                        </SelectItem>
                                        <SelectItem value="admin">
                                          Admin
                                        </SelectItem>
                                        <SelectItem value="viewer">
                                          Viewer
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button
                                    variant="outline"
                                    onClick={() => setEditingMember(null)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={handleUpdateRole}
                                    disabled={isUpdatingMember}
                                  >
                                    {isUpdatingMember
                                      ? "Updating..."
                                      : "Update Role"}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            {member.role !== "owner" && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Remove Team Member
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to remove{" "}
                                      {member.user.email} from this company?
                                      This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleRemoveMember(member.user_id)
                                      }
                                      disabled={isRemovingMember}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      {isRemovingMember
                                        ? "Removing..."
                                        : "Remove"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </TableCell>
                      )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardPage>
  );
}
