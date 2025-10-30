import { FastifyInstance } from "fastify";
import { companySchemas } from "../../schemas/company";
import { commonResponseSchemas } from "../../schemas/common";
import { CompaniesService } from "../../services/CompaniesService";
import { NotFoundError, BadRequestError } from "../../plugins/errorHandler";
import { AssessmentsService } from "../../services/AssessmentsService";
import { entitiesRoutes } from "./entities";
import { contactsRoutes } from "./contacts";
// import { rolesRoutes } from "./roles";
import { teamRoutes } from "./team";
import { parse } from "csv-parse/sync";
import {
  companyRoleMiddleware,
  requireCompanyRole,
} from "../../middleware/companyRole";
import type {
  CreateCompanyData,
  UpdateCompanyData,
  UpdateBrandingData,
} from "../../types/entities/companies";
import { AssessmentFilters } from "../../types/entities/assessments";
import { questionnaireSchemas } from "../../schemas/questionnaire";
import { QuestionnaireService } from "../../services/QuestionnaireService";
import { RecommendationsService } from "../../services/RecommendationsService";

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
  // await fastify.register(rolesRoutes);
  await fastify.register(teamRoutes);
  fastify.get(
    "",
    {
      // No preHandler required, RLS will handle access control
      schema: {
        description: "Get all companies",
        response: {
          200: companySchemas.responses.companyList,
          401: commonResponseSchemas.responses[401],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request) => {
      const companies = await request.companiesService!.getCompanies();
      return {
        success: true,
        data: companies,
      };
    }
  );
  fastify.get(
    "/:companyId",
    {
      // No preHandler required, RLS will handle access control
      schema: {
        params: companySchemas.params.companyId,
        response: {
          200: companySchemas.responses.companyWithRoleDetail,
          401: commonResponseSchemas.responses[401],
          404: commonResponseSchemas.responses[404],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request) => {
      const { companyId } = request.params as { companyId: string };
      const company = await request.companiesService!.getCompanyById(companyId);

      return {
        success: true,
        data: company,
      };
    }
  );
  fastify.post(
    "",
    {
      // No prehandler required, any non-demo user can create a company.
      schema: {
        body: companySchemas.body.createCompany,
        response: {
          200: companySchemas.responses.companyWithRoleDetail,
          401: commonResponseSchemas.responses[401],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request) => {
      const company = await request.companiesService!.createCompany(
        request.body as CreateCompanyData
      );

      return {
        success: true,
        data: company,
      };
    }
  );
  fastify.put(
    "/:companyId",
    {
      preHandler: [companyRoleMiddleware, requireCompanyRole("admin")],
      schema: {
        params: companySchemas.params.companyId,
        body: companySchemas.body.updateCompany,
        response: {
          200: companySchemas.responses.companyDetail,
          401: commonResponseSchemas.responses[401],
          404: commonResponseSchemas.responses[404],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request) => {
      const { companyId } = request.params as { companyId: string };
      const company = await request.companiesService!.updateCompany(
        companyId,
        request.body as UpdateCompanyData
      );

      if (!company) {
        throw new NotFoundError("Company not found");
      }

      return {
        success: true,
        data: company,
      };
    }
  );
  fastify.delete(
    "/:companyId",
    {
      preHandler: [companyRoleMiddleware, requireCompanyRole("owner")],
      schema: {
        params: companySchemas.params.companyId,
        response: {
          200: commonResponseSchemas.messageResponse,
          401: commonResponseSchemas.responses[401],
          404: commonResponseSchemas.responses[404],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request) => {
      const { companyId } = request.params as { companyId: string };
      const deleted = await request.companiesService!.deleteCompany(companyId);

      if (!deleted) {
        throw new NotFoundError("Company not found");
      }

      return {
        success: true,
        message: "Company deleted successfully",
      };
    }
  );
  fastify.get(
    "/:companyId/tree",
    {
      preHandler: [companyRoleMiddleware, requireCompanyRole("viewer")],
      schema: {
        description: "Get company tree structure",
        params: companySchemas.params.companyId,
        response: {
          // 200: companySchemas.responses.companyTree,
          401: commonResponseSchemas.responses[401],
          404: commonResponseSchemas.responses[404],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request) => {
      const { companyId } = request.params as { companyId: string };
      const treeData =
        await request.companiesService!.getCompanyTree(companyId);

      if (!treeData) {
        throw new NotFoundError("Company not found");
      }

      return {
        success: true,
        data: treeData,
      };
    }
  );
  fastify.get(
    "/:companyId/assessments",
    {
      preHandler: [companyRoleMiddleware, requireCompanyRole("viewer")],
      schema: {
        description:
          "Get all assessments for a given company with optional filters",
        summary: "Retrieve a list of assessments",
        querystring: {
          type: "object",
          properties: {
            type: {
              type: "string",
              description: "Filter by assessment type",
              enum: ["onsite", "desktop"],
            },
            status: {
              type: "array",
              items: {
                type: "string",
                enum: ["draft", "in_progress", "completed"],
              },
              description: "Filter by assessment status",
            },
            search: {
              type: "string",
              description: "Search assessments by name or description",
            },
          },
        },
        params: {
          type: "object",
          properties: {
            companyId: { type: "string", description: "ID of the company" },
          },
          required: ["companyId"],
        },
      },
    },
    async (request) => {
      const { companyId } = request.params as { companyId: string };

      const assessmentsService = new AssessmentsService(
        request.supabaseClient,
        request.user.id
      );
      const assessments = await assessmentsService.getAssessments(
        companyId,
        request.query as AssessmentFilters
      );

      return {
        success: true,
        data: assessments,
      };
    }
  );
  fastify.get(
    "/:companyId/recommendations",
    {
      preHandler: [companyRoleMiddleware, requireCompanyRole("viewer")],
      schema: {
        description: "Get all recommendations for a company",
        params: companySchemas.params.companyId,
        response: {
          // 200: {
          //   type: "object",
          //   properties: {
          //     success: { type: "boolean" },
          //     data: {
          //       type: "array",
          //       items: { type: "object" },
          //     },
          //   },
          // },
          401: commonResponseSchemas.responses[401],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request) => {
      const { companyId } = request.params as { companyId: string };
      const recommendationsService = new RecommendationsService(
        request.supabaseClient
      );
      const recommendations =
        await recommendationsService.getAllRecommendations(companyId);

      return {
        success: true,
        data: recommendations,
      };
    }
  );

  // Method for exporting company structure as JSON
  fastify.get(
    "/:companyId/export",
    {
      preHandler: [companyRoleMiddleware, requireCompanyRole("viewer")],
      schema: {
        description: "Export company structure as JSON",
        params: companySchemas.params.companyId,
        response: {
          401: commonResponseSchemas.responses[401],
          404: commonResponseSchemas.responses[404],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request, reply) => {
      const { companyId } = request.params as { companyId: string };
      const exportData =
        await request.companiesService!.exportCompanyStructure(companyId);

      // Set headers for file download
      const fileName = `company-structure-${exportData.name
        .toLowerCase()
        .replace(/\s+/g, "-")}.json`;

      reply.header("Content-Type", "application/json");
      reply.header("Content-Disposition", `attachment; filename="${fileName}"`);

      return reply.send(JSON.stringify(exportData, null, 2));
    }
  );

  // Method for importing a company structure
  fastify.post(
    "/:companyId/import",
    {
      preHandler: [companyRoleMiddleware, requireCompanyRole("admin")],
      schema: {
        consumes: ["multipart/form-data"],
        params: companySchemas.params.companyId,
        response: {
          200: companySchemas.responses.companyTree,
          400: commonResponseSchemas.responses[400],
          401: commonResponseSchemas.responses[401],
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
  fastify.get(
    "/:companyId/actions",
    {
      schema: {
        response: {
          // 200: {
          //   type: "object",
          //   properties: {
          //     success: { type: "boolean" },
          //     data: {
          //       type: "array",
          //       items: { type: "object" },
          //     },
          //   },
          // },
          401: commonResponseSchemas.responses[401],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request) => {
      const { companyId } = request.params as { companyId: string };

      const data =
        await request.companiesService!.getActionsByCompanyId(companyId);

      return {
        success: true,
        data: data,
      };
    }
  );
  fastify.get(
    "/:companyId/questionnaires",
    {
      schema: {
        response: {
          200: questionnaireSchemas.responses.questionnaireList,
          401: commonResponseSchemas.responses[401],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request) => {
      const { companyId } = request.params as { companyId: string };
      const questionnaireService = new QuestionnaireService(
        request.supabaseClient,
        request.user.id,
        request.subscriptionTier
      );
      const questionnaires =
        await questionnaireService.getQuestionnaires(companyId);

      return {
        success: true,
        data: questionnaires,
      };
    }
  );

  // Upload or replace company icon
  fastify.post(
    "/:companyId/icon",
    {
      preHandler: [companyRoleMiddleware, requireCompanyRole("admin")],
      schema: {
        description: "Upload or replace company icon",
        consumes: ["multipart/form-data"],
        params: companySchemas.params.companyId,
        response: {
          200: companySchemas.responses.iconUpload,
          400: commonResponseSchemas.responses[400],
          401: commonResponseSchemas.responses[401],
          403: commonResponseSchemas.responses[403],
          404: commonResponseSchemas.responses[404],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request) => {
      const { companyId } = request.params as { companyId: string };

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
        companyId,
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
    }
  );

  // Remove company icon
  fastify.delete(
    "/:companyId/icon",
    {
      preHandler: [companyRoleMiddleware, requireCompanyRole("admin")],
      schema: {
        description: "Remove company icon",
        params: companySchemas.params.companyId,
        response: {
          200: commonResponseSchemas.messageResponse,
          401: commonResponseSchemas.responses[401],
          403: commonResponseSchemas.responses[403],
          404: commonResponseSchemas.responses[404],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request) => {
      const { companyId } = request.params as { companyId: string };

      await request.companiesService!.removeCompanyIcon(companyId);

      return {
        success: true,
        message: "Company icon removed successfully",
      };
    }
  );

  // Update company branding colors
  fastify.patch(
    "/:companyId/branding",
    {
      preHandler: [companyRoleMiddleware, requireCompanyRole("admin")],
      schema: {
        description: "Update company branding colors",
        params: companySchemas.params.companyId,
        body: {
          type: "object",
          properties: {
            primary: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$" },
            secondary: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$" },
            accent: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$" },
          },
          additionalProperties: false,
        },
        response: {
          200: companySchemas.responses.companyDetail,
          400: commonResponseSchemas.responses[400],
          401: commonResponseSchemas.responses[401],
          403: commonResponseSchemas.responses[403],
          404: commonResponseSchemas.responses[404],
          500: commonResponseSchemas.responses[500],
        },
      },
    },
    async (request) => {
      const { companyId } = request.params as { companyId: string };
      const brandingData = request.body as UpdateBrandingData;

      const company = await request.companiesService!.updateCompanyBranding(
        companyId,
        brandingData
      );

      if (!company) {
        throw new NotFoundError("Company not found");
      }

      return {
        success: true,
        data: company,
      };
    }
  );
}
