import { z } from "zod";

export const programUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name too long"),
  description: z.string().optional(),
  status: z.enum(["draft", "active", "under_review", "completed", "archived"], {
    required_error: "Status is required",
  }),
});

export type ProgramUpdateFormData = z.infer<typeof programUpdateSchema>;

export const programStatusOptions = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "under_review", label: "Under Review" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
] as const;