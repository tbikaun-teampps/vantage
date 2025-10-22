import { z } from "zod";

// Base schema with all fields optional except name
const baseSchema = z.object({
  name: z.string().min(1, "Assessment name is required"),
  description: z.string().optional(),
  questionnaire_id: z.string().optional(),
  business_unit_id: z.string().optional(),
  region_id: z.string().optional(),
  site_id: z.string().optional(),
  asset_group_id: z.string().optional(),
  type: z.enum(["onsite", "desktop"]).optional(),
  objectives: z
    .array(
      z.object({
        title: z.string().min(1, "Objective title is required"),
        description: z.string().optional(),
      })
    )
    .optional(),
});

// Conditional validation based on assessment type
export const createAssessmentSchema = baseSchema.refine(
  (data) => {
    // For onsite assessments, questionnaire_id is required
    if (data.type === "onsite" && !data.questionnaire_id) {
      return false;
    }
    return true;
  },
  {
    message: "Please select a questionnaire template",
    path: ["questionnaire_id"],
  }
);

export type CreateAssessmentFormData = z.infer<typeof createAssessmentSchema>;