import { z } from "zod";

const programUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name too long"),
  description: z.string().optional(),
  status: z.enum(["draft", "active", "under_review", "completed", "archived"], {
    required_error: "Status is required",
  }),
});

export type ProgramUpdateFormData = z.infer<typeof programUpdateSchema>;
