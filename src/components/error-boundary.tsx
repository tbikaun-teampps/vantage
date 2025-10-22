import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home, Bug, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useFeedbackActions } from "@/hooks/useFeedback";
import { toast } from "sonner";
import { useCompanyFromUrl } from "@/hooks/useCompanyFromUrl";
import { useProfile } from "@/hooks/useProfile";
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  resetError: () => void;
}

const PublicErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  resetError,
}) => {
  const [showDetails, setShowDetails] = React.useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = React.useState(false);
  const navigate = useNavigate();
  const { submitFeedback } = useFeedbackActions();

  const handleReportError = async () => {
    setIsSubmittingReport(true);

    // Create detailed error message for the feedback
    const errorDetails = `
**Automatic Error Report (Public Interview)**

**Error Message:** ${error?.message || "Unknown error"}

**Timestamp:** ${new Date().toISOString()}

**User Agent:** ${navigator.userAgent}

**Current URL:** ${window.location.href}

**Error Stack:**
\`\`\`
${error?.stack || "No stack trace available"}
\`\`\`

**Component Stack:**
\`\`\`
${errorInfo?.componentStack || "No component stack available"}
\`\`\`

This error report was automatically generated from the public interview error boundary.
    `.trim();

    try {
      await submitFeedback({
        message: errorDetails,
        type: "bug",
        page_url: window.location.href,
      });

      toast.success("Error report submitted successfully. Thank you!");
    } catch (submitError) {
      console.error("Failed to submit error report:", submitError);
      try {
        // Fallback to clipboard copy if submission fails
        await navigator.clipboard.writeText(errorDetails);
        toast.warning(
          "Report submission failed, but error details copied to clipboard"
        );
      } catch (clipboardError) {
        console.error("Failed to copy to clipboard:", clipboardError);
        toast.error("Failed to submit error report");
      }
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleGoBack = () => {
    try {
      navigate(-1);
    } catch (navError) {
      console.error("Failed to navigate back:", navError);
      toast.error("Unable to go back");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-16 w-16 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Something went wrong</CardTitle>
          <CardDescription>
            We&apos;re sorry, but something unexpected happened. Please try
            going back or returning to the home page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button
              onClick={handleGoBack}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
            <Button onClick={resetError} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            <Button variant="outline" asChild>
              <Link to="/" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Home
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={handleReportError}
              disabled={isSubmittingReport}
              className="flex items-center gap-2"
            >
              <Bug className="h-4 w-4" />
              {isSubmittingReport ? "Submitting..." : "Report Issue"}
            </Button>
          </div>

          {import.meta.env.DEV && (
            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="text-muted-foreground"
              >
                {showDetails ? "Hide" : "Show"} Technical Details
              </Button>
            </div>
          )}

          {showDetails && import.meta.env.DEV && (
            <div className="mt-4 p-4 bg-muted rounded-lg text-sm">
              <div className="space-y-2">
                <div>
                  <strong>Error:</strong>
                  <pre className="mt-1 whitespace-pre-wrap break-words text-xs">
                    {error?.message || "Unknown error"}
                  </pre>
                </div>
                {error?.stack && (
                  <div>
                    <strong>Stack Trace:</strong>
                    <pre className="mt-1 whitespace-pre-wrap break-words text-xs max-h-40 overflow-y-auto">
                      {error.stack}
                    </pre>
                  </div>
                )}
                {errorInfo?.componentStack && (
                  <div>
                    <strong>Component Stack:</strong>
                    <pre className="mt-1 whitespace-pre-wrap break-words text-xs max-h-40 overflow-y-auto">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="text-center text-sm text-muted-foreground">
            <p>If this problem persists, please contact support.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  resetError,
}) => {
  const [showDetails, setShowDetails] = React.useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = React.useState(false);
  const { submitFeedback } = useFeedbackActions();
  const companyId = useCompanyFromUrl();
  const { data: profile } = useProfile();

  // Determine fallback route based on subscription tier and company ID
  const isEnterprise = profile?.subscription_tier === "enterprise";
  const fallbackRoute = companyId
    ? `/${companyId}/dashboard`
    : isEnterprise
      ? "/enterprise-welcome"
      : "/select-company";
  const fallbackButtonText = companyId
    ? "Go to Dashboard"
    : isEnterprise
      ? "Go to Welcome"
      : "Select Company";

  const handleReportError = async () => {
    setIsSubmittingReport(true);

    // Create detailed error message for the feedback
    const errorDetails = `
**Automatic Error Report**

**Error Message:** ${error?.message || "Unknown error"}

**Timestamp:** ${new Date().toISOString()}

**User Agent:** ${navigator.userAgent}

**Current URL:** ${window.location.href}

**Error Stack:**
\`\`\`
${error?.stack || "No stack trace available"}
\`\`\`

**Component Stack:**
\`\`\`
${errorInfo?.componentStack || "No component stack available"}
\`\`\`

This error report was automatically generated from the application error boundary.
    `.trim();

    try {
      await submitFeedback({
        message: errorDetails,
        type: "bug",
        page_url: window.location.href,
      });

      toast.success("Error report submitted successfully. Thank you!");
    } catch (submitError) {
      console.error("Failed to submit error report:", submitError);
      try {
        // Fallback to clipboard copy if submission fails
        await navigator.clipboard.writeText(errorDetails);
        toast.warning(
          "Report submission failed, but error details copied to clipboard"
        );
      } catch (clipboardError) {
        console.error("Failed to copy to clipboard:", clipboardError);
        toast.error("Failed to submit error report");
      }
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-16 w-16 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Something went wrong</CardTitle>
          <CardDescription>
            We&apos;re sorry, but something unexpected happened. Our team has
            been notified.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button onClick={resetError} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            <Button variant="outline" asChild>
              <Link to={fallbackRoute} className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                {fallbackButtonText}
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={handleReportError}
              disabled={isSubmittingReport}
              className="flex items-center gap-2"
            >
              <Bug className="h-4 w-4" />
              {isSubmittingReport ? "Submitting..." : "Report Issue"}
            </Button>
          </div>

          {import.meta.env.DEV && (
            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="text-muted-foreground"
              >
                {showDetails ? "Hide" : "Show"} Technical Details
              </Button>
            </div>
          )}

          {showDetails && import.meta.env.DEV && (
            <div className="mt-4 p-4 bg-muted rounded-lg text-sm">
              <div className="space-y-2">
                <div>
                  <strong>Error:</strong>
                  <pre className="mt-1 whitespace-pre-wrap break-words text-xs">
                    {error?.message || "Unknown error"}
                  </pre>
                </div>
                {error?.stack && (
                  <div>
                    <strong>Stack Trace:</strong>
                    <pre className="mt-1 whitespace-pre-wrap break-words text-xs max-h-40 overflow-y-auto">
                      {error.stack}
                    </pre>
                  </div>
                )}
                {errorInfo?.componentStack && (
                  <div>
                    <strong>Component Stack:</strong>
                    <pre className="mt-1 whitespace-pre-wrap break-words text-xs max-h-40 overflow-y-auto">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="text-center text-sm text-muted-foreground">
            <p>If this problem persists, please contact support.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error for monitoring
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // In production, send to error reporting service
    if (import.meta.env.DEV) {
      // Example: Sentry, LogRocket, etc.
      // Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      const ErrorFallbackComponent =
        this.props.fallback || DefaultErrorFallback;

      return (
        <ErrorFallbackComponent
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

// Hook for functional components to trigger error boundary
export const useErrorHandler = () => {
  return React.useCallback((error: Error) => {
    throw error;
  }, []);
};

// Higher-order component for easy wrapping
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<ErrorFallbackProps>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
};

export { PublicErrorFallback };

export default ErrorBoundary;
