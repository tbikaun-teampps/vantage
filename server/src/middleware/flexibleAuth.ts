import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import jwt from "jsonwebtoken";
import { authMiddleware } from "./auth";
import { subscriptionTierMiddleware } from "./subscription";

/**
 * Flexible authentication middleware that supports both:
 * 1. Standard Supabase authentication (JWT bearer token)
 * 2. Public (individual) interview authentication (JWT with role: "public_interviewee")
 *
 * Automatically detects which auth method to use based on JWT role claim
 */
export async function flexibleAuthMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return reply.status(401).send({
      success: false,
      error: "Missing or invalid authorization header",
    });
  }

  const token = authHeader.substring(7);

  // Access the Fastify instance to get config
  const fastify = request.server as FastifyInstance;

  // Decode the JWT header to check the algorithm (without verification)
  const tokenParts = token.split(".");
  if (tokenParts.length !== 3) {
    return reply.status(401).send({
      success: false,
      error: "Invalid token format",
    });
  }

  let tokenHeader: { alg?: string };
  try {
    tokenHeader = JSON.parse(Buffer.from(tokenParts[0], "base64url").toString());
  } catch {
    return reply.status(401).send({
      success: false,
      error: "Invalid token format",
    });
  }

  // For HS256 tokens (public interview tokens), verify locally with our signing key
  // For other algorithms (ES256, etc. - standard Supabase tokens), let authMiddleware handle via getUser()
  if (tokenHeader.alg === "HS256") {
    // This is likely a public interview token - verify with our signing key
    let decoded: jwt.JwtPayload & { role?: string };
    try {
      const verified = jwt.verify(token, fastify.config.SUPABASE_JWT_SIGNING_KEY, {
        algorithms: ["HS256"],
      });
      if (typeof verified === "string") {
        return reply.status(401).send({
          success: false,
          error: "Invalid token format",
        });
      }
      decoded = verified as jwt.JwtPayload & { role?: string };

      // For public interview tokens, check for the specific role
      if (decoded.role === "public_interviewee") {
        // Public interview access - set up request context for interview access
        request.user = {
          id: decoded.sub || "",
          email: decoded.email as string | undefined,
          role: decoded.role,
        };
        // Create a Supabase client with the token for RLS
        request.supabaseClient = fastify.createSupabaseClient(token);
        return; // Skip standard auth middleware for public interview tokens
      }
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return reply.status(401).send({
          success: false,
          error: "Token expired",
        });
      }
      return reply.status(401).send({
        success: false,
        error: "Invalid token",
      });
    }
  }

  // For standard Supabase tokens (ES256 or other), use the standard auth flow
  // which validates via Supabase's getUser() API
  await authMiddleware(request, reply);
  await subscriptionTierMiddleware(request, reply);
}
