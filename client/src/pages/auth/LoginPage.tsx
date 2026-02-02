import { LoginForm } from "@/components/login-form";
import { ThemeModeToggle } from "@/components/theme-mode-toggle";
import { usePageTitle } from "@/hooks/usePageTitle";
import { HexagonalBackground } from "@/components/hexagonal-bg";

export function LoginPage() {
  usePageTitle("Sign In");
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="absolute top-6 right-6 z-20 flex items-center gap-4">
        <ThemeModeToggle />
      </div>
      <HexagonalBackground />
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
