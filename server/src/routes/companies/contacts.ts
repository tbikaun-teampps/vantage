import { FastifyInstance } from "fastify";
import { companySchemas } from "../../schemas/company";
import { commonResponseSchemas } from "../../schemas/common";
import { NotFoundError } from "../../plugins/errorHandler";
import {
  companyRoleMiddleware,
  requireCompanyRole,
} from "../../middleware/companyRole";
import { ZodTypeProvider } from "fastify-type-provider-zod";

export async function contactsRoutes(fastify: FastifyInstance) {
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:companyId/contacts",
    preHandler: [companyRoleMiddleware, requireCompanyRole("viewer")],
    schema: {
      description: "Get all contacts for a company",
      params: companySchemas.params.companyId,
      response: {
        200: companySchemas.responses.contactList,
        401: commonResponseSchemas.responses[401],
        500: commonResponseSchemas.responses[500],
      },
    },
    handler: async (request) => {
      const contacts = await request.companiesService!.getCompanyContacts(
        request.params.companyId
      );

      return {
        success: true,
        data: contacts,
      };
    },
  });
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:companyId/contacts/:entityType/:entityId",
    preHandler: [companyRoleMiddleware, requireCompanyRole("viewer")],
    schema: {
      description: "Get all contacts for a specific entity",
      params: companySchemas.params.contactParams,
      response: {
        200: companySchemas.responses.contactList,
        401: commonResponseSchemas.responses[401],
        500: commonResponseSchemas.responses[500],
      },
    },
    handler: async (request) => {
      const { companyId, entityType, entityId } = request.params;
      const contacts = await request.companiesService!.getEntityContacts(
        companyId,
        entityType,
        entityId
      );

      return {
        success: true,
        data: contacts,
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/:companyId/contacts/:entityType/:entityId",
    preHandler: [companyRoleMiddleware, requireCompanyRole("admin")],
    schema: {
      description: "Create a new contact and link it to an entity",
      params: companySchemas.params.contactParams,
      body: companySchemas.body.createContact,
      response: {
        200: companySchemas.responses.contactDetail,
        400: commonResponseSchemas.responses[400],
        401: commonResponseSchemas.responses[401],
        500: commonResponseSchemas.responses[500],
      },
    },
    handler: async (request) => {
      const { companyId, entityType, entityId } = request.params;
      const contact = await request.companiesService!.createEntityContact(
        companyId,
        entityType,
        entityId,
        request.body
      );

      return {
        success: true,
        data: contact,
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "PUT",
    url: "/:companyId/contacts/:contactId",
    preHandler: [companyRoleMiddleware, requireCompanyRole("admin")],
    schema: {
      description: "Update an existing contact",
      params: companySchemas.params.contactUpdateParams,
      body: companySchemas.body.updateContact,
      response: {
        200: companySchemas.responses.contactDetail,
        400: commonResponseSchemas.responses[400],
        401: commonResponseSchemas.responses[401],
        404: commonResponseSchemas.responses[404],
        500: commonResponseSchemas.responses[500],
      },
    },

    handler: async (request) => {
      const { companyId, contactId } = request.params;

      const contact = await request.companiesService!.updateContact(
        companyId,
        contactId,
        request.body
      );

      if (!contact) {
        throw new NotFoundError("Contact not found");
      }

      return {
        success: true,
        data: contact,
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "DELETE",
    url: "/:companyId/contacts/:entityType/:entityId/:contactId",
    preHandler: [companyRoleMiddleware, requireCompanyRole("admin")],
    schema: {
      description:
        "Unlink contact from entity and delete if no other links exist",
      params: companySchemas.params.contactDeleteParams,
      response: {
        200: commonResponseSchemas.messageResponse,
        400: commonResponseSchemas.responses[400],
        401: commonResponseSchemas.responses[401],
        500: commonResponseSchemas.responses[500],
      },
    },

    handler: async (request) => {
      const { companyId, entityType, entityId, contactId } = request.params;
      const result = await request.companiesService!.deleteEntityContact(
        companyId,
        entityType,
        entityId,
        contactId
      );

      return {
        success: result.success,
        message: result.message,
      };
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:companyId/contacts/roles/:roleId",
    schema: {
      description: "Get contacts by their role within a company",
      params: companySchemas.params.contactRoleParams,
      response: {
        200: companySchemas.responses.contactList,
        401: commonResponseSchemas.responses[401],
        500: commonResponseSchemas.responses[500],
      },
    },
    handler: async (request) => {
      const { companyId, roleId } = request.params;
      const contacts = await request.companiesService!.getContactsByRole(
        companyId,
        roleId
      );

      return {
        success: true,
        data: contacts,
      };
    },
  });
}
