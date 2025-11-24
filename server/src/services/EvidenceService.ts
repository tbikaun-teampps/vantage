import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";
import type { MultipartFile } from "@fastify/multipart";
import {
  CreateInterviewEvidenceBody,
  InterviewEvidence,
} from "../types/entities/interviews";

export class EvidenceService {
  private supabase: SupabaseClient<Database>;
  private userId: string | null;

  // Allowed file types and their MIME types
  private allowedFileTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  private allowedExtensions = [
    ".pdf",
    ".doc",
    ".docx",
    ".jpg",
    ".jpeg",
    ".png",
    ".csv",
    ".xls",
    ".xlsx",
  ];

  // Max file size: 10MB
  private maxFileSize = 10 * 1024 * 1024;

  constructor(supabaseClient: SupabaseClient<Database>, userId: string | null) {
    this.supabase = supabaseClient;
    this.userId = userId;
  }

  /**
   * Get evidence bucket name from environment
   */
  private get bucketName(): string {
    const bucketName = process.env.VITE_SUPABASE_EVIDENCE_BUCKET;
    if (!bucketName) {
      console.warn(
        'VITE_SUPABASE_EVIDENCE_BUCKET not configured, falling back to "evidence"'
      );
      return "evidence";
    }
    return bucketName;
  }

  /**
   * Validate file before upload
   */
  private validateFile(
    filename: string,
    mimetype: string,
    fileSize: number
  ): { isValid: boolean; error?: string } {
    // Check file size
    if (fileSize > this.maxFileSize) {
      return {
        isValid: false,
        error: `File size must be less than 10MB. Current size: ${(fileSize / 1024 / 1024).toFixed(2)}MB`,
      };
    }

    // Check file type by extension (more reliable than MIME type)
    const fileExtension = "." + filename.split(".").pop()?.toLowerCase();
    if (!this.allowedExtensions.includes(fileExtension)) {
      return {
        isValid: false,
        error: `File type not supported. Allowed types: ${this.allowedExtensions.join(", ")}`,
      };
    }

    // Also check MIME type if available
    if (mimetype && !this.allowedFileTypes.includes(mimetype)) {
      return {
        isValid: false,
        error: `File type not supported. Please use: PDF, DOC, DOCX, JPG, PNG, CSV, XLSX`,
      };
    }

    return { isValid: true };
  }

  /**
   * Generate unique file path for storage
   */
  private generateFilePath(responseId: number, fileName: string): string {
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    return `evidence/${responseId}/${timestamp}-${sanitizedFileName}`;
  }

  /**
   * Upload a single evidence file for an interview response
   */
  async uploadEvidence(responseId: number, file: MultipartFile) {
    // : Promise<EvidenceUploadResult>
    // Validate file
    const fileBuffer = await file.toBuffer();
    const validation = this.validateFile(
      file.filename,
      file.mimetype,
      fileBuffer.length
    );

    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    try {
      // Generate unique file path
      const filePath = this.generateFilePath(responseId, file.filename);

      // Upload to storage
      const { error: uploadError } = await this.supabase.storage
        .from(this.bucketName)
        .upload(filePath, fileBuffer, {
          contentType: file.mimetype,
          upsert: false, // Don't overwrite existing files
        });

      if (uploadError) {
        throw new Error(`Failed to upload file: ${uploadError.message}`);
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = this.supabase.storage.from(this.bucketName).getPublicUrl(filePath);

      // Get interview_id and company_id from the response
      const { data: response, error: responseError } = await this.supabase
        .from("interview_responses")
        .select("interview_id, company_id")
        .eq("id", responseId)
        .single();

      if (responseError) throw responseError;
      if (!response) throw new Error("Interview response not found");

      // Create database record
      const evidenceData = {
        interview_response_id: responseId,
        interview_id: response.interview_id,
        company_id: response.company_id,
        file_name: file.filename,
        file_path: filePath,
        file_size: fileBuffer.length,
        file_type: file.mimetype || "application/octet-stream",
        uploaded_by: this.userId,
      } as CreateInterviewEvidenceBody;

      const { data: evidence, error: dbError } = await this.supabase
        .from("interview_evidence")
        .insert(evidenceData)
        .select("id, created_at, uploaded_at, file_name, file_size, file_type")
        .single();

      if (dbError) {
        // Clean up uploaded file if database insert fails
        await this.supabase.storage.from(this.bucketName).remove([filePath]);
        throw new Error(`Failed to save evidence record: ${dbError.message}`);
      }

      return {
        evidence,
        publicUrl,
      };
    } catch (error) {
      console.error("Error uploading evidence:", error);
      throw error;
    }
  }

  /**
   * Get all evidence files for an interview response
   */
  async getEvidenceForResponse(
    responseId: number
  ): Promise<
    Omit<
      InterviewEvidence,
      "company_id" | "deleted_at" | "is_deleted" | "file_path"
    >[]
  > {
    try {
      const { data: evidence, error } = await this.supabase
        .from("interview_evidence")
        .select(
          "id, created_at, file_name, file_size, file_type, interview_id, interview_response_id, uploaded_at, uploaded_by"
        )
        .eq("interview_response_id", responseId)
        .eq("is_deleted", false)
        .order("uploaded_at", { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch evidence: ${error.message}`);
      }

      return evidence || [];
    } catch (error) {
      console.error("Error fetching evidence for response:", error);
      throw error;
    }
  }

  /**
   * Delete an evidence file (both from storage and database)
   */
  async deleteEvidence(evidenceId: number): Promise<void> {
    try {
      // First get the evidence record to get file path and company_id for security filtering
      const { data: evidence, error: fetchError } = await this.supabase
        .from("interview_evidence")
        .select("file_path, company_id")
        .eq("id", evidenceId)
        .single();

      if (fetchError) {
        throw new Error(
          `Failed to find evidence record: ${fetchError.message}`
        );
      }

      if (!evidence) {
        throw new Error("Evidence record not found");
      }

      // Delete from storage
      const { error: storageError } = await this.supabase.storage
        .from(this.bucketName)
        .remove([evidence.file_path]);

      if (storageError) {
        console.warn(
          "Failed to delete file from storage:",
          storageError.message
        );
        // Continue with database deletion even if storage deletion fails
      }

      // Delete database record with company_id security filtering
      const { error: dbError } = await this.supabase
        .from("interview_evidence")
        .delete()
        .eq("id", evidenceId)
        .eq("company_id", evidence.company_id);

      if (dbError) {
        throw new Error(`Failed to delete evidence record: ${dbError.message}`);
      }
    } catch (error) {
      console.error("Error deleting evidence:", error);
      throw error;
    }
  }

  /**
   * Get public URL for an evidence file
   */
  getPublicUrl(filePath: string): string {
    const {
      data: { publicUrl },
    } = this.supabase.storage.from(this.bucketName).getPublicUrl(filePath);

    return publicUrl;
  }
}
