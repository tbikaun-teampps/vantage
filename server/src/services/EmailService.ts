import { SupabaseClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { TemplateService } from "./TemplateService.js";
import { Database } from "../types/database.js";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from "../plugins/errorHandler.js";

// Types for email service
export interface CompanyBranding {
  primary: string | null;
  secondary: string | null;
  accent: string | null;
}

// Type guard to safely check if Json is CompanyBranding
function isCompanyBranding(value: unknown): value is CompanyBranding {
  if (!value || typeof value !== "object") {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return (
    "primary" in obj &&
    (typeof obj.primary === "string" || obj.primary === null) &&
    "secondary" in obj &&
    (typeof obj.secondary === "string" || obj.secondary === null) &&
    "accent" in obj &&
    (typeof obj.accent === "string" || obj.accent === null)
  );
}

// Helper function to safely extract CompanyBranding from Json
export function extractCompanyBranding(
  branding: unknown
): CompanyBranding | undefined {
  return isCompanyBranding(branding) ? branding : undefined;
}

export interface InterviewInvitationData {
  interviewee_email: string;
  interviewee_name?: string;
  interview_name: string;
  assessment_name: string;
  access_code: string;
  interview_id: number;
  interviewer_name?: string;
  sender_name?: string;
  sender_email: string;
  company_name?: string;
  company_icon_url?: string;
  company_branding?: CompanyBranding;
}

export interface InviteTeamMemberData {
  email: string;
  name?: string;
  role?: string;
  company_name?: string;
  invite_link?: string;
  company_icon_url?: string;
  company_branding?: CompanyBranding;
}

export interface InterviewSummaryData {
  interviewee_email: string;
  interviewee_name?: string;
  interview_name: string;
  assessment_name: string;
  company_name?: string;
  company_icon_url?: string;
  company_branding?: CompanyBranding;
  responses: Array<{
    section_title: string;
    steps: Array<{
      step_title: string;
      questions: Array<{
        question_title: string;
        question_text: string;
        answer: {
          rating_score?: string; // Should be string to accommodate formats like "4/5"
          // uploaded_evidence?: string[]; // Future feature
          comments?: string;
        };
      }>;
    }>;
  }>;
}

export interface TestEmailData {
  to: string;
  message?: string;
}

export interface RoleChangeNotificationData {
  email: string;
  name?: string;
  old_role: string;
  new_role: string;
  company_name?: string;
  changed_by_name?: string;
  company_icon_url?: string;
  company_branding?: CompanyBranding;
}

export interface InterviewReminderData {
  interviewee_email: string;
  interviewee_name?: string;
  interview_name: string;
  assessment_name: string;
  access_code: string;
  interview_id: number;
  sender_name?: string;
  sender_email?: string;
  company_name?: string;
  due_at?: string;
  company_icon_url?: string;
  company_branding?: CompanyBranding;
}

export interface EmailResponse {
  success: boolean;
  message: string;
  messageId?: string;
}

export class EmailService {
  private resend: Resend;
  private siteUrl: string;
  private templateService: TemplateService;
  private supabase?: SupabaseClient<Database>;
  private publicAssetsBucketUrl: string;
  private vantageLogoFullUrl: string;
  private vantageLogoIconUrl: string;

  constructor(
    apiKey: string,
    siteUrl: string,
    publicAssetsBucketUrl: string,
    supabase?: SupabaseClient<Database>
  ) {
    this.resend = new Resend(apiKey);
    this.siteUrl = siteUrl;
    this.publicAssetsBucketUrl = publicAssetsBucketUrl;
    this.templateService = new TemplateService();
    this.supabase = supabase;

    // Construct logo URLs
    this.vantageLogoFullUrl = `${this.publicAssetsBucketUrl}/vantage-logo-full.png`;
    this.vantageLogoIconUrl = `${this.publicAssetsBucketUrl}/vantage-logo.svg`;
  }

  async sendInterviewInvitation(
    userId: string,
    interviewId: number
  ): Promise<EmailResponse> {
    if (!this.supabase) {
      console.error("Supabase client not initialized");
      throw new InternalServerError("Failed to send email");
    }
    // Fetch interview
    const { data: interview, error: interviewError } = await this.supabase
      .from("interviews")
      .select(`*, assessments(name), companies(name, icon_url, branding)`)
      .eq("id", interviewId)
      .maybeSingle();

    // console.log("interview data: ", interview);

    if (interviewError || !interview) {
      console.error("Failed to fetch interview:", interviewError);
      return {
        success: false,
        message: "Failed to fetch interview details",
      };
    }

    // Validate interview has required contact ID
    if (!interview.interview_contact_id) {
      console.error("Interview has no assigned contact");
      throw new BadRequestError("Interview has no assigned contact");
    }

    // Get contact assigned to the interview
    const { data: contact, error: contactError } = await this.supabase
      .from("contacts")
      .select()
      .eq("id", interview.interview_contact_id)
      .single();

    if (contactError || !contact) {
      console.error("Failed to fetch contact:", contactError);
      return {
        success: false,
        message: "Failed to fetch interviewee contact details",
      };
    }

    // Generate the public interview URL
    const interviewUrl = `${this.siteUrl}/external/interview/${
      interview.id
    }?code=${interview.access_code}&email=${encodeURIComponent(contact.email)}`;

    // Fetch sender information
    const { data: profile, error: profileError } = await this.supabase
      .from("profiles")
      .select()
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Failed to fetch sender profile:", profileError);
      return {
        success: false,
        message: "Failed to fetch sender profile",
      };
    }

    const company_branding = extractCompanyBranding(
      interview.companies.branding
    );

    // console.log("Sending interview invitation with data:", data);

    // Prepare template data
    const templateData = {
      interviewee_name: contact.email,
      interview_name: contact.full_name || contact.email.split("@")[0],
      assessment_name: interview.assessments!.name,
      access_code: interview.access_code!,
      sender_name: profile.full_name || profile.email.split("@")[0],
      sender_email: profile.email,
      company_name: interview.companies.name,
      interview_url: interviewUrl,
      title: "Interview Invitation",
      company_icon_url: interview.companies.icon_url || undefined,
      company_branding: company_branding,
      button_color: company_branding?.primary || "#10b981",
      gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      vantage_logo_full_url: this.vantageLogoFullUrl,
      vantage_logo_icon_url: this.vantageLogoIconUrl,
    };

    // Render email content using templates
    // Note: Resend automatically generates plain text version from HTML
    const htmlContent = this.templateService.renderEmail(
      "interview-invitation",
      templateData
    );

    try {
      const emailResult = await this.resend.emails.send({
        from: `${interview.companies.name} via Vantage <vantage@mail.teampps.com.au>`,
        to: [contact.email],
        subject: `Interview Invitation from ${interview.companies.name}: ${interview.assessments!.name}`,
        html: htmlContent,
      });

      if (emailResult.error) {
        console.error("Resend error:", emailResult.error);
        return {
          success: false,
          message: `Failed to send email: ${emailResult.error.message}`,
        };
      }

      return {
        success: true,
        message: "Interview invitation sent successfully",
        messageId: emailResult.data?.id,
      };
    } catch (error) {
      console.error("Email sending error:", error);
      return {
        success: false,
        message: `Failed to send email: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  async sendInterviewReminder(
    interviewId: number,
    userId: string
  ): Promise<EmailResponse> {
    if (!this.supabase) {
      console.error("Supabase client not initialized");
      throw new InternalServerError("Failed to send email");
    }
    // Fetch interview details (same as invitation endpoint)
    const { data: interview, error: interviewError } = await this.supabase
      .from("interviews")
      .select(`*, assessments(name), companies(name, icon_url, branding)`)
      .eq("id", interviewId)
      .maybeSingle();

    if (interviewError || !interview) {
      throw new NotFoundError("Interview not found");
    }

    // Validate interview has required contact ID
    if (!interview.interview_contact_id) {
      throw new BadRequestError("Interview has no assigned contact");
    }

    // Get contact assigned to the interview
    const { data: contact, error: contactError } = await this.supabase
      .from("contacts")
      .select()
      .eq("id", interview.interview_contact_id)
      .single();

    if (contactError || !contact) {
      throw new NotFoundError("Interviewee contact details not found");
    }

    // Fetch sender information
    const { data: profile, error: profileError } = await this.supabase
      .from("profiles")
      .select()
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      throw new NotFoundError("Sender profile not found");
    }

    // Validate interview has required assessment and company data
    if (!interview.assessments || !interview.companies) {
      throw new BadRequestError(
        "Interview missing required assessment or company data"
      );
    }

    // Validate required fields
    if (!contact.email) {
      return {
        success: false,
        message: "Missing required 'interviewee_email' field",
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contact.email)) {
      return {
        success: false,
        message: "Invalid email address format",
      };
    }

    // Generate the public interview URL
    const interviewUrl = `${this.siteUrl}/external/interview/${
      interview.id
    }?code=${interview.access_code}&email=${encodeURIComponent(contact.email)}`;

    // Extract company branding safely
    const companyBranding = extractCompanyBranding(
      interview.companies.branding
    );

    // Prepare template data
    const templateData = {
      interviewee_name: contact.email,
      interview_name: interview.name,
      assessment_name: interview.assessments.name,
      access_code: interview.access_code,
      sender_name: profile.full_name || profile.email.split("@")[0],
      sender_email: profile.email,
      company_name: interview.companies.name,
      due_at: interview.due_at,
      interview_url: interviewUrl,
      title: "Interview Reminder",
      company_icon_url: interview.companies.icon_url,
      company_branding: companyBranding,
      button_color: companyBranding?.primary || "#f59e0b",
      gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      vantage_logo_full_url: this.vantageLogoFullUrl,
      vantage_logo_icon_url: this.vantageLogoIconUrl,
    };

    // Render email content using templates
    const htmlContent = this.templateService.renderEmail(
      "interview-reminder",
      templateData
    );

    try {
      const emailResult = await this.resend.emails.send({
        from: `${interview.companies.name} via Vantage <vantage@mail.teampps.com.au>`,
        to: [contact.email],
        subject: `Reminder: Complete Your Interview - ${interview.name}`,
        html: htmlContent,
      });

      if (emailResult.error) {
        console.error("Resend error:", emailResult.error);
        return {
          success: false,
          message: `Failed to send reminder: ${emailResult.error.message}`,
        };
      }

      return {
        success: true,
        message: "Interview reminder sent successfully",
        messageId: emailResult.data?.id,
      };
    } catch (error) {
      console.error("Interview reminder sending error:", error);
      return {
        success: false,
        message: `Failed to send reminder: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  async sendTeamMemberInvite(
    data: InviteTeamMemberData
  ): Promise<EmailResponse> {
    // Validate required fields
    if (!data.email) {
      return {
        success: false,
        message: "Missing required 'email' field for team member invite",
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return {
        success: false,
        message: "Invalid email address format",
      };
    }

    const memberName = data.name || data.email.split("@")[0];
    const companyName = data.company_name || "the team";

    // Prepare template data
    const templateData = {
      member_name: memberName,
      company_name: companyName,
      role: data.role,
      invite_link: data.invite_link,
      title: "Team Invitation",
      company_icon_url: data.company_icon_url,
      company_branding: data.company_branding,
      button_color: data.company_branding?.primary || "#10b981",
      gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      vantage_logo_full_url: this.vantageLogoFullUrl,
      vantage_logo_icon_url: this.vantageLogoIconUrl,
    };

    try {
      const htmlContent = this.templateService.renderEmail(
        "team-member-invite",
        templateData
      );

      const emailResult = await this.resend.emails.send({
        from: `${companyName} via Vantage <vantage@mail.teampps.com.au>`,
        to: [data.email],
        subject: `You've been added to ${companyName}`,
        html: htmlContent,
      });

      if (emailResult.error) {
        console.error("Resend error:", emailResult.error);
        return {
          success: false,
          message: `Failed to send team invite: ${emailResult.error.message}`,
        };
      }

      return {
        success: true,
        message: "Team member invitation sent successfully",
        messageId: emailResult.data?.id,
      };
    } catch (error) {
      console.error("Team invite email sending error:", error);
      return {
        success: false,
        message: `Failed to send team invite: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  async sendRoleChangeNotification(
    data: RoleChangeNotificationData
  ): Promise<EmailResponse> {
    // Validate required fields
    if (!data.email) {
      return {
        success: false,
        message: "Missing required 'email' field for role change notification",
      };
    }

    if (!data.old_role || !data.new_role) {
      return {
        success: false,
        message: "Missing required 'old_role' or 'new_role' fields",
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return {
        success: false,
        message: "Invalid email address format",
      };
    }

    const memberName = data.name || data.email.split("@")[0];
    const companyName = data.company_name || "the team";

    // Prepare template data
    const templateData = {
      member_name: memberName,
      old_role: data.old_role,
      new_role: data.new_role,
      company_name: companyName,
      changed_by_name: data.changed_by_name,
      title: "Role Update",
      company_icon_url: data.company_icon_url,
      company_branding: data.company_branding,
      button_color: data.company_branding?.primary || "#3b82f6",
      gradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
      vantage_logo_full_url: this.vantageLogoFullUrl,
      vantage_logo_icon_url: this.vantageLogoIconUrl,
    };

    try {
      const htmlContent = this.templateService.renderEmail(
        "role-change-notification",
        templateData
      );

      const emailResult = await this.resend.emails.send({
        from: `${companyName} via Vantage <vantage@mail.teampps.com.au>`,
        to: [data.email],
        subject: `Your role has been updated in ${companyName}`,
        html: htmlContent,
      });

      if (emailResult.error) {
        console.error("Resend error:", emailResult.error);
        return {
          success: false,
          message: `Failed to send role change notification: ${emailResult.error.message}`,
        };
      }

      return {
        success: true,
        message: "Role change notification sent successfully",
        messageId: emailResult.data?.id,
      };
    } catch (error) {
      console.error("Role change notification email sending error:", error);
      return {
        success: false,
        message: `Failed to send role change notification: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  /**
   * Method for sending an interviewee a digest/summary of their interview responses
   * Fetches all required data and sends the summary email
   */
  async sendInterviewSummary(interviewId: number): Promise<EmailResponse> {
    if (!this.supabase) {
      console.error("Supabase client not initialized");
      throw new InternalServerError("Failed to send email");
    }

    // Fetch interview data with related entities
    const { data: interview, error: interviewError } = await this.supabase
      .from("interviews")
      .select(
        `id,
        name,
        status,
        company_id,
        questionnaire_id,
        interviewee:profiles!interviewee_id(full_name, email),
        assessment:assessment_id(name),
        company:company_id(name, icon_url, branding)
        `
      )
      .eq("id", interviewId)
      .maybeSingle();

    if (interviewError || !interview) {
      console.error(
        `Failed to fetch interview ${interviewId}:`,
        interviewError
      );
      return {
        success: false,
        message: "Failed to fetch interview details",
      };
    }

    // Validate required fields
    if (!interview.questionnaire_id) {
      return {
        success: false,
        message: "Interview does not have an associated questionnaire",
      };
    }

    if (!interview.interviewee || !interview.interviewee.email) {
      return {
        success: false,
        message: "Interviewee does not have an email address",
      };
    }

    if (!interview.assessment || !interview.assessment.name) {
      return {
        success: false,
        message: "Interview does not have an associated assessment",
      };
    }

    if (!interview.company) {
      return {
        success: false,
        message: "Interview does not have an associated company",
      };
    }

    // Fetch interview responses
    const { data: responses, error: responsesError } = await this.supabase
      .from("interview_responses")
      .select("questionnaire_question_id, rating_score, comments, is_unknown")
      .eq("interview_id", interviewId)
      .eq("is_deleted", false);

    if (responsesError) {
      console.error(
        `Failed to fetch responses for interview ${interviewId}:`,
        responsesError
      );
      return {
        success: false,
        message: "Failed to fetch interview responses",
      };
    }

    // Fetch questionnaire structure
    const { data: questions, error: questionsError } = await this.supabase
      .from("questionnaire_questions")
      .select("id, questionnaire_step_id, title, question_text")
      .eq("questionnaire_id", interview.questionnaire_id)
      .eq("is_deleted", false);

    if (questionsError) {
      console.error(
        `Failed to fetch questions for interview ${interviewId}:`,
        questionsError
      );
      return {
        success: false,
        message: "Failed to fetch questionnaire questions",
      };
    }

    // Get questionnaire rating scale to get max value
    const { data: ratingScales, error: ratingScalesError } = await this.supabase
      .from("questionnaire_rating_scales")
      .select("value")
      .eq("questionnaire_id", interview.questionnaire_id);

    if (ratingScalesError) {
      console.error(
        `Failed to fetch rating scales for interview ${interviewId}:`,
        ratingScalesError
      );
      return {
        success: false,
        message: "Failed to fetch questionnaire rating scales",
      };
    }

    // Fetch questionnaire sections
    const { data: sections, error: sectionsError } = await this.supabase
      .from("questionnaire_sections")
      .select("id, title")
      .eq("questionnaire_id", interview.questionnaire_id)
      .eq("is_deleted", false)
      .order("order_index", { ascending: true });

    if (sectionsError) {
      console.error(
        `Failed to fetch sections for interview ${interviewId}:`,
        sectionsError
      );
      return {
        success: false,
        message: "Failed to fetch questionnaire sections",
      };
    }

    // Fetch questionnaire steps
    const { data: steps, error: stepsError } = await this.supabase
      .from("questionnaire_steps")
      .select("id, questionnaire_section_id, title")
      .eq("questionnaire_id", interview.questionnaire_id)
      .eq("is_deleted", false)
      .order("order_index", { ascending: true });

    if (stepsError) {
      console.error(
        `Failed to fetch steps for interview ${interviewId}:`,
        stepsError
      );
      return {
        success: false,
        message: "Failed to fetch questionnaire steps",
      };
    }

    // Calculate max rating value from rating scales
    const maxRatingValue =
      ratingScales && ratingScales.length > 0
        ? Math.max(...ratingScales.map((scale) => scale.value))
        : 5; // Default to 5 if no rating scales exist

    // Build hierarchical response structure
    // Group responses by question_id for quick lookup
    const responsesByQuestionId = new Map(
      responses?.map((response) => [
        response.questionnaire_question_id,
        response,
      ]) || []
    );

    // Group questions by step_id
    const questionsByStepId = new Map<number, typeof questions>();
    questions?.forEach((question) => {
      const stepId = question.questionnaire_step_id;
      if (!questionsByStepId.has(stepId)) {
        questionsByStepId.set(stepId, []);
      }
      questionsByStepId.get(stepId)!.push(question);
    });

    // Group steps by section_id
    const stepsBySectionId = new Map<number, typeof steps>();
    steps?.forEach((step) => {
      const sectionId = step.questionnaire_section_id;
      if (!stepsBySectionId.has(sectionId)) {
        stepsBySectionId.set(sectionId, []);
      }
      stepsBySectionId.get(sectionId)!.push(step);
    });

    // Build the hierarchical structure with sequential enumeration
    const formattedResponses =
      sections?.map((section, sectionIndex) => {
        const sectionNum = sectionIndex + 1;
        const sectionSteps = stepsBySectionId.get(section.id) || [];

        return {
          section_title: `${sectionNum}. ${section.title}`,
          steps: sectionSteps.map((step, stepIndex) => {
            const stepNum = stepIndex + 1;
            const stepQuestions = questionsByStepId.get(step.id) || [];

            return {
              step_title: `${sectionNum}.${stepNum}. ${step.title}`,
              questions: stepQuestions.map((question, questionIndex) => {
                const questionNum = questionIndex + 1;
                const response = responsesByQuestionId.get(question.id);

                return {
                  question_title: `${sectionNum}.${stepNum}.${questionNum}. ${question.title}`,
                  question_text: question.question_text,
                  answer: {
                    rating_score: response?.rating_score
                      ? `${response.rating_score}/${maxRatingValue}`
                      : undefined,
                    is_unknown: response?.is_unknown || undefined,
                    comments: response?.comments || undefined,
                  },
                };
              }),
            };
          }),
        };
      }) || [];

    // Prepare email data
    const intervieweeName =
      interview.interviewee.full_name ||
      interview.interviewee.email.split("@")[0];
    const companyName = interview.company.name;
    const companyBranding = extractCompanyBranding(interview.company.branding);
    const isCompleted = interview.status === "completed";

    const templateData = {
      interviewee_name: intervieweeName,
      interview_name: interview.name,
      assessment_name: interview.assessment.name,
      company_name: companyName,
      responses: formattedResponses,
      title: "Interview Summary",
      subtitle: isCompleted
        ? "Thank you for completing your interview"
        : "Your current interview progress",
      is_completed: isCompleted,
      company_icon_url: interview.company.icon_url || undefined,
      company_branding: companyBranding || undefined,
      button_color: companyBranding?.primary || "#8b5cf6",
      gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
      vantage_logo_full_url: this.vantageLogoFullUrl,
      vantage_logo_icon_url: this.vantageLogoIconUrl,
    };

    try {
      const htmlContent = this.templateService.renderEmail(
        "interview-summary",
        templateData
      );

      const emailPayload = {
        from: `${companyName} via Vantage <vantage@mail.teampps.com.au>`,
        to: [interview.interviewee.email],
        subject: `Your interview summary from ${companyName}`,
        html: htmlContent,
      };

      const emailResult = await this.resend.emails.send(emailPayload);

      if (emailResult.error) {
        console.error("Resend error:", emailResult.error);
        return {
          success: false,
          message: `Failed to send interview summary email: ${emailResult.error.message}`,
        };
      }

      return {
        success: true,
        message: "Interview summary email sent successfully",
        messageId: emailResult.data?.id,
      };
    } catch (error) {
      console.error("Interview summary email sending error:", error);
      return {
        success: false,
        message: `Failed to send interview summary email: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  async sendTestEmail(data: TestEmailData): Promise<EmailResponse> {
    // Validate required fields
    if (!data.to) {
      return {
        success: false,
        message: "Missing required 'to' field for test email",
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.to)) {
      return {
        success: false,
        message: "Invalid email address format",
      };
    }

    const customMessage =
      data.message || "This is a test email from your Vantage email service.";
    const timestamp = new Date().toISOString();

    // Prepare template data
    const templateData = {
      to: data.to,
      message: customMessage,
      timestamp: timestamp,
      title: "Test Email",
      vantage_logo_full_url: this.vantageLogoFullUrl,
      vantage_logo_icon_url: this.vantageLogoIconUrl,
    };

    try {
      const htmlContent = this.templateService.renderEmail(
        "test-email",
        templateData
      );

      const emailResult = await this.resend.emails.send({
        from: "Vantage <noreply@mail.teampps.com.au>",
        to: [data.to],
        subject: "Test Email from Vantage",
        html: htmlContent,
      });

      if (emailResult.error) {
        console.error("Resend error:", emailResult.error);
        return {
          success: false,
          message: `Failed to send test email: ${emailResult.error.message}`,
        };
      }

      return {
        success: true,
        message: "Test email sent successfully",
        messageId: emailResult.data?.id,
      };
    } catch (error) {
      console.error("Test email sending error:", error);
      return {
        success: false,
        message: `Failed to send test email: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }
}
