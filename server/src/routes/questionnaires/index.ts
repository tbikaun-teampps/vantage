import { FastifyInstance } from "fastify";
import { QuestionnaireService } from "../../services/QuestionnaireService.js";
import { ratingScalesRoutes } from "./rating-scales.js";
import { sectionsRoutes } from "./sections.js";
import { stepsRoutes } from "./steps.js";
import { questionsRoutes } from "./questions.js";
import { parse } from "csv-parse/sync";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../../plugins/errorHandler.js";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  CheckQuestionnaireUsageParamsSchema,
  CheckQuestionnaireUsageResponseSchema,
  CreateQuestionnaireBodySchema,
  CreateQuestionnaireResponseSchema,
  DeleteQuestionnaireParamsSchema,
  DeleteQuestionnaireResponseSchema,
  DuplicateQuestionnaireParamsSchema,
  DuplicateQuestionnaireResponseSchema,
  GetQuestionnaireByIdParamsSchema,
  GetQuestionnaireByIdResponseSchema,
  UpdateQuestionnaireBodySchema,
  UpdateQuestionnaireParamsSchema,
  UpdateQuestionnaireResponseSchema,
} from "../../schemas/questionnaires/index.js";
import {
  Error403Schema,
  Error404Schema,
  Error500Schema,
} from "../../schemas/errors.js";

export async function questionnairesRoutes(fastify: FastifyInstance) {
  fastify.addHook("onRoute", (routeOptions) => {
    if (!routeOptions.schema) routeOptions.schema = {};
    if (!routeOptions.schema.tags) {
      routeOptions.schema.tags = ["Questionnaires"];
    }
  });

  // Register sub-routers
  await fastify.register(sectionsRoutes);
  await fastify.register(stepsRoutes);
  await fastify.register(ratingScalesRoutes);
  await fastify.register(questionsRoutes);

  // Main questionnaire routes
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:questionnaireId",
    schema: {
      description: "Get a questionnaire by ID",
      params: GetQuestionnaireByIdParamsSchema,
      response: {
        200: GetQuestionnaireByIdResponseSchema,
        404: Error404Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { questionnaireId } = request.params;

      const questionnaireService = new QuestionnaireService(
        request.supabaseClient,
        request.user.id
      );
      const questionnaire =
        await questionnaireService.getQuestionnaireById(questionnaireId);

      if (!questionnaire) {
        throw new NotFoundError("Questionnaire not found");
      }
      return {
        success: true,
        data: questionnaire,
      };
    },
  });
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "",
    schema: {
      description: "Create a new questionnaire",
      body: CreateQuestionnaireBodySchema,
      response: {
        201: CreateQuestionnaireResponseSchema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const questionnaireService = new QuestionnaireService(
        request.supabaseClient,
        request.user.id
      );
      const questionnaire = await questionnaireService.createQuestionnaire(
        request.body
      );
      return {
        success: true,
        data: questionnaire,
      };
    },
  });
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "DELETE",
    url: "/:questionnaireId",
    schema: {
      description: "Soft delete a questionnaire by ID",
      params: DeleteQuestionnaireParamsSchema,
      response: {
        200: DeleteQuestionnaireResponseSchema,
        404: Error404Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { questionnaireId } = request.params;
      const questionnaireService = new QuestionnaireService(
        request.supabaseClient,
        request.user.id
      );
      const deleted =
        await questionnaireService.deleteQuestionnaire(questionnaireId);

      if (!deleted) {
        throw new NotFoundError("Questionnaire not found");
      }

      return {
        success: true,
        message: "Questionnaire deleted successfully",
      };
    },
  });
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "PUT",
    url: "/:questionnaireId",
    schema: {
      description: "Update a questionnaire by ID",
      params: UpdateQuestionnaireParamsSchema,
      body: UpdateQuestionnaireBodySchema,
      response: {
        200: UpdateQuestionnaireResponseSchema,
        403: Error403Schema,
        404: Error404Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { questionnaireId } = request.params;

      const questionnaireService = new QuestionnaireService(
        request.supabaseClient,
        request.user.id
      );

      // Check if questionnaire is in use and if status is being changed
      if (request.body.status !== undefined) {
        const usageCheck =
          await questionnaireService.checkQuestionnaireInUse(questionnaireId);
        if (usageCheck.isInUse) {
          throw new ForbiddenError(
            "Cannot change questionnaire status while in use"
          );
        }
      }

      const questionnaire = await questionnaireService.updateQuestionnaire(
        questionnaireId,
        request.body
      );

      if (!questionnaire) {
        throw new NotFoundError("Questionnaire not found");
      }

      return {
        success: true,
        data: questionnaire,
      };
    },
  });
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/:questionnaireId/duplicate",

    schema: {
      description: "Duplicate a questionnaire by ID",
      params: DuplicateQuestionnaireParamsSchema,
      response: {
        201: DuplicateQuestionnaireResponseSchema,
        404: Error404Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { questionnaireId } = request.params;

      const questionnaireService = new QuestionnaireService(
        request.supabaseClient,
        request.user.id
      );
      const questionnaire =
        await questionnaireService.duplicateQuestionnaire(questionnaireId);

      if (!questionnaire) {
        throw new NotFoundError("Questionnaire not found");
      }

      return {
        success: true,
        data: questionnaire,
      };
    },
  });
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:questionnaireId/usage",
    schema: {
      params: CheckQuestionnaireUsageParamsSchema,
      response: {
        200: CheckQuestionnaireUsageResponseSchema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const { questionnaireId } = request.params;

      const questionnaireService = new QuestionnaireService(
        request.supabaseClient,
        request.user.id
      );
      const usage =
        await questionnaireService.checkQuestionnaireUsage(questionnaireId);

      return {
        success: true,
        data: usage,
      };
    },
  });

  /**
   * Import questionnaire - to be implemented
   * This endpoint will handle importing a questionnaire from a CSV file.
   */
  fastify.post(
    "/import",
    {
      schema: {
        consumes: ["multipart/form-data"],
      },
    },
    async (request) => {
      const userId = request.user.id;

      // Parse multipart form data using parts()
      const parts = request.parts();
      let fileBuffer: Buffer | null = null;
      let fileName = "";
      let mimeType = "";
      let name = "";
      let description = "";
      let guidelines = "";
      let companyId = "";
      let questionnaire = null;

      // Iterate through all parts of the multipart form
      for await (const part of parts) {
        if (part.type === "file") {
          // It's a file - read it into a buffer
          fileName = part.filename;
          mimeType = part.mimetype;
          fileBuffer = await part.toBuffer();
        } else {
          // It's a field
          if (part.fieldname === "name") {
            name = part.value as string;
          } else if (part.fieldname === "description") {
            description = part.value as string;
          } else if (part.fieldname === "guidelines") {
            guidelines = part.value as string;
          } else if (part.fieldname === "company_id") {
            companyId = part.value as string;
          }
        }
      }

      if (!fileBuffer) {
        throw new BadRequestError("No file provided");
      }

      if (!companyId) {
        throw new BadRequestError("company_id is required");
      }

      // Only support CSV for now
      if (mimeType !== "text/csv" && !fileName.endsWith(".csv")) {
        throw new BadRequestError(
          "Only CSV file uploads are supported at this time. JSON support coming soon."
        );
      }

      // Use filename as fallback for name
      if (!name) {
        name = fileName.replace(/\.(json|csv)$/, "");
      }

      console.log("File received:", {
        fileName,
        mimeType,
        size: fileBuffer.length,
        name,
        description,
        guidelines,
      });

      const requiredHeaders = [
        "section_title",
        "section_order",
        "step_title",
        "step_order",
        "question_title",
        "question_text",
        "question_context",
        "question_order",
        "rating_desc_1",
        "rating_value_1",
        "rating_desc_2",
        "rating_value_2",
        "rating_desc_3",
        "rating_value_3",
        "rating_desc_4",
        "rating_value_4",
        "rating_desc_5",
        "rating_value_5",
        "rating_desc_6",
        "rating_value_6",
        "rating_desc_7",
        "rating_value_7",
        "rating_desc_8",
        "rating_value_8",
        "rating_desc_9",
        "rating_value_9",
        "rating_desc_10",
        "rating_value_10",
      ];

      // Validate the file structure
      if (mimeType === "application/json") {
        // Handle JSON import
        const jsonString = fileBuffer.toString("utf-8");
        try {
          const jsonData = JSON.parse(jsonString);
          console.log("jsonData: ", jsonData);
          // Further validation of jsonData can be done here
        } catch (error) {
          console.log("JSON parse error: ", error);
          throw new BadRequestError("Invalid JSON file");
        }
      } else if (mimeType === "text/csv") {
        // Handle CSV import using proper CSV parser
        const csvString = fileBuffer.toString("utf-8");

        let records: Record<string, string>[];
        try {
          records = parse(csvString, {
            columns: true, // Use first row as header names
            skip_empty_lines: true, // Skip empty lines
            trim: true, // Trim whitespace from fields
            relax_quotes: true, // Be lenient with quotes
            relax_column_count: true, // Allow inconsistent column counts (extra columns ignored)
            bom: true, // Strip BOM (Byte Order Mark) if present
          });
        } catch (error) {
          console.log("CSV parse error: ", error);
          throw new BadRequestError(
            `Failed to parse CSV: ${
              error instanceof Error ? error.message : "Invalid CSV format"
            }`
          );
        }

        // Get headers from the first record
        const headers = records.length > 0 ? Object.keys(records[0]) : [];

        // Check for required headers
        const missingHeaders = [];
        for (const header of requiredHeaders) {
          if (!headers.includes(header)) {
            missingHeaders.push(header);
          }
        }
        if (missingHeaders.length > 0) {
          throw new BadRequestError(
            `Missing required headers: ${missingHeaders.join(", ")}`
          );
        }

        // Validation errors collection
        const validationErrors: string[] = [];

        // Track unique question combinations to detect duplicates
        const questionCombinations = new Set<string>();

        // Validate each record
        records.forEach((record, rowIndex) => {
          const rowNum = rowIndex + 2; // +2 because we skip header (row 1) and arrays are 0-indexed

          // 1. Validate required fields are present
          if (!record.section_title?.trim()) {
            validationErrors.push(
              `Row ${rowNum}: section_title is required and cannot be empty`
            );
          }
          if (!record.step_title?.trim()) {
            validationErrors.push(
              `Row ${rowNum}: step_title is required and cannot be empty`
            );
          }
          if (!record.question_title?.trim()) {
            validationErrors.push(
              `Row ${rowNum}: question_title is required and cannot be empty`
            );
          }
          if (!record.question_text?.trim()) {
            validationErrors.push(
              `Row ${rowNum}: question_text is required and cannot be empty`
            );
          }

          // 2. Validate order fields are numbers
          const sectionOrder = parseInt(record.section_order);
          if (isNaN(sectionOrder) || sectionOrder < 1) {
            validationErrors.push(
              `Row ${rowNum}: section_order must be a positive number (got: "${record.section_order}")`
            );
          }

          const stepOrder = parseInt(record.step_order);
          if (isNaN(stepOrder) || stepOrder < 1) {
            validationErrors.push(
              `Row ${rowNum}: step_order must be a positive number (got: "${record.step_order}")`
            );
          }

          const questionOrder = parseInt(record.question_order);
          if (isNaN(questionOrder) || questionOrder < 1) {
            validationErrors.push(
              `Row ${rowNum}: question_order must be a positive number (got: "${record.question_order}")`
            );
          }

          // 3. Check for duplicate section + step + question combinations
          const questionKey = `${record.section_title}|${record.step_title}|${record.question_title}`;
          if (questionCombinations.has(questionKey)) {
            validationErrors.push(
              `Row ${rowNum}: Duplicate question found - section "${record.section_title}", step "${record.step_title}", question "${record.question_title}"`
            );
          }
          questionCombinations.add(questionKey);

          // 4. Validate rating scales
          const ratingScales: Array<{
            description: string;
            value: number;
          }> = [];
          const ratingValues = new Set<number>();

          for (let i = 1; i <= 10; i++) {
            const ratingDesc = record[`rating_desc_${i}`]?.trim() || "";
            const ratingValueStr = record[`rating_value_${i}`]?.trim();

            // If we have any part of a rating scale, validate the whole thing
            if (ratingValueStr) {
              // Validate value is a number
              const ratingValue = parseInt(ratingValueStr);
              if (isNaN(ratingValue)) {
                validationErrors.push(
                  `Row ${rowNum}: rating_value_${i} must be a number (got: "${ratingValueStr}")`
                );
              } else {
                // Check for duplicate values within this question
                if (ratingValues.has(ratingValue)) {
                  validationErrors.push(
                    `Row ${rowNum}: Duplicate rating_value ${ratingValue} found in question`
                  );
                }
                ratingValues.add(ratingValue);

                ratingScales.push({
                  description: ratingDesc,
                  value: ratingValue,
                });
              }
            }
          }

          // 5. Validate at least one rating scale is present
          if (ratingScales.length === 0) {
            validationErrors.push(
              `Row ${rowNum}: At least one rating scale (rating_value_1) is required`
            );
          }
        });

        // If there are validation errors, return them
        if (validationErrors.length > 0) {
          throw new BadRequestError("CSV validation failed", {
            errors: validationErrors,
          });
        }

        // Prepare data using Maps for O(n) deduplication
        const sectionsMap = new Map<
          string,
          { title: string; order_index: number }
        >();
        const stepsMap = new Map<
          string,
          { section_title: string; title: string; order_index: number }
        >();
        const questionsMap = new Map<
          string,
          {
            section_title: string;
            step_title: string;
            title: string;
            question_text: string;
            context: string;
            order_index: number;
          }
        >();
        const ratingScalesMap = new Map<
          number,
          { name: string; description: string; value: number }
        >();
        const questionRatingScales: Array<{
          question_key: string;
          value: number;
          description: string;
        }> = [];

        // Process all records
        for (const record of records) {
          // 1. Deduplicate sections
          const sectionKey = record.section_title;
          if (!sectionsMap.has(sectionKey)) {
            sectionsMap.set(sectionKey, {
              title: record.section_title,
              order_index: parseInt(record.section_order),
            });
          }

          // 2. Deduplicate steps
          const stepKey = `${record.section_title}|${record.step_title}`;
          if (!stepsMap.has(stepKey)) {
            stepsMap.set(stepKey, {
              section_title: record.section_title,
              title: record.step_title,
              order_index: parseInt(record.step_order),
            });
          }

          // 3. Deduplicate questions
          const questionKey = `${record.section_title}|${record.step_title}|${record.question_title}`;
          if (!questionsMap.has(questionKey)) {
            questionsMap.set(questionKey, {
              section_title: record.section_title,
              step_title: record.step_title,
              title: record.question_title,
              question_text: record.question_text,
              context: record.question_context || "",
              order_index: parseInt(record.question_order),
            });
          }

          // 4. Deduplicate rating scales (by value)
          for (let i = 1; i <= 10; i++) {
            const ratingValueStr = record[`rating_value_${i}`]?.trim();
            if (ratingValueStr) {
              const ratingValue = parseInt(ratingValueStr);
              if (!isNaN(ratingValue) && !ratingScalesMap.has(ratingValue)) {
                ratingScalesMap.set(ratingValue, {
                  name: `Level ${ratingValue}`,
                  description: `Imported scale level ${ratingValue}`,
                  value: ratingValue,
                });
              }
            }
          }

          // 5. Collect all question rating scales (with duplicates per question)
          for (let i = 1; i <= 10; i++) {
            const ratingDesc = record[`rating_desc_${i}`]?.trim() || "";
            const ratingValueStr = record[`rating_value_${i}`]?.trim();
            if (ratingValueStr) {
              const ratingValue = parseInt(ratingValueStr);
              if (!isNaN(ratingValue)) {
                questionRatingScales.push({
                  question_key: questionKey,
                  value: ratingValue,
                  description: ratingDesc,
                });
              }
            }
          }
        }

        // Convert maps to arrays and add order_index for rating scales
        const sections = Array.from(sectionsMap.values());
        const steps = Array.from(stepsMap.values());
        const questions = Array.from(questionsMap.values());
        const ratingScales = Array.from(ratingScalesMap.values()).map(
          (rs, index) => ({
            ...rs,
            order_index: index,
          })
        );

        // Call service to import
        const questionnaireService = new QuestionnaireService(
          request.supabaseClient,
          userId
        );

        questionnaire = await questionnaireService.importQuestionnaire(
          companyId,
          {
            name,
            description,
            guidelines,
            sections,
            steps,
            questions,
            rating_scales: ratingScales,
            question_rating_scales: questionRatingScales,
          }
        );
      }

      return {
        success: true,
        data: questionnaire,
      };
    }
  );
}
