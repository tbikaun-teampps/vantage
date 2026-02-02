import { useState } from "react";
import { Button } from "@/components/ui/button";
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { IconPlus } from "@tabler/icons-react";
import { useCompanyActions } from "@/hooks/useCompany";
import { useProfileActions } from "@/hooks/useProfile";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  code: z.string().optional(),
  description: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AddCompanyFormProps {
  children?: React.ReactNode;
}

export function AddCompanyForm({ children }: AddCompanyFormProps) {
  const [open, setOpen] = useState(false);
  const { createCompany, isCreating } = useCompanyActions();
  const { refreshSession } = useProfileActions();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      if (data.code) formData.append("code", data.code);
      if (data.description) formData.append("description", data.description);

      await createCompany(formData);

      // Refresh session to update user role to 'owner' and refresh permissions/companies
      await refreshSession();

      toast.success("Company created successfully!");
      form.reset();
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create company"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={false}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <IconPlus className="w-4 h-4 mr-2" />
            Add Company
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[425px]"
        data-tour="company-modal"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle data-tour="company-modal-title">
            Add New Company
          </DialogTitle>
          <DialogDescription>Create a new company profile.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter company name"
                      {...field}
                      data-tour="company-name-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Code</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., NEM, RHI" {...field} />
                  </FormControl>
                  <FormDescription>
                    Stock ticker or internal code (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of the company"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
                data-tour="create-company-button"
              >
                {isCreating ? "Creating..." : "Create Company"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
