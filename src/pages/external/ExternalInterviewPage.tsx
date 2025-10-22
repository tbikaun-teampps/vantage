import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { AccessCodeForm } from "@/components/public/AccessCodeForm";
import {InterviewDetailPage} from "@/pages/interview/InterviewDetailPage";
import { authApi } from "@/lib/api/auth";
import { toast } from "sonner";
import { UnauthorizedPage } from "@/pages/UnauthorizedPage";
import { ExternalInterviewLayout } from "@/layouts/ExternalInterviewLayout";
import { usePublicInterviewAuthStore } from "@/stores/public-interview-auth-store";

export function ExternalInterviewPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Use public interview auth store
  const { isAuthenticated, setAuth } = usePublicInterviewAuthStore();

  // Read URL params for pre-filling the form
  const urlCode = searchParams.get("code");
  const urlEmail = searchParams.get("email")?.replace(/ /g, "+");

  const handleAccessCodeSubmit = async (
    accessCode: string,
    emailAddress: string
  ) => {
    if (!id) {
      toast.error("Invalid interview link");
      return;
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      // Call the auth endpoint to get a token
      const { token } = await authApi.getExternalInterviewToken(
        Number(id),
        emailAddress,
        accessCode
      );

      // Store auth in the public interview store
      setAuth(token, id, emailAddress);

      toast.success("Access granted! Loading your interview...");
    } catch (error) {
      const errorMessage =
        (error as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Failed to validate access";

      setValidationError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsValidating(false);
    }
  };

  if (!id) {
    return (
      <UnauthorizedPage
        title="Invalid Interview Link"
        description="The interview link appears to be malformed. Please check the URL and try again."
        errorCode="400"
      />
    );
  }

  // If authenticated (has valid token), show the interview interface
  if (isAuthenticated) {
    return (
      <ExternalInterviewLayout>
        <InterviewDetailPage isPublic={true} />
      </ExternalInterviewLayout>
    );
  }

  // Otherwise, show the access code form
  return (
    <AccessCodeForm
      id={id}
      onSuccess={handleAccessCodeSubmit}
      isLoading={isValidating}
      error={validationError}
      accessType="interview"
      initialEmail={urlEmail || ""}
      initialAccessCode={urlCode || ""}
    />
  );
}
