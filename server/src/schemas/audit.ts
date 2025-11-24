import { z } from "zod";

function validateDateTime(dateTimeString: string): boolean {
  return !isNaN(Date.parse(dateTimeString));
}

export const CompanyLogsParamsSchema = z.object({
  companyId: z.string(),
});

const CompanyLogs = z.array(
  z.object({
    id: z.number(),
    user: z.object({
      full_name: z.string(),
      email: z.string(),
    }),
    created_at: z.string().refine((date) => validateDateTime(date), {
      message: "Invalid date-time format",
    }),
    changed_fields: z.array(z.string()).nullable(),
    message: z.string(),
  })
);

export const CompanyLogsSchema = z.object({
  success: z.boolean(),
  data: CompanyLogs,
});

export const CompanyLogsDownloadParamsSchema = z.object({
  companyId: z.string(),
});

const CompanyLogsDownload = z.string(); // CSV data as a string

export const CompanyLogsDownloadSchema = z.object({
  success: z.boolean(),
  data: CompanyLogsDownload,
});

export const AuditSchemas = {
  CompanyLogsParamsSchema,
  CompanyLogsSchema,
  CompanyLogsDownloadParamsSchema,
  CompanyLogsDownloadSchema,
};