import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconHome, IconArrowLeft } from "@tabler/icons-react";
import { HexagonalBackground } from "@/components/hexagonal-bg";
import { ThemeModeToggle } from "@/components/theme-mode-toggle";

export function PageNotFound() {
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
            <CardTitle className="text-2xl">Page Not Found</CardTitle>
            <CardDescription>
              The page you're looking for doesn't exist or may have been moved.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="text-center text-6xl font-bold text-muted-foreground mb-4">
              404
            </div>
            
            <div className="flex flex-col gap-3">
              <Button asChild className="w-full">
                <Link to="/">
                  <IconHome className="mr-2 h-4 w-4" />
                  Go Home
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="w-full">
                <Link to="#" onClick={() => window.history.back()}>
                  <IconArrowLeft className="mr-2 h-4 w-4" />
                  Go Back
                </Link>
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground pt-4">
              <p>
                If you believe this is an error, please contact support
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}