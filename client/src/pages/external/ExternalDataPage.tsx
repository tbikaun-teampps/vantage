import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { AccessCodeForm } from "@/components/public/AccessCodeForm";
import { UnauthorizedPage } from "@/pages/UnauthorizedPage";
import { LoadingSpinner } from "@/components/loader";

export function ExternalDataPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidatingParams, setIsValidatingParams] = useState(false);
  const [paramValidationFailed, setParamValidationFailed] = useState(false);

  const code = searchParams.get('code');
  const email = searchParams.get('email');

  // Validate URL params when both code and email are present
  useEffect(() => {
    const validateUrlParams = async () => {
      if (!id || !code || !email) return;
      
      setIsValidatingParams(true);
      setParamValidationFailed(false);
      
      try {
        // TODO: Replace with actual data portal validation service when implemented
        // await dataPortalService.validateAccess(id, code, email);
        
        // For now, simulate validation with basic checks
        if (!code.trim() || !email.includes('@')) {
          throw new Error('Invalid access credentials');
        }
        
        // Mock validation delay
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error('URL param validation failed:', error);
        setParamValidationFailed(true);
      } finally {
        setIsValidatingParams(false);
      }
    };

    validateUrlParams();
  }, [id, code, email]);

  const handleAccessCodeSubmit = async (accessCode: string, emailAddress: string) => {
    if (!id) {
      console.error("Invalid data portal link");
      return;
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      // TODO: Implement data portal validation service
      // await dataPortalService.validateAccess(id, accessCode, emailAddress);
      
      // Mock validation for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success - add params to URL
      setSearchParams({ 
        code: accessCode, 
        email: emailAddress 
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Invalid access code or email address";
      setValidationError(errorMessage);
    } finally {
      setIsValidating(false);
    }
  };

  if (!id) {
    return (
      <UnauthorizedPage 
        title="Invalid Data Portal Link"
        description="The data portal link appears to be malformed. Please check the URL and try again."
        errorCode="400"
      />
    );
  }

  // Show unauthorized page if URL param validation failed
  if (paramValidationFailed) {
    return (
      <UnauthorizedPage 
        title="Access Denied"
        description="Invalid access credentials. Please check your data portal link and try again."
        errorCode="401"
      />
    );
  }

  // If we have both code and email parameters, validate and show the data interface
  if (code && email) {
    if (isValidatingParams) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <LoadingSpinner 
            message="Validating access..." 
            size="lg" 
            variant="default"
          />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Data Portal</h1>
          <p className="text-muted-foreground">
            Welcome to your data portal. Access code: {code}, Email: {email}
          </p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-center text-muted-foreground">
            Data portal interface will be implemented here.
          </p>
        </div>
      </div>
    );
  }

  // Otherwise, show the access code form
  return (
    <AccessCodeForm
      id={id}
      onSuccess={handleAccessCodeSubmit}
      isLoading={isValidating}
      error={validationError}
      accessType="data"
    />
  );
}
