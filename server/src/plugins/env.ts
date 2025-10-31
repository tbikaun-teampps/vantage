import fp from "fastify-plugin";
import env from "@fastify/env";

const envSchema = {
  type: "object",
  required: [
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "RESEND_API_KEY",
    "ANTHROPIC_API_KEY",
    "SITE_URL",
    "VANTAGE_PUBLIC_ASSETS_BUCKET_URL",
  ],
  properties: {
    SUPABASE_URL: {
      type: "string",
      description: "Supabase project URL",
    },
    SUPABASE_ANON_KEY: {
      type: "string",
      description: "Supabase anonymous/public key",
    },
    SUPABASE_SERVICE_ROLE_KEY: {
      type: "string",
      description: "Supabase service role key for server-side operations",
    },
    SUPABASE_JWT_SIGNING_KEY: {
      type: "string",
      description: "Supabase JWT signing key for custom tokens",
    },
    RESEND_API_KEY: {
      type: "string",
      description: "Resend API key for sending emails",
    },
    ANTHROPIC_API_KEY: {
      type: "string",
      description: "Anthropic API key for LLM-powered features",
    },
    SITE_URL: {
      type: "string",
      description: "Base URL of the site for generating links",
    },
    VANTAGE_PUBLIC_ASSETS_BUCKET_URL: {
      type: "string",
      description: "URL for the full Vantage logo (used in email footers)",
    },
    DEV_TEST_EMAIL: {
      type: "string",
      description:
        "Test email address for development mode (overrides recipient emails)",
    },
    ALLOWED_ORIGINS: {
      type: "string",
      description:
        "Comma-separated list of allowed CORS origins (e.g., http://localhost:5173,https://domain.com)",
    },
    NODE_ENV: {
      type: "string",
      default: "development",
    },
    PORT: {
      type: "number",
      default: 3000,
    },
    HOST: {
      type: "string",
      default: "0.0.0.0",
    },
  },
};

declare module "fastify" {
  interface FastifyInstance {
    config: {
      SUPABASE_URL: string;
      SUPABASE_ANON_KEY: string;
      SUPABASE_SERVICE_ROLE_KEY: string;
      SUPABASE_JWT_SIGNING_KEY: string;
      RESEND_API_KEY: string;
      ANTHROPIC_API_KEY: string;
      SITE_URL: string;
      VANTAGE_PUBLIC_ASSETS_BUCKET_URL: string;
      DEV_TEST_EMAIL?: string;
      ALLOWED_ORIGINS?: string;
      NODE_ENV: string;
      PORT: number;
      HOST: string;
    };
  }
}

export default fp(async function (fastify) {
  const nodeEnv = process.env.NODE_ENV || "development";

  // Only load .env files in development
  // In production/staging on Render, env vars are already in process.env
  if (nodeEnv === "development") {
    console.log(
      `Loading environment variables from .env.local for development`
    );
    await fastify.register(env, {
      confKey: "config",
      schema: envSchema,
      dotenv: {
        path: ".env.local",
      },
    });
  } else {
    // In production/staging, just validate existing env vars
    console.log(
      `Using environment variables from Render (NODE_ENV=${nodeEnv})`
    );
    await fastify.register(env, {
      confKey: "config",
      schema: envSchema,
      dotenv: false, // Don't load any .env file
    });
  }
});
