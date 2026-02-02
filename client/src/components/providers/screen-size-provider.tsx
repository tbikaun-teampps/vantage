import { useEffect, useState } from "react";

interface ScreenSizeProviderProps {
  children: React.ReactNode;
}

export function ScreenSizeProvider({ children }: ScreenSizeProviderProps) {
  const [isDesktop, setIsDesktop] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const checkScreenSize = () => {
      // Consider desktop as 1024px and above (lg breakpoint)
      setIsDesktop(window.innerWidth >= 1024);
    };

    // Check on mount
    checkScreenSize();

    // Add event listener for resize
    window.addEventListener("resize", checkScreenSize);

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Don't render anything on server side to avoid hydration mismatch
  if (!isClient) {
    return <>{children}</>;
  }

  // Show mobile message if screen is too small
  if (!isDesktop) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md mx-auto text-center space-y-6">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="relative w-32 h-12">
              <img
                src="/assets/logos/vantage-logo.svg"
                alt="Vantage Logo"
                className="w-full h-full object-contain dark:hidden"
              />
              <img
                src="/assets/logos/vantage-logo-white.png"
                alt="Vantage Logo"
                className="w-full h-full object-contain hidden dark:block"
              />
            </div>
          </div>

          {/* Message */}
          <div className="space-y-3">
            <h1 className="text-2xl font-bold tracking-tight">
              Desktop Required
            </h1>
            <p className="text-muted-foreground">
              Vantage requires a desktop to provide the best experience.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
