import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { BRAND_COLORS } from "@/lib/brand";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "minimal" | "card";
  showLogo?: boolean;
  className?: string;
}

export function LoadingSpinner({
  message = "Loading...",
  size = "md",
  variant = "default",
  showLogo = true,
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "gap-2",
    md: "gap-3", 
    lg: "gap-4"
  };

  const spinnerSizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };

  const logoSizes = {
    sm: { width: 24, height: 24 },
    md: { width: 32, height: 32 },
    lg: { width: 48, height: 48 }
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center justify-center", sizeClasses[size], className)}>
        <Loader2 
          className={cn(spinnerSizes[size], "animate-spin")} 
          style={{ color: BRAND_COLORS.royalBlue }}
        />
        <span className={cn("text-muted-foreground", textSizes[size])}>
          {message}
        </span>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={cn("flex items-center justify-center min-h-[200px] relative", className)}>
        {/* Hexagonal pattern background */}
        <div className="absolute inset-0 opacity-20">
          <svg
            className="w-full h-full"
            viewBox="0 0 400 300"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <pattern
                id="hex-pattern-loading-card"
                x="0"
                y="0"
                width="60"
                height="52"
                patternUnits="userSpaceOnUse"
              >
                <g
                  fill="none"
                  stroke={BRAND_COLORS.royalBlue}
                  strokeWidth="1"
                  opacity="0.3"
                >
                  <polygon points="15,1 45,1 60,26 45,51 15,51 0,26" />
                </g>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hex-pattern-loading-card)" />
          </svg>
        </div>
        
        <div className={cn("text-center space-y-4 relative z-10", sizeClasses[size])}>
          {showLogo && (
            <div className="flex justify-center">
              <img
                src="/assets/logos/vantage-logo.svg"
                width={logoSizes[size].width}
                height={logoSizes[size].height}
                alt="Vantage"
                className="animate-pulse"
              />
            </div>
          )}
          <div className={cn("flex items-center justify-center", sizeClasses[size])}>
            <Loader2 
              className={cn(spinnerSizes[size], "animate-spin")} 
              style={{ color: BRAND_COLORS.royalBlue }}
            />
            <span className={cn("text-muted-foreground font-medium", textSizes[size])}>
              {message}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn("flex items-center justify-center", sizeClasses[size], className)}>
      {showLogo && (
        <img
          src="/assets/logos/vantage-logo.svg"
          width={logoSizes[size].width}
          height={logoSizes[size].height}
          alt="Vantage"
          className="animate-pulse"
        />
      )}
      <Loader2 
        className={cn(spinnerSizes[size], "animate-spin")} 
        style={{ color: BRAND_COLORS.royalBlue }}
      />
      <span className={cn("text-muted-foreground font-medium", textSizes[size])}>
        {message}
      </span>
    </div>
  );
}

// Legacy export for backward compatibility
export function Loader() {
  return <LoadingSpinner />;
}
