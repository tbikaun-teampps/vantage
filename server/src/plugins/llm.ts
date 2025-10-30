import fp from "fastify-plugin";
import { LLMService } from "../services/LLMService";

declare module "fastify" {
  interface FastifyInstance {
    llmService: LLMService;
  }
}

export default fp(async function (fastify) {
  const llmService = new LLMService(fastify.config.ANTHROPIC_API_KEY);
  fastify.decorate("llmService", llmService);
});
