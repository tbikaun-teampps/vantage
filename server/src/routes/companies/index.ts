import { FastifyInstance } from "fastify";
import { companySchemas, LocationTypeEnum } from "../../schemas/company";
import { commonResponseSchemas } from "../../schemas/common";
import { CompaniesService } from "../../services/CompaniesService";
import { NotFoundError, BadRequestError } from "../../plugins/errorHandler";
import { AssessmentsService } from "../../services/AssessmentsService";
import { entitiesRoutes } from "./entities";
import { contactsRoutes } from "./contacts";
import { teamRoutes } from "./team";
import { parse } from "csv-parse/sync";
import {
  companyRoleMiddleware,
  requireCompanyRole,
} from "../../middleware/companyRole";
import { questionnaireSchemas } from "../../schemas/questionnaire";
import { QuestionnaireService } from "../../services/QuestionnaireService";
import { RecommendationsService } from "../../services/RecommendationsService";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  Error400Schema,
  Error401Schema,
  Error403Schema,
  Error404Schema,
  Error500Schema,
} from "../../schemas/errors";
import { z } from "zod";
import {
  AssessmentStatusEnum,
  AssessmentTypeEnum,
} from "../../schemas/assessments";
import {
  RecommendationPriorityEnum,
  RecommendationStatusEnum,
} from "../../schemas/recommendations";
import { InterviewStatusEnum } from "../../schemas/interviews";

export async function companiesRoutes(fastify: FastifyInstance) {
  // Add "Companies" tag to all routes in this router
  fastify.addHook("onRoute", (routeOptions) => {
    if (!routeOptions.schema) routeOptions.schema = {};
    if (!routeOptions.schema.tags) {
      routeOptions.schema.tags = ["Companies"];
    }
  });
  // Attach CompaniesService to all routes in this router
  fastify.addHook("preHandler", async (request) => {
    request.companiesService = new CompaniesService(
      request.supabaseClient,
      request.user.id,
      request.subscriptionTier
    );
  });
  //   Register sub-routers
  await fastify.register(entitiesRoutes);
  await fastify.register(contactsRoutes);
  await fastify.register(teamRoutes);

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "",
    // No preHandler required, RLS will handle access control
    schema: {
      description: "Get all companies",
      response: {
        200: companySchemas.responses.companyList,
        401: Error401Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const companies = await request.companiesService!.getCompanies();
      return {
        success: true,
        data: companies,
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:companyId",
    // No preHandler required, RLS will handle access control
    schema: {
      description: "Get company by ID",
      params: companySchemas.params.companyId,
      response: {
        200: companySchemas.responses.companyWithRoleDetail,
        401: Error401Schema,
        404: Error404Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const company = await request.companiesService!.getCompanyById(
        request.params.companyId
      );
      return {
        success: true,
        data: company,
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "",
    // No prehandler required, any non-demo user can create a company.
    schema: {
      description: "Create a new company",
      body: companySchemas.body.createCompany,
      response: {
        200: companySchemas.responses.companyWithRoleDetail,
        401: Error401Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const company = await request.companiesService!.createCompany(
        request.body
      );

      return {
        success: true,
        data: company,
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "PUT",
    url: "/:companyId",
    preHandler: [companyRoleMiddleware, requireCompanyRole("admin")],
    schema: {
      description: "Update company details",
      params: companySchemas.params.companyId,
      body: companySchemas.body.updateCompany,
      response: {
        200: companySchemas.responses.companyDetail,
        401: Error401Schema,
        404: Error404Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const company = await request.companiesService!.updateCompany(
        request.params.companyId,
        request.body
      );

      if (!company) {
        throw new NotFoundError("Company not found");
      }

      return {
        success: true,
        data: company,
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "DELETE",
    url: "/:companyId",
    preHandler: [companyRoleMiddleware, requireCompanyRole("owner")],
    schema: {
      params: companySchemas.params.companyId,
      response: {
        200: commonResponseSchemas.messageResponse,
        401: Error401Schema,
        404: Error404Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const deleted = await request.companiesService!.deleteCompany(
        request.params.companyId
      );

      if (!deleted) {
        throw new NotFoundError("Company not found");
      }

      return {
        success: true,
        message: "Company deleted successfully",
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:companyId/tree",
    preHandler: [companyRoleMiddleware, requireCompanyRole("viewer")],
    schema: {
      description: "Get company tree structure",
      params: companySchemas.params.companyId,
      response: {
        200: companySchemas.responses.companyTree,
        401: Error401Schema,
        404: Error404Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const treeData = await request.companiesService!.getCompanyTree(
        request.params.companyId
      );

      if (!treeData) {
        throw new NotFoundError("Company not found");
      }

      return {
        success: true,
        data: treeData,
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "PATCH",
    url: "/:companyId/tree/reorder",
    schema: {
      description: "Reorder company tree",
      params: z.object({
        companyId: z.string(),
      }),
      // When reording within the same parent:
      // only type and order_index are required for each item.
      // When moving to a different parent, parent_id is also required for that item.
      body: z.array(
        z.object({
          id: z.number(),
          type: z.enum(LocationTypeEnum),
          order_index: z.number(),
          parent_id: z.number().optional(),
        })
      ),
    },
    handler: async (request) => {
      await request.companiesService!.reorderCompanyTree(
        request.params.companyId,
        request.body
      );
      return {
        success: true,
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:companyId/assessments",
    preHandler: [companyRoleMiddleware, requireCompanyRole("viewer")],
    schema: {
      description:
        "Get all assessments for a given company with optional filters",
      summary: "Retrieve a list of assessments",
      params: z.object({
        companyId: z.string(),
      }),
      querystring: z.object({
        type: z.enum(AssessmentTypeEnum).optional(),
        status: z.array(z.enum(AssessmentStatusEnum)).optional(),
        search: z.string().optional(),
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.array(
            z.object({
              id: z.number(),
              name: z.string(),
              description: z.string().nullable(),
              status: z.enum(AssessmentStatusEnum),
              total_responses: z.number(),
              interview_count: z.number(),
              completed_interview_count: z.number(),
              completed_at: z.string().nullable(),
              interview_overview: z.string().nullable(),
              program_phase_id: z.number().nullable(),
              questionnaire_id: z.number().nullable(),
              questionnaire_name: z.string().optional(),
              scheduled_at: z.string().nullable(),
              type: z.enum(AssessmentTypeEnum),
              created_at: z.string(),
              updated_at: z.string(),
              interviews: z
                .array(
                  z.object({
                    id: z.number(),
                    status: z.enum(InterviewStatusEnum),
                    interview_responses: z.array(
                      z.object({
                        id: z.number(),
                        rating_score: z.number().nullable(),
                      })
                    ),
                  })
                )
                .nullable(),
            })
          ),
        }),
        401: Error401Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const assessmentsService = new AssessmentsService(
        request.supabaseClient,
        request.user.id
      );
      const assessments = await assessmentsService.getAssessments(
        request.params.companyId,
        request.query
      );

      return {
        success: true,
        data: assessments,
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:companyId/recommendations",
    preHandler: [companyRoleMiddleware, requireCompanyRole("viewer")],
    schema: {
      description: "Get all recommendations for a company",
      params: companySchemas.params.companyId,
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.array(
            z.object({
              id: z.number(),
              program: z
                .object({
                  id: z.number(),
                  name: z.string(),
                })
                .nullable(),
              created_at: z.string(),
              updated_at: z.string(),
              content: z.string(),
              context: z.string(),
              title: z.string(),
              priority: z.enum(RecommendationPriorityEnum),
              status: z.enum(RecommendationStatusEnum),
              assessment: z
                .object({
                  id: z.number(),
                  name: z.string(),
                  type: z.enum(AssessmentTypeEnum),
                })
                .nullable(),
            })
          ),
        }),
        401: Error401Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const recommendationsService = new RecommendationsService(
        request.supabaseClient
      );
      const recommendations =
        await recommendationsService.getAllRecommendations(
          request.params.companyId
        );

      return {
        success: true,
        data: recommendations,
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:companyId/export",
    preHandler: [companyRoleMiddleware, requireCompanyRole("viewer")],
    schema: {
      description: "Export company structure as JSON",
      params: companySchemas.params.companyId,
      response: {
        200: z.string(), // JSON string representing the company structure
        401: Error401Schema,
        404: Error404Schema,
        500: Error500Schema,
      },
    },
    handler: async (request, reply) => {
      const exportData = await request.companiesService!.exportCompanyStructure(
        request.params.companyId
      );

      // Set headers for file download
      const fileName = `company-structure-${exportData.name
        .toLowerCase()
        .replace(/\s+/g, "-")}.json`;

      reply.header("Content-Type", "application/json");
      reply.header("Content-Disposition", `attachment; filename="${fileName}"`);

      return reply.send(JSON.stringify(exportData, null, 2));
    },
  });

  fastify.post(
    "/:companyId/import",
    {
      preHandler: [companyRoleMiddleware, requireCompanyRole("admin")],
      schema: {
        description: "Import company structure from a CSV file",
        consumes: ["multipart/form-data"],
        params: companySchemas.params.companyId,
        response: {
          200: companySchemas.responses.companyTree,
          400: Error400Schema,
          401: Error401Schema,
        },
      },
    },
    async (request) => {
      const { companyId } = request.params as { companyId: string };
      const userId = request.user.id;

      // Verify company exists and user has access
      const company = await request.companiesService!.getCompanyById(companyId);

      if (!company) {
        throw new NotFoundError("Company not found");
      }

      // Parse multipart form data
      const parts = request.parts();
      let fileBuffer: Buffer | null = null;
      let fileName = "";
      let mimeType = "";

      for await (const part of parts) {
        if (part.type === "file") {
          fileName = part.filename;
          mimeType = part.mimetype;
          fileBuffer = await part.toBuffer();
        }
      }

      if (!fileBuffer) {
        throw new BadRequestError("No file provided");
      }

      // Validate CSV file type
      if (mimeType !== "text/csv" && !fileName.endsWith(".csv")) {
        throw new BadRequestError("Only CSV files are supported");
      }

      // Parse CSV
      const csvString = fileBuffer.toString("utf-8");
      let records: Record<string, string>[];

      try {
        records = parse(csvString, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
          relax_quotes: true,
          relax_column_count: true,
        });
      } catch (error) {
        throw new BadRequestError(
          `Failed to parse CSV: ${
            error instanceof Error ? error.message : "Invalid CSV format"
          }`
        );
      }

      if (records.length === 0) {
        throw new BadRequestError("CSV file is empty");
      }

      // Get headers
      const headers = Object.keys(records[0]);

      // Required name fields for hierarchy validation
      const nameFields = [
        "business_unit_name",
        "region_name",
        "site_name",
        "asset_group_name",
        "work_group_name",
        "role_name",
      ];

      // Validation errors collection
      const validationErrors: string[] = [];

      // Validate that at least one name field exists in headers
      const hasAtLeastOneNameField = nameFields.some((field) =>
        headers.includes(field)
      );

      if (!hasAtLeastOneNameField) {
        throw new BadRequestError(
          `CSV must contain at least one of these columns: ${nameFields.join(", ")}`
        );
      }

      // Fetch shared roles for validation
      const { data: sharedRoles, error: rolesError } =
        await request.supabaseClient
          .from("shared_roles")
          .select("id, name")
          .or(`created_by.is.null,created_by.eq.${userId}`)
          .eq("is_deleted", false);

      if (rolesError) {
        throw new Error("Failed to fetch shared roles for validation");
      }

      const sharedRoleNames = new Set(sharedRoles?.map((r) => r.name) || []);
      const sharedRoleMap = new Map(
        sharedRoles?.map((r) => [r.name, r.id]) || []
      );

      // Validate each record
      records.forEach((record, rowIndex) => {
        const rowNum = rowIndex + 2;

        // 1. Check hierarchy contiguity
        const hasBusinessUnit = !!record.business_unit_name?.trim();
        const hasRegion = !!record.region_name?.trim();
        const hasSite = !!record.site_name?.trim();
        const hasAssetGroup = !!record.asset_group_name?.trim();
        const hasWorkGroup = !!record.work_group_name?.trim();
        const hasRole = !!record.role_name?.trim();

        // Hierarchy must be contiguous
        if (hasRegion && !hasBusinessUnit) {
          validationErrors.push(
            `Row ${rowNum}: region requires business_unit to be defined`
          );
        }
        if (hasSite && !hasRegion) {
          validationErrors.push(
            `Row ${rowNum}: site requires region to be defined`
          );
        }
        if (hasAssetGroup && !hasSite) {
          validationErrors.push(
            `Row ${rowNum}: asset_group requires site to be defined`
          );
        }
        if (hasWorkGroup && !hasAssetGroup) {
          validationErrors.push(
            `Row ${rowNum}: work_group requires asset_group to be defined`
          );
        }
        if (hasRole && !hasWorkGroup) {
          validationErrors.push(
            `Row ${rowNum}: role requires work_group to be defined`
          );
        }

        // 2. Validate role_name exists in shared_roles
        if (hasRole && !sharedRoleNames.has(record.role_name.trim())) {
          validationErrors.push(
            `Row ${rowNum}: role_name "${record.role_name}" not found in shared roles. Please create it first or use an existing role.`
          );
        }

        // 3. Validate role_level if role exists
        if (hasRole && record.role_level) {
          const validLevels = ["management", "specialist", "technician"];
          if (!validLevels.includes(record.role_level.trim())) {
            validationErrors.push(
              `Row ${rowNum}: role_level must be one of: ${validLevels.join(", ")}`
            );
          }
        }

        // 4. Validate entity-specific contacts
        // Business unit contacts (single contact)
        const buContactName = record.business_unit_contact_name?.trim();
        const buContactEmail = record.business_unit_contact_email?.trim();
        if (buContactName && !buContactEmail) {
          validationErrors.push(
            `Row ${rowNum}: business_unit_contact_name provided but business_unit_contact_email is missing`
          );
        }
        if (buContactEmail && !buContactName) {
          validationErrors.push(
            `Row ${rowNum}: business_unit_contact_email provided but business_unit_contact_name is missing`
          );
        }
        if (buContactEmail && !buContactEmail.includes("@")) {
          validationErrors.push(
            `Row ${rowNum}: business_unit_contact_email is not a valid email address`
          );
        }

        // Region contacts (single contact)
        const regionContactName = record.region_contact_name?.trim();
        const regionContactEmail = record.region_contact_email?.trim();
        if (regionContactName && !regionContactEmail) {
          validationErrors.push(
            `Row ${rowNum}: region_contact_name provided but region_contact_email is missing`
          );
        }
        if (regionContactEmail && !regionContactName) {
          validationErrors.push(
            `Row ${rowNum}: region_contact_email provided but region_contact_name is missing`
          );
        }
        if (regionContactEmail && !regionContactEmail.includes("@")) {
          validationErrors.push(
            `Row ${rowNum}: region_contact_email is not a valid email address`
          );
        }

        // Site contacts (single contact)
        const siteContactName = record.site_contact_name?.trim();
        const siteContactEmail = record.site_contact_email?.trim();
        if (siteContactName && !siteContactEmail) {
          validationErrors.push(
            `Row ${rowNum}: site_contact_name provided but site_contact_email is missing`
          );
        }
        if (siteContactEmail && !siteContactName) {
          validationErrors.push(
            `Row ${rowNum}: site_contact_email provided but site_contact_name is missing`
          );
        }
        if (siteContactEmail && !siteContactEmail.includes("@")) {
          validationErrors.push(
            `Row ${rowNum}: site_contact_email is not a valid email address`
          );
        }

        // Asset group contacts (single contact)
        const agContactName = record.asset_group_contact_name?.trim();
        const agContactEmail = record.asset_group_contact_email?.trim();
        if (agContactName && !agContactEmail) {
          validationErrors.push(
            `Row ${rowNum}: asset_group_contact_name provided but asset_group_contact_email is missing`
          );
        }
        if (agContactEmail && !agContactName) {
          validationErrors.push(
            `Row ${rowNum}: asset_group_contact_email provided but asset_group_contact_name is missing`
          );
        }
        if (agContactEmail && !agContactEmail.includes("@")) {
          validationErrors.push(
            `Row ${rowNum}: asset_group_contact_email is not a valid email address`
          );
        }

        // Work group contacts (single contact)
        const wgContactName = record.work_group_contact_name?.trim();
        const wgContactEmail = record.work_group_contact_email?.trim();
        if (wgContactName && !wgContactEmail) {
          validationErrors.push(
            `Row ${rowNum}: work_group_contact_name provided but work_group_contact_email is missing`
          );
        }
        if (wgContactEmail && !wgContactName) {
          validationErrors.push(
            `Row ${rowNum}: work_group_contact_email provided but work_group_contact_name is missing`
          );
        }
        if (wgContactEmail && !wgContactEmail.includes("@")) {
          validationErrors.push(
            `Row ${rowNum}: work_group_contact_email is not a valid email address`
          );
        }

        // Role contacts (up to 5)
        for (let i = 1; i <= 5; i++) {
          const contactName = record[`role_contact_name_${i}`]?.trim();
          const contactEmail = record[`role_contact_email_${i}`]?.trim();

          if (contactName && !contactEmail) {
            validationErrors.push(
              `Row ${rowNum}: role_contact_name_${i} provided but role_contact_email_${i} is missing`
            );
          }
          if (contactEmail && !contactName) {
            validationErrors.push(
              `Row ${rowNum}: role_contact_email_${i} provided but role_contact_name_${i} is missing`
            );
          }

          // Basic email validation
          if (contactEmail && !contactEmail.includes("@")) {
            validationErrors.push(
              `Row ${rowNum}: role_contact_email_${i} is not a valid email address`
            );
          }
        }

        // 5. Validate lat/lng for sites
        if (hasSite) {
          if (record.site_lat && isNaN(parseFloat(record.site_lat))) {
            validationErrors.push(
              `Row ${rowNum}: site_lat must be a valid number`
            );
          }
          if (record.site_lng && isNaN(parseFloat(record.site_lng))) {
            validationErrors.push(
              `Row ${rowNum}: site_lng must be a valid number`
            );
          }
        }
      });

      // Return validation errors if any
      if (validationErrors.length > 0) {
        throw new BadRequestError("CSV validation failed", {
          errors: validationErrors,
        });
      }

      // Deduplicate and prepare data for import
      const businessUnitsMap = new Map();
      const regionsMap = new Map();
      const sitesMap = new Map();
      const assetGroupsMap = new Map();
      const workGroupsMap = new Map();
      const rolesMap = new Map();
      const contactsArray: {
        entity_type: string;
        entity_key: string;
        full_name: string;
        email: string;
      }[] = [];
      const contactSet = new Set<string>(); // entity_key|email for deduplication

      records.forEach((record) => {
        const buKey = record.business_unit_name?.trim();
        const regKey = `${buKey}|${record.region_name?.trim()}`;
        const siteKey = `${regKey}|${record.site_name?.trim()}`;
        const agKey = `${siteKey}|${record.asset_group_name?.trim()}`;
        const wgKey = `${agKey}|${record.work_group_name?.trim()}`;
        const roleKey = `${wgKey}|${record.role_name?.trim()}`;

        // Business Units
        if (buKey && !businessUnitsMap.has(buKey)) {
          businessUnitsMap.set(buKey, {
            name: buKey,
            code: record.business_unit_code?.trim() || "",
            description: record.business_unit_desc?.trim() || null,
          });
        }

        // Regions
        if (record.region_name?.trim() && !regionsMap.has(regKey)) {
          regionsMap.set(regKey, {
            business_unit_key: buKey,
            name: record.region_name.trim(),
            code: record.region_code?.trim() || "",
            description: record.region_desc?.trim() || null,
          });
        }

        // Sites
        if (record.site_name?.trim() && !sitesMap.has(siteKey)) {
          sitesMap.set(siteKey, {
            region_key: regKey,
            name: record.site_name.trim(),
            code: record.site_code?.trim() || "",
            description: record.site_desc?.trim() || null,
            lat: record.site_lat ? parseFloat(record.site_lat) : null,
            lng: record.site_lng ? parseFloat(record.site_lng) : null,
          });
        }

        // Asset Groups
        if (record.asset_group_name?.trim() && !assetGroupsMap.has(agKey)) {
          assetGroupsMap.set(agKey, {
            site_key: siteKey,
            name: record.asset_group_name.trim(),
            code: record.asset_group_code?.trim() || "",
            description: record.asset_group_desc?.trim() || null,
          });
        }

        // Work Groups
        if (record.work_group_name?.trim() && !workGroupsMap.has(wgKey)) {
          workGroupsMap.set(wgKey, {
            asset_group_key: agKey,
            name: record.work_group_name.trim(),
            code: record.work_group_code?.trim() || "",
            description: record.work_group_desc?.trim() || null,
          });
        }

        // Roles
        if (record.role_name?.trim() && !rolesMap.has(roleKey)) {
          rolesMap.set(roleKey, {
            work_group_key: wgKey,
            shared_role_id: sharedRoleMap.get(record.role_name.trim()),
            level: record.role_level?.trim() || null,
          });
        }

        // Collect business unit contacts
        if (buKey) {
          const contactName = record.business_unit_contact_name?.trim();
          const contactEmail = record.business_unit_contact_email?.trim();

          if (contactName && contactEmail) {
            const contactKey = `${buKey}|${contactEmail}`;
            if (!contactSet.has(contactKey)) {
              contactSet.add(contactKey);
              contactsArray.push({
                entity_type: "business_unit",
                entity_key: buKey,
                full_name: contactName,
                email: contactEmail,
              });
            }
          }
        }

        // Collect region contacts
        if (record.region_name?.trim()) {
          const contactName = record.region_contact_name?.trim();
          const contactEmail = record.region_contact_email?.trim();

          if (contactName && contactEmail) {
            const contactKey = `${regKey}|${contactEmail}`;
            if (!contactSet.has(contactKey)) {
              contactSet.add(contactKey);
              contactsArray.push({
                entity_type: "region",
                entity_key: regKey,
                full_name: contactName,
                email: contactEmail,
              });
            }
          }
        }

        // Collect site contacts
        if (record.site_name?.trim()) {
          const contactName = record.site_contact_name?.trim();
          const contactEmail = record.site_contact_email?.trim();

          if (contactName && contactEmail) {
            const contactKey = `${siteKey}|${contactEmail}`;
            if (!contactSet.has(contactKey)) {
              contactSet.add(contactKey);
              contactsArray.push({
                entity_type: "site",
                entity_key: siteKey,
                full_name: contactName,
                email: contactEmail,
              });
            }
          }
        }

        // Collect asset group contacts
        if (record.asset_group_name?.trim()) {
          const contactName = record.asset_group_contact_name?.trim();
          const contactEmail = record.asset_group_contact_email?.trim();

          if (contactName && contactEmail) {
            const contactKey = `${agKey}|${contactEmail}`;
            if (!contactSet.has(contactKey)) {
              contactSet.add(contactKey);
              contactsArray.push({
                entity_type: "asset_group",
                entity_key: agKey,
                full_name: contactName,
                email: contactEmail,
              });
            }
          }
        }

        // Collect work group contacts
        if (record.work_group_name?.trim()) {
          const contactName = record.work_group_contact_name?.trim();
          const contactEmail = record.work_group_contact_email?.trim();

          if (contactName && contactEmail) {
            const contactKey = `${wgKey}|${contactEmail}`;
            if (!contactSet.has(contactKey)) {
              contactSet.add(contactKey);
              contactsArray.push({
                entity_type: "work_group",
                entity_key: wgKey,
                full_name: contactName,
                email: contactEmail,
              });
            }
          }
        }

        // Collect role contacts (up to 5)
        if (record.role_name?.trim()) {
          for (let i = 1; i <= 5; i++) {
            const contactName = record[`role_contact_name_${i}`]?.trim();
            const contactEmail = record[`role_contact_email_${i}`]?.trim();

            if (contactName && contactEmail) {
              const contactKey = `${roleKey}|${contactEmail}`;
              if (!contactSet.has(contactKey)) {
                contactSet.add(contactKey);
                contactsArray.push({
                  entity_type: "role",
                  entity_key: roleKey,
                  full_name: contactName,
                  email: contactEmail,
                });
              }
            }
          }
        }
      });

      // Convert maps to arrays
      const importData = {
        business_units: Array.from(businessUnitsMap.values()),
        regions: Array.from(regionsMap.values()),
        sites: Array.from(sitesMap.values()),
        asset_groups: Array.from(assetGroupsMap.values()),
        work_groups: Array.from(workGroupsMap.values()),
        roles: Array.from(rolesMap.values()),
        contacts: contactsArray,
      };

      // Call service to import
      await request.companiesService!.importCompanyStructure(
        companyId,
        importData
      );

      // Fetch updated company tree
      const updatedTree =
        await request.companiesService!.getCompanyTree(companyId);

      return {
        success: true,
        data: updatedTree,
      };
    }
  );

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:companyId/actions",
    schema: {
      description: "Get all actions for a given company",
      params: companySchemas.params.companyId,
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.array(
            z.object({
              id: z.number(),
              title: z.string().nullable(),
              description: z.string(),
              created_at: z.string(),
              updated_at: z.string(),
              interview_response: z.object({
                id: z.number(),
                questionnaire_question: z.object({
                  id: z.number(),
                  title: z.string(),
                  questionnaire_step: z.object({
                    id: z.number(),
                    title: z.string(),
                    questionnaire_section: z.object({
                      id: z.number(),
                      title: z.string(),
                    }),
                  }),
                }),
                interview: z.object({
                  id: z.number(),
                  interview_contact: z
                    .object({
                      id: z.number(),
                      full_name: z.string(),
                      email: z.email(),
                    })
                    .nullable(),
                  assessment: z
                    .object({
                      id: z.number(),
                      name: z.string(),
                      site: z
                        .object({
                          id: z.number(),
                          name: z.string(),
                          region: z.object({
                            id: z.number(),
                            name: z.string(),
                            business_unit: z.object({
                              id: z.number(),
                              name: z.string(),
                            }),
                          }),
                        })
                        .nullable(),
                    })
                    .nullable(),
                }),
              }),
            })
          ),
        }),
        401: Error401Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const data = await request.companiesService!.getActionsByCompanyId(
        request.params.companyId
      );

      return {
        success: true,
        data: data,
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:companyId/questionnaires",
    // TODO: should this have a preHandler to check company role?
    schema: {
      description: "Get all questionnaires for a given company",
      params: companySchemas.params.companyId,
      response: {
        200: questionnaireSchemas.responses.questionnaireList,
        401: Error401Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const questionnaireService = new QuestionnaireService(
        request.supabaseClient,
        request.user.id,
        request.subscriptionTier
      );
      const questionnaires = await questionnaireService.getQuestionnaires(
        request.params.companyId
      );

      return {
        success: true,
        data: questionnaires,
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/:companyId/icon",
    preHandler: [companyRoleMiddleware, requireCompanyRole("admin")],
    schema: {
      description: "Upload or replace company icon",
      consumes: ["multipart/form-data"],
      params: companySchemas.params.companyId,
      response: {
        200: companySchemas.responses.iconUpload,
        400: Error400Schema,
        401: Error401Schema,
        403: Error403Schema,
        404: Error404Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      // Parse multipart form data
      const parts = request.parts();
      let fileBuffer: Buffer | null = null;
      let fileName = "";
      let mimeType = "";

      for await (const part of parts) {
        if (part.type === "file") {
          fileName = part.filename;
          mimeType = part.mimetype;
          fileBuffer = await part.toBuffer();
          break; // Only accept the first file
        }
      }

      if (!fileBuffer) {
        throw new BadRequestError("No file provided");
      }

      // Upload icon using service
      const iconUrl = await request.companiesService!.updateCompanyIcon(
        request.params.companyId,
        fileBuffer,
        fileName,
        mimeType
      );

      return {
        success: true,
        data: {
          icon_url: iconUrl,
        },
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "DELETE",
    url: "/:companyId/icon",
    preHandler: [companyRoleMiddleware, requireCompanyRole("admin")],
    schema: {
      description: "Remove company icon",
      params: companySchemas.params.companyId,
      response: {
        200: commonResponseSchemas.messageResponse,
        401: Error401Schema,
        403: Error403Schema,
        404: Error404Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      await request.companiesService!.removeCompanyIcon(
        request.params.companyId
      );

      return {
        success: true,
        message: "Company icon removed successfully",
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "PATCH",
    url: "/:companyId/branding",
    preHandler: [companyRoleMiddleware, requireCompanyRole("admin")],
    schema: {
      description: "Update company branding colors",
      params: companySchemas.params.companyId,
      body: z.object({
        primary: z
          .string()
          .regex(/^#[0-9A-Fa-f]{6}$/, { message: "Invalid hex color format" }),
        secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/, {
          message: "Invalid hex color format",
        }),
        accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/, {
          message: "Invalid hex color format",
        }),
      }),
      response: {
        200: companySchemas.responses.companyDetail,
        400: Error400Schema,
        401: Error401Schema,
        403: Error403Schema,
        404: Error404Schema,
        500: Error500Schema,
      },
    },
    handler: async (request) => {
      const company = await request.companiesService!.updateCompanyBranding(
        request.params.companyId,
        request.body
      );

      if (!company) {
        throw new NotFoundError("Company not found");
      }

      return {
        success: true,
        data: company,
      };
    },
  });
}
