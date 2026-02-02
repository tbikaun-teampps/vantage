import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  IconLoader,
  IconLock,
  IconMail,
  IconUsers,
  IconDatabase,
  IconHelp,
} from "@tabler/icons-react";
import { HexagonalBackground } from "../hexagonal-bg";
import { ThemeModeToggle } from "../theme-mode-toggle";

type AccessType = "interview" | "data";

interface AccessCodeFormProps {
  id: string;
  onSuccess: (code: string, email: string) => void;
  isLoading?: boolean;
  error: string | null;
  accessType?: AccessType;
  initialEmail?: string;
  initialAccessCode?: string;
}

export function AccessCodeForm({
  id,
  onSuccess,
  isLoading = false,
  error,
  accessType = "interview",
  initialEmail = "",
  initialAccessCode = "",
}: AccessCodeFormProps) {
  const [accessCode, setAccessCode] = useState(initialAccessCode);
  const [email, setEmail] = useState(initialEmail);

  // Context-specific content
  const getContent = () => {
    switch (accessType) {
      case "data":
        return {
          icon: IconDatabase,
          title: "Data Portal Access",
          description:
            "Enter your access code and email address to upload assessment data",
          buttonText: "Access Data Portal",
          idLabel: "Portal ID",
        };
      case "interview":
      default:
        return {
          icon: IconUsers,
          title: "Interview Access",
          description:
            "Please enter your access code and email address to access this interview",
          buttonText: "Access Interview",
          idLabel: "Interview ID",
        };
    }
  };

  const content = getContent();

  // Generate support email mailto link with pre-filled context
  const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL || "support@teampps.com.au";
  const mailtoLink = `mailto:${supportEmail}?subject=${encodeURIComponent(
    `${accessType === "data" ? "Data Portal" : "Interview"} Access Issue - ID: ${id}`
  )}&body=${encodeURIComponent(
    `Hello,\n\nI'm having trouble accessing ${accessType === "data" ? "the data portal" : "my interview"}.\n\n${accessType === "data" ? "Portal" : "Interview"} ID: ${id}\n${email ? `Email: ${email}\n` : ""}\nIssue:\n[Please describe your issue here]\n\nThank you`
  )}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!accessCode.trim() || !email.trim()) {
      return;
    }

    onSuccess(accessCode.trim(), email.trim());
  };

  const isValid = accessCode.trim().length > 0 && email.trim().length > 0;

  return (
    <>
      <HexagonalBackground />
      {/* Header with theme toggle */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-4">
        <ThemeModeToggle />
      </div>
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex flex-col items-center gap-2 mb-4">
              <img
                src="/assets/logos/vantage-logo-white.png"
                alt="Vantage Logo"
                className="hidden dark:block"
                width={64}
                height={64}
              />
              <img
                src="/assets/logos/vantage-logo.svg"
                alt="Vantage Logo"
                className="block dark:hidden"
                width={64}
                height={64}
              />
            </div>
            <CardTitle className="text-2xl">{content.title}</CardTitle>
            <CardDescription>{content.description}</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="access-code">Access Code</Label>
                <div className="relative">
                  <IconLock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="access-code"
                    type="text"
                    placeholder="Enter access code"
                    value={accessCode}
                    onChange={(e) =>
                      setAccessCode(e.target.value.toUpperCase())
                    }
                    className="pl-10"
                    disabled={isLoading}
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <IconMail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={!isValid || isLoading}
              >
                {isLoading ? (
                  <>
                    <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  content.buttonText
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground space-y-3">
              <p>
                {content.idLabel}: <code className="font-mono">{id}</code>
              </p>

              <div className="pt-3 border-t">
                <a
                  href={mailtoLink}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <IconHelp className="h-4 w-4" />
                  <span>Need help? Contact support</span>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
