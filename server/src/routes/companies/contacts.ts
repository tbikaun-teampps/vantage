import { FastifyInstance } from "fastify";
import { companySchemas } from "../../schemas/company";
import { commonResponseSchemas } from "../../schemas/common";
import { NotFoundError, BadRequestError } from "../../plugins/errorHandler";
import {
  companyRoleMiddleware,
  requireCompanyRole,
} from "../../middleware/companyRole";
import type { ContactEntityType } from "../../types/entities/companies";

interface ContactsParams {
  companyId: string;
  entityType: ContactEntityType;
  entityId: string;
}

interface CreateContactParams {
  companyId: string;
  entityType: ContactEntityType;
  entityId: string;
}

interface CreateContactBody {
  full_name: string;
  email: string;
  phone?: string;
  title?: string;
}

interface UpdateContactParams {
  companyId: string;
  contactId: string;
}

interface UpdateContactBody {
  full_name?: string;
  email?: string;
  phone?: string;
  title?: string;
}

interface DeleteContactParams {
  companyId: string;
  entityType: ContactEntityType;
  entityId: string;
  contactId: string;
}

export async function contactsRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/:companyId/contacts",
    {
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
    },
    async (request) => {
      const { companyId } = request.params as { companyId: string };
      const contacts =
        await request.companiesService!.getCompanyContacts(companyId);

      return {
        success: true,
        data: contacts,
      };
    }
  );
  fastify.get(
    "/:companyId/contacts/:entityType/:entityId",
    {
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
    },
    async (request) => {
      const { companyId, entityType, entityId } =
        request.params as ContactsParams;
      const contacts = await request.companiesService!.getEntityContacts(
        companyId,
        entityType,
        entityId
      );

      return {
        success: true,
        data: contacts,
      };
    }
  );

  fastify.post(
    "/:companyId/contacts/:entityType/:entityId",
    {
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
    },
    async (request) => {
      const { companyId, entityType, entityId } =
        request.params as CreateContactParams;
      const contactData = request.body as CreateContactBody;
      const contact = await request.companiesService!.createEntityContact(
        companyId,
        entityType,
        entityId,
        contactData
      );

      return {
        success: true,
        data: contact,
      };
    }
  );

  fastify.put(
    "/:companyId/contacts/:contactId",
    {
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
    },
    async (request) => {
      const { companyId, contactId } = request.params as UpdateContactParams;
      const updateData = request.body as UpdateContactBody;

      if (Object.keys(updateData).length === 0) {
        throw new BadRequestError("No update data provided");
      }

      const contact = await request.companiesService!.updateContact(
        companyId,
        contactId,
        updateData
      );

      if (!contact) {
        throw new NotFoundError("Contact not found");
      }

      return {
        success: true,
        data: contact,
      };
    }
  );

  fastify.delete(
    "/:companyId/contacts/:entityType/:entityId/:contactId",
    {
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
    },
    async (request) => {
      const { companyId, entityType, entityId, contactId } =
        request.params as DeleteContactParams;
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
    }
  );

  // Method for getting contacts by their role within a company.
  fastify.get("/:companyId/contacts/roles/:roleId", async (request) => {
    const { companyId, roleId } = request.params as {
      companyId: string;
      roleId: number;
    };
    const contacts = await request.companiesService!.getContactsByRole(
      companyId,
      roleId
    );

    return {
      success: true,
      data: contacts,
    };
  });
}
