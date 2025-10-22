import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  IconBuilding,
  IconCalendar,
  IconTarget,
  IconClipboardList,
  IconEdit,
  IconX,
  IconCheck,
  IconLoader2,
} from "@tabler/icons-react";
import type { ProgramWithRelations } from "@/types/program";
import { formatDistanceToNow } from "date-fns";
import {
  programUpdateSchema,
  programStatusOptions,
  type ProgramUpdateFormData,
} from "@/components/programs/detail/overview-tab/program-update-schema";

interface EditableProgramDetailsProps {
  program: ProgramWithRelations;
  onUpdate: (data: ProgramUpdateFormData) => Promise<void>;
  isUpdating: boolean;
}

export function EditableProgramDetails({
  program,
  onUpdate,
  isUpdating,
}: EditableProgramDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<ProgramUpdateFormData>({
    resolver: zodResolver(programUpdateSchema),
    defaultValues: {
      name: program.name,
      description: program.description || "",
      status: program.status,
    },
  });

  const {
    formState: { isDirty },
  } = form;

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    form.reset();
    setIsEditing(false);
  };

  const handleSave = async (data: ProgramUpdateFormData) => {
    try {
      await onUpdate(data);
      setIsEditing(false);
      form.reset(data); // Reset with new values to clear dirty state
    } catch (error) {
      // Error handling is done in the mutation
      console.error("Update failed:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "under_review":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "archived":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatStatus = (status: string) => {
    return status.replace("_", " ");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <IconTarget className="h-5 w-5" />
              Program Details
            </CardTitle>
            <CardDescription>
              Basic information about this program
            </CardDescription>
          </div>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <IconEdit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSave)}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {programStatusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Created
                  </label>
                  <div className="flex items-center gap-2">
                    <IconCalendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">
                      {formatDistanceToNow(new Date(program.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Current Sequence Number
                  </label>
                  <p className="text-sm">{program.current_sequence_number}</p>
                  <p className="text-xs text-muted-foreground">
                    Cannot be changed
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Linked Questionnaire
                  </label>
                  <div className="flex items-center gap-2">
                    <IconClipboardList className="h-4 w-4 text-muted-foreground" />
                    {program.onsite_questionnaire ? (
                      <p className="text-sm">
                        {program.onsite_questionnaire.name}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No questionnaire linked
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Change in questionnaire section
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={!isDirty || isUpdating}
                  className="flex items-center gap-2"
                >
                  {isUpdating ? (
                    <IconLoader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <IconCheck className="h-4 w-4" />
                  )}
                  {isUpdating ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isUpdating}
                >
                  <IconX className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Name
                </label>
                <p className="text-sm">{program.name}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Status
                </label>
                <div className="flex items-center gap-2">
                  <Badge
                    className={`${getStatusColor(program.status)} capitalize`}
                  >
                    {formatStatus(program.status)}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Created
                </label>
                <div className="flex items-center gap-2">
                  <IconCalendar className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">
                    {formatDistanceToNow(new Date(program.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Current Sequence Number
                </label>
                <p className="text-sm">{program.current_sequence_number}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Linked Self-Audit Questionnaire
                </label>
                <div className="flex items-center gap-2">
                  <IconClipboardList className="h-4 w-4 text-muted-foreground" />
                  {program.presite_questionnaire ? (
                    <p className="text-sm">
                      {program.presite_questionnaire.name}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No self-audit questionnaire linked
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Linked Onsite-Audit Questionnaire
                </label>
                <div className="flex items-center gap-2">
                  <IconClipboardList className="h-4 w-4 text-muted-foreground" />
                  {program.onsite_questionnaire ? (
                    <p className="text-sm">
                      {program.onsite_questionnaire.name}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No onsite questionnaire linked
                    </p>
                  )}
                </div>
              </div>
            </div>

            {program.description && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Description
                </label>
                <p className="text-sm text-muted-foreground">
                  {program.description}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
