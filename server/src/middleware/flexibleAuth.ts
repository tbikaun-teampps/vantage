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

  // Verify JWT first to prevent bypass attacks
  let decoded: jwt.JwtPayload & { role?: string };
  try {
    const verified = jwt.verify(token, fastify.config.SUPABASE_JWT_SIGNING_KEY);
    if (typeof verified === "string") {
      return reply.status(401).send({
        success: false,
        error: "Invalid token format",
      });
    }
    decoded = verified as jwt.JwtPayload & { role?: string };
  } catch (error) {
    // If verification fails, token is invalid/expired/tampered
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

  if (!decoded || !decoded.role) {
    return reply.status(401).send({
      success: false,
      error: "Invalid token: missing role claim",
    });
  }

  await authMiddleware(request, reply);
  await subscriptionTierMiddleware(request, reply);
}
