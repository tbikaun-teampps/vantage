import { z } from "zod";

export const programFormSchema = z.object({
  name: z.string().min(1, "Program name is required"),
  description: z.string().optional(),
});

export type ProgramFormData = z.infer<typeof programFormSchema>;