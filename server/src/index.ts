import Fastify from "fastify";
import { authMiddleware } from "./middleware/auth";
import { subscriptionTierMiddleware } from "./middleware/subscription";
import { flexibleAuthMiddleware } from "./middleware/flexibleAuth";
import { programRoutes } from "./routes/programs";
import { companiesRoutes } from "./routes/companies";
import { sharedRoutes } from "./routes/shared";
import { questionnairesRoutes } from "./routes/questionnaires";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import envPlugin from "./plugins/env";
import supabasePlugin from "./plugins/supabase";
import errorHandler from "./plugins/errorHandler";
import multipart from "@fastify/multipart";
import { usersRoutes } from "./routes/users";
import { assessmentsRouter } from "./routes/assessments";
import { analyticsRoutes } from "./routes/analytics";
import { dashboardsRoutes } from "./routes/dashboards";
import { emailsRoutes } from "./routes/emails";
import { feedbackRoutes } from "./routes/feedback";
import { authRoutes } from "./routes/auth";
import { authWhitelist } from "./lib/whitelist";
import { auditRoutes } from "./routes/audit";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import { z } from "zod";
import { interviewsRoutes } from "./routes/interviews";
import { recommendationsRoutes } from "./routes/recommendations";

const fastify = Fastify({
  logger: true,
});

fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);

// Register plugins
await fastify.register(envPlugin);
await fastify.register(supabasePlugin);
await fastify.register(errorHandler);
await fastify.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// Register Swagger
await fastify.register(swagger, {
  openapi: {
    openapi: "3.0.0",
    info: {
      title: "Vantage Server API",
      description: "API documentation for Vantage application server",
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
    security: [{ Bearer: [] }],
    components: {
      schemas: {},
      securitySchemes: {
        Bearer: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  transform: jsonSchemaTransform,
});

// Register Swagger UI only in development
if (fastify.config.NODE_ENV !== "production") {
  await fastify.register(swaggerUI, {
    routePrefix: "/documentation",
    uiConfig: {
      deepLinking: false,
    },
    uiHooks: {
      onRequest: function (_request, _reply, next) {
        next();
      },
      preHandler: function (_request, _reply, next) {
        next();
      },
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject) => {
      return swaggerObject;
    },
    transformSpecificationClone: true,
  });
}

// Register CORS
await fastify.register(cors, {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) {
      callback(null, true);
      return;
    }

    // Get allowed origins from environment variable
    const allowedOrigins =
      fastify.config.ALLOWED_ORIGINS?.split(",").map((o) => o.trim()) || [];

    // If no origins configured, allow all (fallback for development)
    if (allowedOrigins.length === 0) {
      callback(null, true);
      return;
    }

    // Check if origin is allowed
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      fastify.log.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error("Not allowed by CORS"), false);
    }
  },
  credentials: true, // Allow cookies/auth headers
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // Explicitly allow all needed HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allow content-type and auth headers
});

// Register rate limiting
fastify.register(import("@fastify/rate-limit"), {
  max: 100, // Allow 100 requests per window
  timeWindow: "1 minute", // 1 minute window
  keyGenerator: (request) => {
    // Use IP address as the key
    return request.ip;
  },
  errorResponseBuilder: (_, context) => {
    return {
      error: "Too Many Requests",
      message: `Rate limit exceeded, retry in ${Math.round(
        context.ttl / 1000
      )} seconds`,
      expiresIn: Math.round(context.ttl / 1000),
    };
  },
});

fastify.addHook("preHandler", async (request, reply) => {
  if (request.url.startsWith("/auth/external/interview-token")) {
    // Individual (public) interview auth endpoint - no auth needed
    // TODO: consolidate better with other whitelist logic.
    return;
  }

  // Skip for auth whitelisted routes
  if (authWhitelist.some((pattern) => request.url.startsWith(pattern))) {
    console.log(
      "Skipping subscription check for whitelisted route:",
      request.url
    );
    return;
  }

  // Skip auth for individual interview creation endpoint (no credentials yet)
  if (
    request.method === "POST" &&
    request.url.startsWith("/interviews/individual")
  ) {
    // This endpoint creates the interviews, so no auth needed
    await authMiddleware(request, reply);
    await subscriptionTierMiddleware(request, reply);
    return;
  }

  // Interview endpoints support both authenticated and individual (public) access
  if (request.url.startsWith("/interviews")) {
    await flexibleAuthMiddleware(request, reply);
    return;
  }

  // All other API routes use standard auth
  if (request.url.startsWith("/")) {
    await authMiddleware(request, reply);
    await subscriptionTierMiddleware(request, reply);
  }
});

// OpenAPI spec endpoints - only available in development
fastify.get("/openapi.json", async (_request, reply) => {
  if (fastify.config.NODE_ENV === "production") {
    reply.code(404).send({ error: "Not found" });
    return;
  }
  return fastify.swagger();
});

fastify.withTypeProvider<ZodTypeProvider>().route({
  method: "GET",
  url: "/health",
  schema: {
    response: {
      200: z.object({
        status: z.string(),
        database: z.string(),
        error: z.string().optional(),
      }),
    },
  },
  handler: async () => {
    try {
      const { error } = await fastify.supabase
        .from("profiles")
        .select("count")
        .limit(1);
      if (error) throw error;
      return { status: "healthy", database: "connected" };
    } catch (error) {
      return {
        status: "unhealthy",
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

// Stricter rate limit for authenticated endpoints
const authRateLimit = {
  config: {
    rateLimit: {
      max: 50, // Lower limit for auth endpoints
      timeWindow: "1 minute",
    },
  },
};

fastify.get(
  "/profile",
  {
    preHandler: authMiddleware,
    ...authRateLimit,
  },
  async (request) => {
    const userId = request.user?.id;

    if (!userId) {
      throw new Error("User ID not found");
    }

    // Get the JWT token from the request header
    const token = request.headers.authorization?.substring(7); // Remove "Bearer "

    if (!token) {
      throw new Error("No JWT token found");
    }

    try {
      // Create Supabase client with user JWT for RLS to work properly
      const supabaseWithAuth = fastify.createSupabaseClient(token);

      const { data, error } = await supabaseWithAuth
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        return {
          profile: null,
          message: "Profile not found. Please create a profile first.",
        };
      }

      return { profile: data };
    } catch (error) {
      throw new Error(
        `Failed to fetch profile: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
);

const apiPrefix = ""; // No prefix. URL will be api.domain.com/endpoint
// Register routes
fastify.register(auditRoutes, {
  prefix: `${apiPrefix}/audit`,
});
fastify.register(authRoutes, {
  prefix: `${apiPrefix}/auth`,
});
fastify.register(programRoutes, {
  prefix: `${apiPrefix}/programs`,
});
fastify.register(companiesRoutes, {
  prefix: `${apiPrefix}/companies`,
});
fastify.register(sharedRoutes, {
  prefix: `${apiPrefix}/shared`,
});
fastify.register(questionnairesRoutes, {
  prefix: `${apiPrefix}/questionnaires`,
});
fastify.register(usersRoutes, {
  prefix: `${apiPrefix}/users`,
});
fastify.register(assessmentsRouter, {
  prefix: `${apiPrefix}/assessments`,
});
fastify.register(analyticsRoutes, {
  prefix: `${apiPrefix}/analytics`,
});
fastify.register(dashboardsRoutes, {
  prefix: `${apiPrefix}/dashboards`,
});
fastify.register(emailsRoutes, {
  prefix: `${apiPrefix}/emails`,
});
fastify.register(feedbackRoutes, {
  prefix: `${apiPrefix}/feedback`,
});
fastify.register(interviewsRoutes, {
  prefix: `${apiPrefix}/interviews`,
});
fastify.register(recommendationsRoutes, {
  prefix: `${apiPrefix}/recommendations`,
});

const start = async () => {
  try {
    await fastify.listen({
      port: fastify.config.PORT,
      host: fastify.config.HOST,
    });
    console.log(
      `Server is running on http://${fastify.config.HOST}:${fastify.config.PORT}`
    );
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
