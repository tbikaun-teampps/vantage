import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "./database";
import { CompaniesService } from "../services/CompaniesService";
import { AssessmentsService } from "../services/AssessmentsService";
import { InterviewsService } from "../services/InterviewsService";

declare module "fastify" {
  interface FastifyRequest {
    user: {
      id: string;
      email?: string;
      role?: string;
    };
    supabaseClient: SupabaseClient<Database>;
    supabaseAdmin?: SupabaseClient<Database>;
    subscriptionTier: "interviewee" | "demo" | "consultant" | "enterprise";
    companiesService?: CompaniesService;
    assessmentsService?: AssessmentsService;
    interviewsService?: InterviewsService;
  }
}
