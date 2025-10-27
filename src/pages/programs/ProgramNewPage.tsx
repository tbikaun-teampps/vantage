import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IconLoader } from "@tabler/icons-react";
import { useCreateProgram } from "@/hooks/useProgram";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";
import { useCompanyAwareNavigate } from "@/hooks/useCompanyAwareNavigate";
import {
  programFormSchema,
  type ProgramFormData,
} from "@/components/programs/new/schema";
import { DashboardPage } from "@/components/dashboard";

export function ProgramNewPage() {
  const companyId = useCompanyFromUrl();
  const navigate = useCompanyAwareNavigate();
  const createProgramMutation = useCreateProgram();

  const form = useForm<ProgramFormData>({
    resolver: zodResolver(programFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (data: ProgramFormData) => {
    try {
      await createProgramMutation.mutateAsync({
        name: data.name,
        description: data.description,
        company_id: companyId,
      });
      navigate("/programs");
    } catch (error) {
      console.error("Failed to create program:", error);
    }
  };

  return (
    <DashboardPage
      title="Create New Program"
      description="
      Create a new program to manage assessments and related activities"
    >
      <Card className="max-w-[1600px] mx-auto shadow-none border-none">
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Program Name*</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Enter program name"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                placeholder="Enter program description (optional)"
                rows={3}
              />
            </div>

            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/programs")}
                disabled={createProgramMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createProgramMutation.isPending}>
                {createProgramMutation.isPending && (
                  <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Program
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </DashboardPage>
  );
}
